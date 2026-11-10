import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'login_page.dart';
import 'verify_email_page.dart';
import '../../services/api_service.dart';
import '../../widgets/address_dropdown.dart';
import '../../theme/app_theme.dart';
import '../../theme/mimoo_brand.dart';
import '../../widgets/auth_layout.dart';
import '../../widgets/motion.dart';
import '../../utils/animations.dart';

const _kPrimary = MimooBrand.primary;
const _kBorder = MimooBrand.border;
const _kText = MimooBrand.text;
const _kSubtext = MimooBrand.subtext;

// ── Step labels ───────────────────────────────────────────────────────────────
// Sections of the form (one per step; each validates before moving on).
const _steps = ['Personal info', 'Address', 'Contact', 'Password'];

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  int _step = 0;
  bool _loading = false;
  String? _error; // inline error (validation / API)
  int _shake = 0; // bumped on every error → shake animation

  // Step 1 — Personal info
  final _detailsKey = GlobalKey<FormState>();
  final _lastNameCtrl = TextEditingController();
  final _firstNameCtrl = TextEditingController();
  final _miCtrl = TextEditingController();
  String _sex = 'male'; // lowercase, matches API: 'male' | 'female'
  DateTime? _birthday;
  int? _age;

  // Step 2 — Address
  final _addressKey = GlobalKey<FormState>();
  // PSGC-backed address values (set by AddressDropdown callbacks)
  String _region = '';
  String? _province; // null for NCR
  String? _district; // NCR only
  String _municipalityCity = '';
  String _barangay = '';
  final _streetCtrl = TextEditingController();
  final _houseCtrl = TextEditingController();

  // Step 3 — Verification
  final _verifyKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _contactCtrl = TextEditingController();
  String? _uploadedId;

  // Step 4 — Security
  final _securityKey = GlobalKey<FormState>();
  final _passCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();
  bool _obscurePass = true;
  bool _obscureConfirm = true;
  bool _agreedToTerms = false;

  @override
  void dispose() {
    _lastNameCtrl.dispose();
    _firstNameCtrl.dispose();
    _miCtrl.dispose();
    _streetCtrl.dispose();
    _houseCtrl.dispose();
    _emailCtrl.dispose();
    _contactCtrl.dispose();
    _passCtrl.dispose();
    _confirmPassCtrl.dispose();
    super.dispose();
  }

  // ── Birthday picker ──────────────────────────────────────────────────────────
  Future<void> _pickBirthday() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 18, now.month, now.day),
      firstDate: DateTime(1900),
      lastDate: DateTime(now.year - 10, now.month, now.day),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme:
              Theme.of(context).colorScheme.copyWith(primary: _kPrimary),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      final age = now.year -
          picked.year -
          ((now.month < picked.month ||
                  (now.month == picked.month && now.day < picked.day))
              ? 1
              : 0);
      setState(() {
        _birthday = picked;
        _age = age;
      });
    }
  }

  // ── Navigation ───────────────────────────────────────────────────────────────
  void _next() {
    GlobalKey<FormState>? key;
    if (_step == 0) key = _detailsKey;
    if (_step == 1) key = _addressKey;
    if (_step == 2) key = _verifyKey;
    if (_step == 3) key = _securityKey;

    if (key != null && !(key.currentState?.validate() ?? false)) {
      setState(() => _shake++);
      return;
    }

    // Extra validation for step 1 birthday
    setState(() => _error = null);
    if (_step == 0 && _birthday == null) {
      setState(() {
        _shake++;
        _error = 'Please select your birthday.';
      });
      return;
    }

    // Extra validation for step 2: address dropdowns are not inside a Form
    if (_step == 1) {
      if (_region.isEmpty || _municipalityCity.isEmpty || _barangay.isEmpty) {
        setState(() {
          _shake++;
          _error = 'Please complete all address fields (region, city, barangay).';
        });
        return;
      }
    }

    if (_step == 3 && !_agreedToTerms) {
      setState(() {
        _shake++;
        _error = 'Please agree to the Terms of Service and Privacy Policy.';
      });
      return;
    }

    if (_step < 3) {
      setState(() => _step++);
    } else {
      _submit();
    }
  }

  void _back() {
    if (_step > 0) {
      setState(() {
        _step--;
        _error = null;
      });
    } else if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    }
  }

  Future<void> _submit() async {
    if (_loading) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    // Build street_address: "<house>, <street>" when both filled; otherwise
    // whichever is non-empty, matching the web's single street_address field.
    final house = _houseCtrl.text.trim();
    final street = _streetCtrl.text.trim();
    final streetAddress = (house.isNotEmpty && street.isNotEmpty)
        ? '$house, $street'
        : (house.isNotEmpty ? house : street);

    try {
      final res = await ApiService.post(
        '/buyer/register',
        body: {
          'first_name': _firstNameCtrl.text.trim(),
          'last_name': _lastNameCtrl.text.trim(),
          if (_miCtrl.text.trim().isNotEmpty)
            'middle_initial': _miCtrl.text.trim(),
          'sex': _sex, // already lowercase: 'male' | 'female'
          'email': _emailCtrl.text.trim().toLowerCase(),
          'mobile': _contactCtrl.text.trim(),
          'date_of_birth': _birthday != null
              ? '${_birthday!.year}-'
                  '${_birthday!.month.toString().padLeft(2, '0')}-'
                  '${_birthday!.day.toString().padLeft(2, '0')}'
              : '',
          // Address — plain text names from PSGC API (same as web)
          'region': _region,
          if (_province != null) 'province': _province,
          if (_district != null) 'district': _district,
          'municipality_city': _municipalityCity,
          'barangay': _barangay,
          'street_address': streetAddress,
          // Security
          'password': _passCtrl.text,
          'password_confirmation': _confirmPassCtrl.text,
          'terms_accepted': true,
          // id_document intentionally omitted — API accepts null for mobile
        },
        includeAuth: false,
      );

      if (!mounted) return;

      final email = (res['data']?['email'] as String?) ??
          _emailCtrl.text.trim().toLowerCase();

      // Success feedback, then the existing navigation to OTP verification.
      await showSuccessCheck(context, 'Account created!');
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MimooPageRoute(builder: (_) => VerifyEmailPage(email: email)),
        (route) => false,
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      // Build a readable message from field-level errors if present
      String displayMsg = e.message;
      if (e.errors != null && e.errors!.isNotEmpty) {
        final fieldLines = e.errors!.entries
            .map((entry) => '• ${entry.value.first}')
            .join('\n');
        displayMsg = fieldLines;
      }
      setState(() {
        _shake++;
        _error = displayMsg;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _shake++;
        _error = ApiService.friendlyError(e);
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final last = _step == _steps.length - 1;
    return MimooAuthLayout(
      compactHeader: true,
      onBack: (_step > 0 || Navigator.of(context).canPop()) ? _back : null,
      // Sticky primary action
      bottomBar: SafeArea(
        top: false,
        child: Container(
          color: MimooBrand.surface,
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
          // heightFactor: 1 — a plain Center here expands to the full
          // Scaffold height and hides the whole form (the "missing page" bug).
          child: Align(
            heightFactor: 1,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 448),
              child: MimooPrimaryButton(
                label: last ? 'Create account' : 'Next',
                loading: _loading,
                onPressed: _next,
              ),
            ),
          ),
        ),
      ),
      card: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Create your account',
              style: mimooText(size: 22, weight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text('Step ${_step + 1} of ${_steps.length} · ${_steps[_step]}',
              style: mimooText(size: 12.5, color: MimooBrand.subtext)),
          const SizedBox(height: 14),
          _StepIndicator(currentStep: _step, steps: _steps),
          const SizedBox(height: 20),
          // Each section fades/slides in; shakes on validation/API error.
          ShakeOnChange(
            trigger: _shake,
            // Keyed by step: each section fades/slides in fresh. (No
            // AnimatedSwitcher — old+new steps would briefly coexist and
            // duplicate the per-step Form GlobalKeys on a quick Back.)
            child: KeyedSubtree(
              key: ValueKey('reg-step-$_step'),
              child: StaggeredItem(index: 0, child: _buildStep()),
            ),
          ),
          AnimatedReveal(
            child: _error == null
                ? null
                : MimooInlineError(_error!, key: ValueKey(_error)),
          ),
        ],
      ),
      below: Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Text('Already have an account? ',
              style: mimooText(size: 13, color: MimooBrand.subtext)),
          GestureDetector(
            onTap: () => Navigator.pushReplacement(
              context,
              MimooPageRoute(builder: (_) => const LoginPage()),
            ),
            child: Text('Sign in',
                style: mimooText(
                    size: 13, weight: FontWeight.w800, color: MimooBrand.primary)),
          ),
        ],
      ),
    );
  }

  // ── Build current step content ────────────────────────────────────────────

  Widget _buildStep() {
    switch (_step) {
      case 0:
        return _buildDetails();
      case 1:
        return _buildAddress();
      case 2:
        return _buildVerification();
      case 3:
        return _buildSecurity();
      default:
        return const SizedBox();
    }
  }

  // ── Step 1: Personal Information ─────────────────────────────────────────

  Widget _buildDetails() {
    return Form(
      key: _detailsKey,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Personal info',
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: _kText,
                  height: 1.2)),
          const SizedBox(height: 4),
          Text('Please enter your basic profile information',
              style:
                  GoogleFonts.plusJakartaSans(fontSize: 13, color: _kSubtext)),
          const SizedBox(height: 16),

          // Last name
          _MimooField(
            controller: _lastNameCtrl,
            label: 'LAST NAME',
            textInputAction: TextInputAction.next,
            textCapitalization: TextCapitalization.words,
            validator: (v) => (v == null || v.trim().isEmpty)
                ? 'Last name is required'
                : null,
          ),
          const SizedBox(height: 12),

          // First name + M.I. row
          Row(
            children: [
              Expanded(
                flex: 3,
                child: _MimooField(
                  controller: _firstNameCtrl,
                  label: 'FIRST NAME',
                  textInputAction: TextInputAction.next,
                  textCapitalization: TextCapitalization.words,
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                flex: 1,
                child: _MimooField(
                  controller: _miCtrl,
                  label: 'M.I.',
                  textInputAction: TextInputAction.next,
                  textCapitalization: TextCapitalization.characters,
                  maxLength: 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Sex radio — only 'male' and 'female' (lowercase), matching the API
          _FieldBox(
            label: 'SEX',
            child: Row(
              children: ['female', 'male'].map((option) {
                return Padding(
                  padding: const EdgeInsets.only(right: 16),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(
                        width: 24,
                        height: 24,
                        child: Radio<String>(
                          value: option,
                          groupValue: _sex,
                          activeColor: _kPrimary,
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                          visualDensity: VisualDensity.compact,
                          onChanged: (v) {
                            if (v != null) setState(() => _sex = v);
                          },
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                          // Display capitalized; send lowercase to API
                          option[0].toUpperCase() + option.substring(1),
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 13, color: _kText)),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 12),

          // Birthday + Age row
          Row(
            children: [
              // Birthday
              Expanded(
                flex: 3,
                child: GestureDetector(
                  onTap: _pickBirthday,
                  child: _FieldBox(
                    label: 'BIRTHDAY',
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            _birthday == null
                                ? 'DD/MM/YYYY'
                                : '${_birthday!.day.toString().padLeft(2, '0')}/'
                                    '${_birthday!.month.toString().padLeft(2, '0')}/'
                                    '${_birthday!.year}',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 14,
                              color: _birthday == null ? _kSubtext : _kText,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        Icon(Icons.calendar_today_outlined,
                            size: 16, color: _kSubtext),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Age (auto)
              Expanded(
                flex: 2,
                child: _FieldBox(
                  label: 'AGE (AUTO)',
                  bgColor: const Color(0xFFF0EEF8),
                  child: Text(
                    _age != null ? '${_age!} yrs' : '—',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: _kPrimary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Step 2: Address ─────────────────────────────────────────────────────────

  Widget _buildAddress() {
    return Form(
      key: _addressKey,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Address',
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 17, fontWeight: FontWeight.w800, color: _kText)),
          const SizedBox(height: 4),
          Text('Enter your delivery address',
              style:
                  GoogleFonts.plusJakartaSans(fontSize: 13, color: _kSubtext)),
          const SizedBox(height: 16),
          // PSGC-backed address selector.
          // The callback uses named params; _region maps to `region` (not
          // province — the old widget misnamed it).
          AddressDropdown(
            onChanged: ({
              required String region,
              String? province,
              String? district,
              required String municipalityCity,
              required String barangay,
            }) {
              setState(() {
                _region = region;
                _province = province;
                _district = district;
                _municipalityCity = municipalityCity;
                _barangay = barangay;
              });
            },
          ),
          const SizedBox(height: 4),
          _MimooField(
            controller: _streetCtrl,
            label: 'STREET',
            textInputAction: TextInputAction.next,
            textCapitalization: TextCapitalization.words,
          ),
          const SizedBox(height: 12),
          _MimooField(
            controller: _houseCtrl,
            label: 'HOUSE / UNIT NUMBER',
            textInputAction: TextInputAction.done,
          ),
        ],
      ),
    );
  }

  // ── Step 3: Verification ────────────────────────────────────────────────────

  Widget _buildVerification() {
    return Form(
      key: _verifyKey,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Contact',
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 17, fontWeight: FontWeight.w800, color: _kText)),
          const SizedBox(height: 4),
          Text('Contact info & identity document',
              style:
                  GoogleFonts.plusJakartaSans(fontSize: 13, color: _kSubtext)),
          const SizedBox(height: 16),
          _MimooField(
            controller: _emailCtrl,
            label: 'EMAIL',
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            validator: (v) {
              if (v == null || v.trim().isEmpty) {
                return 'Email is required';
              }
              if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(v)) {
                return 'Enter a valid email';
              }
              return null;
            },
          ),
          const SizedBox(height: 12),
          _MimooField(
            controller: _contactCtrl,
            label: 'CONTACT NUMBER',
            keyboardType: TextInputType.phone,
            textInputAction: TextInputAction.done,
            validator: (v) =>
                (v == null || v.trim().isEmpty) ? 'Required' : null,
          ),
          const SizedBox(height: 20),
          Text('Valid ID (optional now)',
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 13, fontWeight: FontWeight.w700, color: _kText)),
          const SizedBox(height: 4),
          Text(
              'You can upload your government-issued ID later from your profile.',
              style:
                  GoogleFonts.plusJakartaSans(fontSize: 12, color: _kSubtext)),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: () => setState(() => _uploadedId = 'id_document.jpg'),
            child: Container(
              width: double.infinity,
              height: 100,
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(
                    color: _uploadedId != null ? _kPrimary : _kBorder),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _uploadedId != null
                        ? Icons.check_circle_outline
                        : Icons.upload_file_outlined,
                    color: _uploadedId != null ? _kPrimary : _kSubtext,
                    size: 28,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _uploadedId != null
                        ? 'ID noted — upload after registration'
                        : 'Tap to mark (upload later)',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 13,
                      color: _uploadedId != null ? _kPrimary : _kSubtext,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Step 4: Security ────────────────────────────────────────────────────────

  Widget _buildSecurity() {
    return Form(
      key: _securityKey,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Password',
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 17, fontWeight: FontWeight.w800, color: _kText)),
          const SizedBox(height: 4),
          Text('Create a strong password for your account',
              style:
                  GoogleFonts.plusJakartaSans(fontSize: 13, color: _kSubtext)),
          const SizedBox(height: 16),
          _MimooField(
            controller: _passCtrl,
            label: 'PASSWORD',
            obscureText: _obscurePass,
            textInputAction: TextInputAction.next,
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePass
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                color: _kSubtext,
                size: 18,
              ),
              onPressed: () => setState(() => _obscurePass = !_obscurePass),
            ),
            validator: (v) {
              if (v == null || v.isEmpty) {
                return 'Password is required';
              }
              if (v.length < 8) {
                return 'Minimum 8 characters';
              }
              return null;
            },
          ),
          _PasswordStrength(controller: _passCtrl),
          const SizedBox(height: 12),
          _MimooField(
            controller: _confirmPassCtrl,
            label: 'CONFIRM PASSWORD',
            obscureText: _obscureConfirm,
            textInputAction: TextInputAction.done,
            suffixIcon: IconButton(
              icon: Icon(
                _obscureConfirm
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                color: _kSubtext,
                size: 18,
              ),
              onPressed: () =>
                  setState(() => _obscureConfirm = !_obscureConfirm),
            ),
            validator: (v) {
              if (v == null || v.isEmpty) {
                return 'Please confirm password';
              }
              if (v != _passCtrl.text) {
                return 'Passwords do not match';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          _TermsCheckbox(
            value: _agreedToTerms,
            onChanged: (v) => setState(() {
              _agreedToTerms = v;
              if (v) _error = null;
            }),
          ),
        ],
      ),
    );
  }
}

// ── Password strength ─────────────────────────────────────────────────────────

/// 0–4 score from length and character variety (UI hint only; the server
/// rule is unchanged: minimum 8 characters).
int _passwordScore(String p) {
  if (p.isEmpty) return 0;
  var score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (RegExp(r'[A-Z]').hasMatch(p) && RegExp(r'[a-z]').hasMatch(p)) score++;
  if (RegExp(r'\d').hasMatch(p)) score++;
  if (RegExp(r'[^A-Za-z0-9]').hasMatch(p)) score++;
  if (p.length < 8) score = score.clamp(0, 1);
  return score.clamp(0, 4);
}

class _PasswordStrength extends StatelessWidget {
  const _PasswordStrength({required this.controller});
  final TextEditingController controller;

  static const _labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  static const _colors = [
    AppColors.error,
    AppColors.flash,
    AppColors.warning,
    AppColors.accent,
    AppColors.success,
  ];

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<TextEditingValue>(
      valueListenable: controller,
      builder: (_, v, __) {
        if (v.text.isEmpty) return const SizedBox(height: 4);
        final score = _passwordScore(v.text);
        final color = _colors[score];
        return Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Row(children: [
            Expanded(
              child: Row(
                children: List.generate(4, (i) {
                  return Expanded(
                    child: AnimatedContainer(
                      duration: AppDurations.fast,
                      height: 4,
                      margin: EdgeInsets.only(right: i < 3 ? 4 : 0),
                      decoration: BoxDecoration(
                        color: i < score ? color : AppColors.border,
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                      ),
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(width: 10),
            Text('Strength: ${_labels[score]}',
                style: AppText.style(
                    size: 11.5, weight: FontWeight.w700, color: color)),
          ]),
        );
      },
    );
  }
}

class _TermsCheckbox extends StatelessWidget {
  const _TermsCheckbox({required this.value, required this.onChanged});
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    final link = AppText.style(
        size: 12.5, weight: FontWeight.w700, color: AppColors.accent);
    return InkWell(
      borderRadius: BorderRadius.circular(AppRadius.sm),
      onTap: () => onChanged(!value),
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: AppSpacing.tap),
        child: Row(
          children: [
            Checkbox(value: value, onChanged: (v) => onChanged(v ?? false)),
            Expanded(
              child: Text.rich(
                TextSpan(
                  style: AppText.style(size: 12.5, color: AppColors.textMuted),
                  children: [
                    const TextSpan(text: 'I agree to the '),
                    TextSpan(text: 'Terms of Service', style: link),
                    const TextSpan(text: ' and '),
                    TextSpan(text: 'Privacy Policy', style: link),
                    const TextSpan(text: '.'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}


// ── Step Indicator ────────────────────────────────────────────────────────────

class _StepIndicator extends StatelessWidget {
  const _StepIndicator({required this.currentStep, required this.steps});
  final int currentStep;
  final List<String> steps;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Progress line
        Row(
          children: List.generate(steps.length, (i) {
            final isActive = i <= currentStep;
            return Expanded(
              child: Container(
                height: 3,
                margin: EdgeInsets.only(right: i < steps.length - 1 ? 4 : 0),
                decoration: BoxDecoration(
                  color: isActive ? _kPrimary : _kBorder,
                  borderRadius: BorderRadius.circular(9999),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 8),
        // Labels
        Row(
          children: List.generate(steps.length, (i) {
            final isActive = i == currentStep;
            return Expanded(
              child: Text(
                '${i + 1} ${steps[i]}',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 11,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w400,
                  color: isActive ? _kPrimary : _kSubtext,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            );
          }),
        ),
      ],
    );
  }
}

// ── Field Box (label + content, not a TextFormField) ─────────────────────────

class _FieldBox extends StatelessWidget {
  const _FieldBox({
    required this.label,
    required this.child,
    this.bgColor = MimooBrand.inputFill,
  });
  final String label;
  final Widget child;
  final Color bgColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 8, 14, 10),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: _kSubtext,
                  letterSpacing: 0.5)),
          const SizedBox(height: 4),
          child,
        ],
      ),
    );
  }
}

// ── Reusable text field ───────────────────────────────────────────────────────

class _MimooField extends StatelessWidget {
  const _MimooField({
    required this.controller,
    required this.label,
    this.keyboardType,
    this.textInputAction,
    this.textCapitalization = TextCapitalization.none,
    this.obscureText = false,
    this.suffixIcon,
    this.validator,
    this.maxLength,
  });

  final TextEditingController controller;
  final String label;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final TextCapitalization textCapitalization;
  final bool obscureText;
  final Widget? suffixIcon;
  final String? Function(String?)? validator;
  final int? maxLength;

  @override
  Widget build(BuildContext context) {
    // Soft accent glow while focused (same as Login).
    return FocusGlow(child: TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      textCapitalization: textCapitalization,
      obscureText: obscureText,
      validator: validator,
      maxLength: maxLength,
      style: GoogleFonts.plusJakartaSans(
          fontSize: 14, color: _kText, fontWeight: FontWeight.w500),
      // Same input style as the Login page.
      decoration: mimooInputDecoration(label: label, suffix: suffixIcon),
    ));
  }
}
