import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/api_service.dart';
import '../../widgets/auth_layout.dart';
import '../../widgets/motion.dart';
import '../../utils/animations.dart';
import 'login_page.dart';
import '../../theme/app_theme.dart';

// ── Design tokens (identical to login_page.dart) ──────────────────────────────
const _kPrimary = AppColors.primaryMid;
const _kSurface = AppColors.surface;
const _kBorder = AppColors.border;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;
const _kAccent = AppColors.accent;

class VerifyEmailPage extends StatefulWidget {
  const VerifyEmailPage({super.key, required this.email});

  /// The email address that was just registered — displayed to the user and
  /// sent with every verify/resend request.
  final String email;

  @override
  State<VerifyEmailPage> createState() => _VerifyEmailPageState();
}

class _VerifyEmailPageState extends State<VerifyEmailPage> {
  // ── 6 individual digit controllers ───────────────────────────────────────
  final List<TextEditingController> _digitCtrl =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  bool _verifying = false;
  bool _resending = false;

  // Resend cooldown
  static const _cooldownSeconds = 60;
  int _secondsLeft = 0;
  Timer? _timer;

  @override
  void dispose() {
    for (final c in _digitCtrl) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    _timer?.cancel();
    super.dispose();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  String get _code => _digitCtrl.map((c) => c.text.trim()).join();

  bool get _codeComplete => _code.length == 6;

  void _startCooldown() {
    _timer?.cancel();
    setState(() => _secondsLeft = _cooldownSeconds);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      setState(() => _secondsLeft--);
      if (_secondsLeft <= 0) t.cancel();
    });
  }

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content:
            Text(msg, style: GoogleFonts.plusJakartaSans(color: Colors.white)),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  // ── Verify ────────────────────────────────────────────────────────────────

  Future<void> _verify() async {
    if (!_codeComplete) {
      _showError('Please enter the complete 6-digit code.');
      return;
    }
    setState(() => _verifying = true);
    try {
      await ApiService.post(
        '/buyer/verify-email',
        body: {'email': widget.email, 'code': _code},
        includeAuth: false,
      );
      if (!mounted) return;
      // Animated success check, then go to Login (same flow as before).
      await showSuccessCheck(context, 'Email verified!');
      if (!mounted) return;
      // Navigate to LoginPage with a success snackbar
      Navigator.of(context).pushAndRemoveUntil(
        MimooPageRoute(builder: (_) => const LoginPage()),
        (route) => false,
      );
      // Show snackbar after navigation settles
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Email verified! You can now log in.',
              style: GoogleFonts.plusJakartaSans(color: Colors.white),
            ),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 4),
          ),
        );
      });
    } on ApiException catch (e) {
      _showError(e.errorFor('code') ?? e.message);
    } catch (_) {
      _showError('Network error. Please try again.');
    } finally {
      if (mounted) setState(() => _verifying = false);
    }
  }

  // ── Resend ────────────────────────────────────────────────────────────────

  Future<void> _resend() async {
    if (_secondsLeft > 0 || _resending) return;
    setState(() => _resending = true);
    try {
      await ApiService.post(
        '/buyer/resend-code',
        body: {'email': widget.email},
        includeAuth: false,
      );
      if (!mounted) return;
      _startCooldown();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('A new code has been sent to ${widget.email}.',
              style: GoogleFonts.plusJakartaSans(color: Colors.white)),
          backgroundColor: _kPrimary,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } on ApiException catch (e) {
      _showError(e.message);
    } catch (_) {
      _showError('Network error. Please try again.');
    } finally {
      if (mounted) setState(() => _resending = false);
    }
  }

  // ── OTP box builder ───────────────────────────────────────────────────────

  Widget _buildDigitBox(int index) {
    return SizedBox(
      width: 46,
      height: 56,
      child: TextFormField(
        controller: _digitCtrl[index],
        focusNode: _focusNodes[index],
        keyboardType: TextInputType.number,
        textAlign: TextAlign.center,
        maxLength: 1,
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        style: GoogleFonts.plusJakartaSans(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: _kText,
        ),
        decoration: InputDecoration(
          counterText: '',
          filled: true,
          fillColor: Colors.white,
          contentPadding: EdgeInsets.zero,
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: _kBorder),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: _kPrimary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: AppColors.error),
          ),
        ),
        onChanged: (value) {
          if (value.length == 1 && index < 5) {
            _focusNodes[index + 1].requestFocus();
          }
          // Handle paste: if someone pastes 6 digits into first box
          if (value.length == 6 && index == 0) {
            for (int i = 0; i < 6; i++) {
              _digitCtrl[i].text = value[i];
            }
            _focusNodes[5].requestFocus();
          }
          setState(() {});
        },
        onTap: () {
          // Select all on tap so re-typing is easy
          _digitCtrl[index].selection = TextSelection(
            baseOffset: 0,
            extentOffset: _digitCtrl[index].text.length,
          );
        },
      ),
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      body: Stack(
        children: [
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 12),

                  // Brand header (same as Login / Register)
                  const ClipRRect(
                    borderRadius: BorderRadius.all(Radius.circular(24)),
                    child: MimooAuthHeader(compact: true, bottomPadding: 16),
                  ),
                  const SizedBox(height: 20),

                  Text(
                    'Verify your email',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: _kText,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'We sent a 6-digit code to',
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 13, color: _kSubtext),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.email,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: _kAccent,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 36),

                  // ── OTP boxes ─────────────────────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: List.generate(6, _buildDigitBox),
                  ),
                  const SizedBox(height: 32),

                  // ── Verify button ─────────────────────────────────────
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: FilledButton(
                      onPressed:
                          (_verifying || !_codeComplete) ? null : _verify,
                      style: FilledButton.styleFrom(
                        backgroundColor: _kPrimary,
                        disabledBackgroundColor:
                            _kPrimary.withValues(alpha: 0.4),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _verifying
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : Text(
                              'Verify Email',
                              style: GoogleFonts.plusJakartaSans(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white),
                            ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // ── Resend ────────────────────────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text("Didn't receive a code? ",
                          style: GoogleFonts.plusJakartaSans(
                              fontSize: 13, color: _kSubtext)),
                      _resending
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: _kAccent),
                            )
                          : GestureDetector(
                              onTap: _secondsLeft > 0 ? null : _resend,
                              child: Text(
                                _secondsLeft > 0
                                    ? 'Resend in ${_secondsLeft}s'
                                    : 'Resend code',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color:
                                      _secondsLeft > 0 ? _kSubtext : _kAccent,
                                ),
                              ),
                            ),
                    ],
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
