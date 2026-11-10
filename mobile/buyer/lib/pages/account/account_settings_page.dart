import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../../state/auth_service.dart';
import '../../models/buyer_profile.dart';
import '../../services/profile_repository.dart';
import '../../services/api_service.dart';
import '../../widgets/address_dropdown.dart';
import '../landing_page.dart';
import '../../theme/app_theme.dart';
import '../../utils/animations.dart';

// Hidden widgets (_ProfileRow, _AddressCard) are kept for future use.
// ignore_for_file: unused_element_parameter

const _kPrimary = AppColors.primary;
const _kSecondary = AppColors.accent;
const _kFlash = AppColors.flash;
const _kSurface = AppColors.surface;
const _kCard = AppColors.card;
const _kChip = AppColors.chip;
const _kBorder = AppColors.border;
const _kText = AppColors.text;
const _kSubtext = AppColors.textMuted;
const _kGreen = AppColors.success;

TextStyle _pjs({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = _kText,
  double? height,
}) =>
    GoogleFonts.plusJakartaSans(
        fontSize: size, fontWeight: weight, color: color, height: height);

// ── Account Settings Page ─────────────────────────────────────────────────────
class AccountSettingsPage extends StatefulWidget {
  const AccountSettingsPage({super.key});

  @override
  State<AccountSettingsPage> createState() => _AccountSettingsPageState();
}

class _AccountSettingsPageState extends State<AccountSettingsPage> {
  bool _orderUpdates = true;
  bool _promoAlerts = true;
  bool _activityAlerts = false;
  bool _biometric = true;

  // ── Profile API state ─────────────────────────────────────────────────────
  BuyerProfile? _profile;
  bool _loadingProfile = true;
  String? _profileError;
  bool _saving = false;
  bool _photoUploading = false;

  // ── Editable controllers (pre-filled from profile) ────────────────────────
  late final TextEditingController _firstNameCtrl;
  late final TextEditingController _lastNameCtrl;
  late final TextEditingController _miCtrl;
  late final TextEditingController _streetCtrl;

  // Address dropdown selections
  String _region = '';
  String? _province;
  String? _district;
  String _municipalityCity = '';
  String _barangay = '';

  @override
  void initState() {
    super.initState();
    _firstNameCtrl = TextEditingController();
    _lastNameCtrl = TextEditingController();
    _miCtrl = TextEditingController();
    _streetCtrl = TextEditingController();
    _loadProfile();
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _miCtrl.dispose();
    _streetCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _loadingProfile = true;
      _profileError = null;
    });
    try {
      final p = await ProfileRepository.instance.fetchProfile();
      if (!mounted) return;
      _profile = p;
      _firstNameCtrl.text = p.firstName;
      _lastNameCtrl.text = p.lastName;
      _miCtrl.text = p.middleInitial ?? '';
      _streetCtrl.text = p.streetAddress ?? '';
      _region = p.region ?? '';
      _province = p.province;
      _district = p.district;
      _municipalityCity = p.municipalityCity ?? '';
      _barangay = p.barangay ?? '';
      setState(() => _loadingProfile = false);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _loadingProfile = false;
        _profileError = e.message;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loadingProfile = false;
        _profileError = ApiService.friendlyError(e);
      });
    }
  }

  Future<void> _save() async {
    if (_saving) return;
    setState(() => _saving = true);
    try {
      final fields = <String, dynamic>{
        'first_name': _firstNameCtrl.text.trim(),
        'last_name': _lastNameCtrl.text.trim(),
        if (_miCtrl.text.trim().isNotEmpty)
          'middle_initial': _miCtrl.text.trim(),
        // contact_number excluded — use Change Phone flow
        'street_address': _streetCtrl.text.trim(),
        if (_region.isNotEmpty) 'region': _region,
        if (_province != null) 'province': _province,
        if (_district != null) 'district': _district,
        if (_municipalityCity.isNotEmpty)
          'municipality_city': _municipalityCity,
        if (_barangay.isNotEmpty) 'barangay': _barangay,
      };
      final updated = await ProfileRepository.instance.updateProfile(fields);
      if (!mounted) return;
      _profile = updated;

      await AuthService.instance.persistLogin(
        token: ApiService.token ?? '',
        buyerName: updated.fullName,
        buyerId: updated.id.toString(),
        contactNumber: updated.contactNumber,
        streetAddress: updated.streetAddress,
        barangay: updated.barangay,
        municipalityCity: updated.municipalityCity,
        province: updated.province,
        region: updated.region,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Profile updated!',
            style:
                _pjs(size: 13, color: Colors.white, weight: FontWeight.w600)),
        backgroundColor: _kGreen,
        duration: const Duration(seconds: 2),
      ));
    } on ApiException catch (e) {
      if (!mounted) return;
      final msg = e.errors != null && e.errors!.isNotEmpty
          ? e.errors!.entries.map((en) => '• ${en.value.first}').join('\n')
          : e.message;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(msg, style: _pjs(size: 13, color: Colors.white)),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 5),
      ));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Network error. Please try again.',
            style: _pjs(size: 13, color: Colors.white)),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
      ));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
        backgroundColor: _kCard,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: _kText),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Account Settings',
            style: _pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: _loadingProfile
          ? const Center(child: CircularProgressIndicator())
          : _profileError != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.wifi_off_outlined,
                          size: 48, color: AppColors.outlineVariant),
                      const SizedBox(height: 12),
                      Text(_profileError!,
                          textAlign: TextAlign.center,
                          style: _pjs(size: 13, color: _kSubtext)),
                      const SizedBox(height: 12),
                      FilledButton.tonal(
                        onPressed: _loadProfile,
                        child: Text('Retry',
                            style: _pjs(size: 13, weight: FontWeight.w700)),
                      ),
                    ],
                  ),
                )
              : ListView(
                  padding: const EdgeInsets.only(bottom: 32),
                  children: [
                    for (final (i, w) in [
                      _buildProfileSection(),
                      _buildDeliveryAddresses(),
                      _buildAccountSecurity(),
                      _buildNotifications(),
                      _buildHelpSupport(),
                      _buildAccountActions(),
                    ].indexed) ...[
                      if (i > 0) SizedBox(height: i == 5 ? 24 : 12),
                      StaggeredItem(index: i, child: w),
                    ],
                  ],
                ),
      // Sticky "Save Changes" bar (only once the profile has loaded).
      bottomNavigationBar: (_loadingProfile || _profileError != null)
          ? null
          : Container(
              decoration: const BoxDecoration(
                color: AppColors.card,
                boxShadow: AppShadows.nav,
              ),
              padding: const EdgeInsets.only(top: 10, bottom: 10),
              child: SafeArea(top: false, child: _buildSaveButton()),
            ),
    );
  }

  // ── Profile ─────────────────────────────────────────────────────────────────
  Widget _buildProfileSection() {
    final p = _profile;
    final photoUrl = p?.profilePhotoUrl;
    return SettingsSectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Photo — tappable, shows real photo when uploaded
          Center(
            child: GestureDetector(
              onTap: _photoUploading ? null : _pickAndUploadPhoto,
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: _kChip,
                    backgroundImage: (photoUrl != null && photoUrl.isNotEmpty)
                        ? NetworkImage(photoUrl)
                        : null,
                    child: (photoUrl == null || photoUrl.isEmpty)
                        ? Icon(Icons.person, size: 46, color: _kPrimary)
                        : null,
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: _photoUploading ? _kSubtext : _kSecondary,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                      child: _photoUploading
                          ? const Padding(
                              padding: EdgeInsets.all(4),
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white))
                          : const Icon(Icons.camera_alt,
                              size: 13, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          // First name
          _buildTextField(_firstNameCtrl, 'FIRST NAME'),
          const Divider(color: _kBorder, height: 16),
          // Last name
          _buildTextField(_lastNameCtrl, 'LAST NAME'),
          const Divider(color: _kBorder, height: 16),
          // M.I.
          _buildTextField(_miCtrl, 'MIDDLE INITIAL', maxLength: 1),
          const Divider(color: _kBorder, height: 16),
          // Email — tap to change
          GestureDetector(
            onTap: () => _pushChangeEmail(context),
            child: _ProfileRow(
              label: 'EMAIL ADDRESS',
              value: p?.email ?? '',
              badge: 'Verified',
              badgeColor: _kGreen,
              actionLabel: 'Change',
              onAction: () => _pushChangeEmail(context),
              sub: 'Tap to change email',
            ),
          ),
          const Divider(color: _kBorder, height: 16),
          // Phone — read-only, tap to change
          GestureDetector(
            onTap: () => _pushChangePhone(context),
            child: _ProfileRow(
              label: 'MOBILE NUMBER',
              value: p?.contactNumber ?? 'Not set',
              actionLabel: 'Change',
              onAction: () => _pushChangePhone(context),
              sub: 'Tap to change phone number',
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickAndUploadPhoto() async {
    final picker = ImagePicker();
    final XFile? xfile = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1024,
      maxHeight: 1024,
      imageQuality: 85,
    );
    if (xfile == null) return; // user cancelled
    if (!mounted) return;

    setState(() => _photoUploading = true);
    try {
      final bytes = await xfile.readAsBytes();
      final filename = xfile.name.isNotEmpty ? xfile.name : 'photo.jpg';
      // Detect mime from extension (image_picker already validated it)
      final mime =
          filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

      final photoUrl = await ProfileRepository.instance.uploadProfilePhoto(
        bytes: bytes,
        filename: filename,
        mimeType: mime,
      );

      if (!mounted) return;
      // Update local profile
      if (_profile != null) {
        setState(() {
          _profile = BuyerProfile.fromJson({
            ..._profile!.toUpdateJson(),
            'id': _profile!.id,
            'first_name': _profile!.firstName,
            'last_name': _profile!.lastName,
            'email': _profile!.email,
            'contact_number': _profile!.contactNumber,
            'profile_photo_url': photoUrl,
          });
        });
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Profile photo updated!',
            style:
                _pjs(size: 13, color: Colors.white, weight: FontWeight.w600)),
        backgroundColor: _kGreen,
        duration: const Duration(seconds: 2),
      ));
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(e.message, style: _pjs(size: 13, color: Colors.white)),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
      ));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Could not upload photo. Please try again.',
            style: _pjs(size: 13, color: Colors.white)),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
      ));
    } finally {
      if (mounted) setState(() => _photoUploading = false);
    }
  }

  void _pushChangeEmail(BuildContext ctx) {
    Navigator.push(
        ctx,
        MaterialPageRoute(
            builder: (_) => _ChangeEmailPage(
                  onChanged: (newEmail) {
                    // Update cached email in AuthService
                    AuthService.instance.updateEmail(newEmail);
                    // Refresh profile
                    _loadProfile();
                  },
                )));
  }

  void _pushChangePhone(BuildContext ctx) {
    Navigator.push(
        ctx,
        MaterialPageRoute(
            builder: (_) => _ChangePhonePage(
                  onChanged: (_) => _loadProfile(),
                )));
  }

  Widget _buildTextField(TextEditingController ctrl, String label,
      {String? hint, TextInputType? keyboardType, int? maxLength}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: _pjs(size: 9, weight: FontWeight.w700, color: _kSubtext)),
        const SizedBox(height: 4),
        TextFormField(
          controller: ctrl,
          keyboardType: keyboardType,
          maxLength: maxLength,
          style: _pjs(size: 14, weight: FontWeight.w600),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: _pjs(size: 13, color: _kSubtext),
            counterText: '',
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 0, vertical: 4),
            border: InputBorder.none,
            isDense: true,
          ),
        ),
      ],
    );
  }

  // ── Delivery Addresses ──────────────────────────────────────────────────────
  Widget _buildDeliveryAddresses() {
    final p = _profile;
    return SettingsSectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.location_on_outlined, size: 18, color: _kSecondary),
              const SizedBox(width: 6),
              Text('Delivery Address',
                  style: _pjs(size: 15, weight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 12),
          // Street
          _buildTextField(_streetCtrl, 'STREET / UNIT NUMBER',
              hint: 'e.g. 123 Mabini St, Unit 4'),
          const SizedBox(height: 12),
          // PSGC Address Dropdown
          AddressDropdown(
            initialProvince: p?.region, // first dropdown = region
            initialMunicipality: p?.municipalityCity,
            initialBarangay: p?.barangay,
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
          // Current saved address display
          if (p != null &&
              (p.barangay?.isNotEmpty == true ||
                  p.municipalityCity?.isNotEmpty == true)) ...[
            const SizedBox(height: 8),
            Text(
              'Current: ${[
                p.streetAddress,
                p.barangay,
                p.municipalityCity,
                p.province ?? p.region
              ].where((s) => s != null && s.isNotEmpty).join(', ')}',
              style: _pjs(size: 11, color: _kSubtext, height: 1.4),
            ),
          ],
        ],
      ),
    );
  }

  // ── Account Security ────────────────────────────────────────────────────────
  Widget _buildAccountSecurity() {
    return SettingsSectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.lock_outline, size: 18, color: _kSecondary),
              const SizedBox(width: 6),
              Text('Account Security',
                  style: _pjs(size: 15, weight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 12),
          _SecurityRow(
            icon: Icons.lock_reset_outlined,
            title: 'Change Password',
            sub: 'Update your account password',
            onTap: () => _pushPasswordChange(context),
          ),
          const Divider(color: _kBorder, height: 12),
          _SecurityRow(
            icon: Icons.email_outlined,
            title: 'Change Email',
            sub: _profile?.email ?? 'Update your login email',
            onTap: () => _pushChangeEmail(context),
          ),
          const Divider(color: _kBorder, height: 12),
          _SecurityRow(
            icon: Icons.phone_outlined,
            title: 'Change Phone',
            sub: _profile?.contactNumber ?? 'Update your mobile number',
            onTap: () => _pushChangePhone(context),
          ),
          const Divider(color: _kBorder, height: 12),
          _SecurityRow(
            icon: Icons.fingerprint,
            title: 'Biometric Sign-In',
            sub: 'Use Face ID / Touch ID for checkout',
            trailing: Switch(
              value: _biometric,
              onChanged: (v) => setState(() => _biometric = v),
              activeThumbColor: _kPrimary,
            ),
          ),
        ],
      ),
    );
  }

  // ── Notifications ───────────────────────────────────────────────────────────
  Widget _buildNotifications() {
    return SettingsSectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.notifications_outlined, size: 18, color: _kSecondary),
              const SizedBox(width: 6),
              Text('Notifications Preferences',
                  style: _pjs(size: 15, weight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 12),
          _NotifRow(
            title: 'Order Updates',
            sub: 'Track orders, pickup pins & delivery arrival',
            value: _orderUpdates,
            onChanged: (v) => setState(() => _orderUpdates = v),
          ),
          const Divider(color: _kBorder, height: 12),
          _NotifRow(
            title: 'Promo & Voucher Alerts',
            sub: 'Flash sales, personalised drops, voucher expiry',
            value: _promoAlerts,
            onChanged: (v) => setState(() => _promoAlerts = v),
          ),
          const Divider(color: _kBorder, height: 12),
          _NotifRow(
            title: 'Account Activity',
            sub: 'Unrecognised logins, bonus, alerts, coin balance',
            value: _activityAlerts,
            onChanged: (v) => setState(() => _activityAlerts = v),
          ),
        ],
      ),
    );
  }

  // ── Help & Support ──────────────────────────────────────────────────────────
  Widget _buildHelpSupport() {
    return SettingsSectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.help_outline, size: 18, color: _kSecondary),
              const SizedBox(width: 6),
              Text('Help & Support',
                  style: _pjs(size: 15, weight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 8),
          _SettingsTile(
            icon: Icons.quiz_outlined,
            title: 'Frequently Asked Questions (FAQs)',
            onTap: () {},
          ),
          const Divider(color: _kBorder, height: 1),
          _SettingsTile(
            icon: Icons.support_agent_outlined,
            title: 'Contact Customer Support',
            sub: 'Available 24/7 via chat',
            onTap: () {},
          ),
        ],
      ),
    );
  }

  // ── Save Button ─────────────────────────────────────────────────────────────
  Widget _buildSaveButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ElevatedButton.icon(
        onPressed: _saving ? null : _save,
        icon: _saving
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: Colors.white))
            : const Icon(Icons.save_outlined, size: 18, color: Colors.white),
        label: Text('Save Changes',
            style:
                _pjs(size: 15, weight: FontWeight.w700, color: Colors.white)),
        style: ElevatedButton.styleFrom(
          backgroundColor: _kPrimary,
          disabledBackgroundColor: _kPrimary.withValues(alpha: 0.5),
          elevation: 0,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.pill)),
          minimumSize: const Size(double.infinity, 52),
        ),
      ),
    );
  }

  // ── Account Actions ─────────────────────────────────────────────────────────
  Widget _buildAccountActions() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('ACCOUNT MAINTENANCE',
              style: _pjs(size: 11.5, weight: FontWeight.w800, color: _kSubtext)),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: _kCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _kBorder),
            ),
            child: Column(
              children: [
                // Log Out
                ListTile(
                  leading: Icon(Icons.logout_outlined, color: _kText, size: 20),
                  title: Text('Log Out',
                      style: _pjs(size: 14, weight: FontWeight.w600)),
                  trailing: Icon(Icons.chevron_right, color: _kSubtext),
                  onTap: () => _confirmLogout(context),
                ),
                const Divider(height: 1, color: _kBorder, indent: 16),
                // Deactivate
                ListTile(
                  leading: Icon(Icons.pause_circle_outline,
                      color: _kSubtext, size: 20),
                  title: Text('Deactivate Account',
                      style: _pjs(
                          size: 14, weight: FontWeight.w600, color: _kSubtext)),
                  trailing: Icon(Icons.chevron_right, color: _kSubtext),
                  onTap: () => _confirmDeactivate(context),
                ),
                const Divider(height: 1, color: _kBorder, indent: 16),
                // Delete
                ListTile(
                  leading: Icon(Icons.delete_outline, color: _kFlash, size: 20),
                  title: Text('Delete Account',
                      style: _pjs(
                          size: 14, weight: FontWeight.w600, color: _kFlash)),
                  subtitle: Text(
                    'Permanently erases orders, mimoo coins balance, chats, and review history. This action cannot be undone.',
                    style: _pjs(size: 11.5, color: _kSubtext, height: 1.4),
                  ),
                  trailing: Icon(Icons.chevron_right, color: _kSubtext),
                  onTap: () => _confirmDelete(context),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Dialogs ──────────────────────────────────────────────────────────────────
  void _confirmLogout(BuildContext ctx) {
    showDialog(
      context: ctx,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Log Out', style: _pjs(size: 18, weight: FontWeight.w800)),
        content: Text('Are you sure you want to log out?',
            style: _pjs(size: 14, color: _kSubtext)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: _pjs(size: 14, color: _kSubtext)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx); // close the dialog first
              await AuthService.instance.logout();
              if (ctx.mounted) {
                Navigator.of(ctx).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LandingPage()),
                  (route) => false,
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: _kPrimary,
              elevation: 0,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(9)),
            ),
            child: Text('Log Out',
                style: _pjs(
                    size: 14, weight: FontWeight.w700, color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _confirmDeactivate(BuildContext ctx) {
    showDialog(
      context: ctx,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Deactivate Account',
            style: _pjs(size: 17, weight: FontWeight.w800)),
        content: Text(
          'Your account will be hidden. You can reactivate it any time by logging back in.',
          style: _pjs(size: 14, color: _kSubtext, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: _pjs(size: 14, color: _kSubtext)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(
              backgroundColor: _kSubtext,
              elevation: 0,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(9)),
            ),
            child: Text('Deactivate',
                style: _pjs(
                    size: 14, weight: FontWeight.w700, color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext ctx) {
    showDialog(
      context: ctx,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        icon: Icon(Icons.warning_amber_rounded, color: _kFlash, size: 48),
        title: Text('Delete Account',
            style: _pjs(size: 17, weight: FontWeight.w800, color: _kFlash)),
        content: Text(
          'This will permanently erase all your data including orders, coins, chats, and review history. This action cannot be undone.',
          style: _pjs(size: 13, color: _kSubtext, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: _pjs(size: 14, color: _kSubtext)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(
              backgroundColor: _kFlash,
              elevation: 0,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(9)),
            ),
            child: Text('Delete Permanently',
                style: _pjs(
                    size: 14, weight: FontWeight.w700, color: Colors.white)),
          ),
        ],
      ),
    );
  }

  // ignore: unused_element
  void _pushEdit(BuildContext ctx, String field, String current) {
    Navigator.push(
      ctx,
      MaterialPageRoute(
        builder: (_) => _EditFieldPage(field: field, current: current),
      ),
    );
  }

  void _pushPasswordChange(BuildContext ctx) {
    Navigator.push(
        ctx, MaterialPageRoute(builder: (_) => const _ChangePasswordPage()));
  }
}

// ── Reusable Section Card ─────────────────────────────────────────────────────
class SettingsSectionCard extends StatelessWidget {
  const SettingsSectionCard({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: _kCard,
        borderRadius: AppRadius.card,
        border: Border.all(color: _kBorder),
      ),
      child: child,
    );
  }
}

// ── Profile row ───────────────────────────────────────────────────────────────
// ignore: unused_element
class _ProfileRow extends StatelessWidget {
  const _ProfileRow({
    required this.label,
    required this.value,
    this.badge,
    this.badgeColor,
    this.actionIcon,
    this.actionLabel,
    this.sub,
    this.onAction,
  });
  final String label, value;
  final String? badge, actionLabel, sub;
  final Color? badgeColor;
  final IconData? actionIcon;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: _pjs(size: 9, weight: FontWeight.w700, color: _kSubtext)),
        const SizedBox(height: 4),
        Row(
          children: [
            Expanded(
              child:
                  Text(value, style: _pjs(size: 14, weight: FontWeight.w600)),
            ),
            if (badge != null)
              Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: (badgeColor ?? _kGreen).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(badge!,
                    style: _pjs(
                        size: 10,
                        weight: FontWeight.w700,
                        color: badgeColor ?? _kGreen)),
              ),
            if (actionIcon != null)
              GestureDetector(
                onTap: onAction,
                child: Icon(actionIcon, size: 18, color: _kSecondary),
              ),
            if (actionLabel != null)
              GestureDetector(
                onTap: onAction,
                child: Text(actionLabel!,
                    style: _pjs(
                        size: 13, weight: FontWeight.w700, color: _kSecondary)),
              ),
          ],
        ),
        if (sub != null) ...[
          const SizedBox(height: 2),
          Text(sub!, style: _pjs(size: 10, color: _kSubtext)),
        ],
      ],
    );
  }
}

// ── Address card ──────────────────────────────────────────────────────────────
// ignore: unused_element
class _AddressCard extends StatelessWidget {
  const _AddressCard({
    required this.tag,
    required this.name,
    required this.address,
    this.isDefault = false,
    this.canSetDefault = false,
  });
  final String tag, name, address;
  final bool isDefault, canSetDefault;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _kSurface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
            color: isDefault ? _kSecondary : _kBorder,
            width: isDefault ? 1.5 : 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: isDefault ? _kChip : _kSurface,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: _kBorder),
                ),
                child: Text(tag,
                    style: _pjs(
                        size: 11,
                        weight: FontWeight.w700,
                        color: isDefault ? _kSecondary : _kText)),
              ),
              if (isDefault) ...[
                const SizedBox(width: 6),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: _kGreen.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text('DEFAULT',
                      style: _pjs(
                          size: 9, weight: FontWeight.w800, color: _kGreen)),
                ),
              ],
              const Spacer(),
              Icon(Icons.edit_outlined, size: 16, color: _kSecondary),
              const SizedBox(width: 12),
              Icon(Icons.delete_outline, size: 16, color: _kFlash),
            ],
          ),
          const SizedBox(height: 6),
          Text(name, style: _pjs(size: 13, weight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text(address, style: _pjs(size: 12, color: _kSubtext, height: 1.4)),
          if (canSetDefault) ...[
            const SizedBox(height: 6),
            GestureDetector(
              onTap: () {},
              child: Text('Set as default shipping address',
                  style: _pjs(
                      size: 11, weight: FontWeight.w600, color: _kSecondary)),
            ),
          ],
        ],
      ),
    );
  }
}

// ── Security row ──────────────────────────────────────────────────────────────
class _SecurityRow extends StatelessWidget {
  const _SecurityRow({
    required this.icon,
    required this.title,
    required this.sub,
    this.onTap,
    this.trailing,
  });
  final IconData icon;
  final String title, sub;
  final VoidCallback? onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        children: [
          Icon(icon, size: 20, color: _kSecondary),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: _pjs(size: 13, weight: FontWeight.w700)),
                Text(sub, style: _pjs(size: 11, color: _kSubtext)),
              ],
            ),
          ),
          trailing ??
              Icon(Icons.keyboard_arrow_down, size: 20, color: _kSubtext),
        ],
      ),
    );
  }
}

// ── Notification row ──────────────────────────────────────────────────────────
class _NotifRow extends StatelessWidget {
  const _NotifRow({
    required this.title,
    required this.sub,
    required this.value,
    required this.onChanged,
  });
  final String title, sub;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: _pjs(size: 13, weight: FontWeight.w700)),
              Text(sub, style: _pjs(size: 11, color: _kSubtext, height: 1.4)),
            ],
          ),
        ),
        Switch(value: value, onChanged: onChanged, activeThumbColor: _kPrimary),
      ],
    );
  }
}

// ── Settings tile ─────────────────────────────────────────────────────────────
class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    this.sub,
    required this.onTap,
  });
  final IconData icon;
  final String title;
  final String? sub;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, size: 20, color: _kSecondary),
      title: Text(title, style: _pjs(size: 13, weight: FontWeight.w700)),
      subtitle: sub != null
          ? Text(sub!, style: _pjs(size: 11, color: _kSubtext))
          : null,
      trailing: Icon(Icons.chevron_right, color: _kSubtext),
      onTap: onTap,
    );
  }
}

// ── Edit Field Page ───────────────────────────────────────────────────────────
class _EditFieldPage extends StatefulWidget {
  const _EditFieldPage({required this.field, required this.current});
  final String field, current;

  @override
  State<_EditFieldPage> createState() => _EditFieldPageState();
}

class _EditFieldPageState extends State<_EditFieldPage> {
  late TextEditingController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(text: widget.current);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
        backgroundColor: _kCard,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: _kText),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Edit ${widget.field}',
            style: _pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextFormField(
              controller: _ctrl,
              style: _pjs(size: 14),
              decoration: InputDecoration(
                labelText: widget.field,
                labelStyle:
                    _pjs(size: 11, weight: FontWeight.w700, color: _kSubtext),
                floatingLabelBehavior: FloatingLabelBehavior.always,
                filled: true,
                fillColor: _kCard,
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: _kBorder),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: _kPrimary, width: 1.5),
                ),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(double.infinity, 52),
              ),
              child: Text('Save',
                  style: _pjs(
                      size: 15, weight: FontWeight.w700, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Change Password Page ──────────────────────────────────────────────────────
class _ChangePasswordPage extends StatefulWidget {
  const _ChangePasswordPage();
  @override
  State<_ChangePasswordPage> createState() => _ChangePasswordPageState();
}

class _ChangePasswordPageState extends State<_ChangePasswordPage> {
  final _currentCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _o1 = true, _o2 = true, _o3 = true;
  bool _loading = false;

  @override
  void dispose() {
    _currentCtrl.dispose();
    _newCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_loading) return;
    if (_currentCtrl.text.isEmpty ||
        _newCtrl.text.isEmpty ||
        _confirmCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Please fill in all fields.',
              style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating));
      return;
    }
    setState(() => _loading = true);
    try {
      await ProfileRepository.instance.changePassword(
        currentPassword: _currentCtrl.text,
        newPassword: _newCtrl.text,
        newPasswordConfirmation: _confirmCtrl.text,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Password updated!',
              style:
                  _pjs(size: 13, color: Colors.white, weight: FontWeight.w600)),
          backgroundColor: AppColors.success));
      Navigator.pop(context);
    } on ApiException catch (e) {
      if (!mounted) return;
      final msg = e.errors != null && e.errors!.isNotEmpty
          ? e.errors!.entries.map((en) => en.value.first).join('\n')
          : e.message;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(msg, style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Network error. Please try again.',
              style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
          backgroundColor: _kCard,
          elevation: 0,
          leading: IconButton(
              icon: Icon(Icons.arrow_back, color: _kText),
              onPressed: () => Navigator.pop(context)),
          title: Text('Change Password',
              style: _pjs(size: 17, weight: FontWeight.w800))),
      body: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(children: [
            _PasswordField(
                label: 'Current Password',
                ctrl: _currentCtrl,
                obscure: _o1,
                onToggle: () => setState(() => _o1 = !_o1)),
            const SizedBox(height: 14),
            _PasswordField(
                label: 'New Password',
                ctrl: _newCtrl,
                obscure: _o2,
                onToggle: () => setState(() => _o2 = !_o2)),
            const SizedBox(height: 14),
            _PasswordField(
                label: 'Confirm New Password',
                ctrl: _confirmCtrl,
                obscure: _o3,
                onToggle: () => setState(() => _o3 = !_o3)),
            const SizedBox(height: 28),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              style: ElevatedButton.styleFrom(
                  backgroundColor: _kPrimary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  minimumSize: const Size(double.infinity, 52)),
              child: _loading
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : Text('Update Password',
                      style: _pjs(
                          size: 15,
                          weight: FontWeight.w700,
                          color: Colors.white)),
            ),
          ])),
    );
  }
}

class _PasswordField extends StatelessWidget {
  const _PasswordField(
      {required this.label,
      required this.ctrl,
      required this.obscure,
      required this.onToggle});
  final String label;
  final TextEditingController ctrl;
  final bool obscure;
  final VoidCallback onToggle;
  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: ctrl,
      obscureText: obscure,
      style: _pjs(size: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: _pjs(size: 11, weight: FontWeight.w700, color: _kSubtext),
        floatingLabelBehavior: FloatingLabelBehavior.always,
        filled: true,
        fillColor: _kCard,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        suffixIcon: IconButton(
            icon: Icon(
                obscure
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                size: 18,
                color: _kSubtext),
            onPressed: onToggle),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: _kBorder)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: _kPrimary, width: 1.5)),
      ),
    );
  }
}

// ── Change Email Page (2-step) ────────────────────────────────────────────────
class _ChangeEmailPage extends StatefulWidget {
  const _ChangeEmailPage({required this.onChanged});
  final void Function(String newEmail) onChanged;
  @override
  State<_ChangeEmailPage> createState() => _ChangeEmailPageState();
}

class _ChangeEmailPageState extends State<_ChangeEmailPage> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  bool _step2 = false; // false = step 1 (email+pass), true = step 2 (OTP)
  bool _loading = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _codeCtrl.dispose();
    super.dispose();
  }

  Future<void> _requestOtp() async {
    if (_loading) return;
    setState(() => _loading = true);
    try {
      await ProfileRepository.instance.requestEmailChange(
          newEmail: _emailCtrl.text.trim(), password: _passCtrl.text);
      if (!mounted) return;
      setState(() {
        _step2 = true;
        _loading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Verification code sent to your new email.',
              style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: _kPrimary));
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      final msg = e.errors != null && e.errors!.isNotEmpty
          ? e.errors!.entries.map((en) => en.value.first).join('\n')
          : e.message;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(msg, style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating));
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Network error.',
              style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating));
    }
  }

  Future<void> _verifyOtp() async {
    if (_loading) return;
    setState(() => _loading = true);
    try {
      final newEmail = await ProfileRepository.instance
          .verifyEmailChange(code: _codeCtrl.text.trim());
      if (!mounted) return;
      widget.onChanged(newEmail);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Email updated successfully!',
              style:
                  _pjs(size: 13, color: Colors.white, weight: FontWeight.w600)),
          backgroundColor: AppColors.success));
      Navigator.pop(context);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      final msg = e.errors != null && e.errors!.isNotEmpty
          ? e.errors!.entries.map((en) => en.value.first).join('\n')
          : e.message;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(msg, style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating));
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Network error.',
              style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
          backgroundColor: _kCard,
          elevation: 0,
          leading: IconButton(
              icon: Icon(Icons.arrow_back, color: _kText),
              onPressed: () => Navigator.pop(context)),
          title: Text(_step2 ? 'Verify New Email' : 'Change Email',
              style: _pjs(size: 17, weight: FontWeight.w800))),
      body: Padding(
          padding: const EdgeInsets.all(20),
          child: _step2 ? _buildStep2() : _buildStep1()),
    );
  }

  Widget _buildStep1() =>
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(
            'Enter your new email address and current password to receive a verification code.',
            style: _pjs(size: 13, color: _kSubtext, height: 1.5)),
        const SizedBox(height: 20),
        _OtpTextField(
            ctrl: _emailCtrl,
            label: 'New Email Address',
            keyboardType: TextInputType.emailAddress),
        const SizedBox(height: 14),
        _OtpTextField(
            ctrl: _passCtrl, label: 'Current Password', obscure: true),
        const SizedBox(height: 28),
        ElevatedButton(
            onPressed: _loading ? null : _requestOtp,
            style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(double.infinity, 52)),
            child: _loading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white))
                : Text('Send Verification Code',
                    style: _pjs(
                        size: 15,
                        weight: FontWeight.w700,
                        color: Colors.white))),
      ]);

  Widget _buildStep2() =>
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Enter the 6-digit code sent to ${_emailCtrl.text}.',
            style: _pjs(size: 13, color: _kSubtext, height: 1.5)),
        const SizedBox(height: 20),
        _OtpTextField(
            ctrl: _codeCtrl,
            label: '6-Digit Code',
            keyboardType: TextInputType.number),
        const SizedBox(height: 28),
        ElevatedButton(
            onPressed: _loading ? null : _verifyOtp,
            style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(double.infinity, 52)),
            child: _loading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white))
                : Text('Verify & Update Email',
                    style: _pjs(
                        size: 15,
                        weight: FontWeight.w700,
                        color: Colors.white))),
        const SizedBox(height: 12),
        Center(
            child: TextButton(
                onPressed:
                    _loading ? null : () => setState(() => _step2 = false),
                child: Text('Back / Change email',
                    style: _pjs(size: 13, color: _kSubtext)))),
      ]);
}

// ── Change Phone Page (2-step) ────────────────────────────────────────────────
class _ChangePhonePage extends StatefulWidget {
  const _ChangePhonePage({required this.onChanged});
  final void Function(String newPhone) onChanged;
  @override
  State<_ChangePhonePage> createState() => _ChangePhonePageState();
}

class _ChangePhonePageState extends State<_ChangePhonePage> {
  final _phoneCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  bool _step2 = false;
  bool _loading = false;

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _passCtrl.dispose();
    _codeCtrl.dispose();
    super.dispose();
  }

  Future<void> _requestOtp() async {
    if (_loading) return;
    setState(() => _loading = true);
    try {
      await ProfileRepository.instance.requestPhoneChange(
          newPhone: _phoneCtrl.text.trim(), password: _passCtrl.text);
      if (!mounted) return;
      setState(() {
        _step2 = true;
        _loading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Verification code sent to your email.',
              style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: _kPrimary));
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      final msg = e.errors != null && e.errors!.isNotEmpty
          ? e.errors!.entries.map((en) => en.value.first).join('\n')
          : e.message;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(msg, style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating));
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Network error.',
              style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating));
    }
  }

  Future<void> _verifyOtp() async {
    if (_loading) return;
    setState(() => _loading = true);
    try {
      final newPhone = await ProfileRepository.instance
          .verifyPhoneChange(code: _codeCtrl.text.trim());
      if (!mounted) return;
      widget.onChanged(newPhone);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Phone number updated!',
              style:
                  _pjs(size: 13, color: Colors.white, weight: FontWeight.w600)),
          backgroundColor: AppColors.success));
      Navigator.pop(context);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      final msg = e.errors != null && e.errors!.isNotEmpty
          ? e.errors!.entries.map((en) => en.value.first).join('\n')
          : e.message;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(msg, style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating));
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Network error.',
              style: _pjs(size: 13, color: Colors.white)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kSurface,
      appBar: AppBar(
          backgroundColor: _kCard,
          elevation: 0,
          leading: IconButton(
              icon: Icon(Icons.arrow_back, color: _kText),
              onPressed: () => Navigator.pop(context)),
          title: Text(_step2 ? 'Verify Phone Change' : 'Change Phone',
              style: _pjs(size: 17, weight: FontWeight.w800))),
      body: Padding(
          padding: const EdgeInsets.all(20),
          child: _step2 ? _buildStep2() : _buildStep1()),
    );
  }

  Widget _buildStep1() =>
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(
            'Enter your new phone number and current password. A verification code will be sent to your email.',
            style: _pjs(size: 13, color: _kSubtext, height: 1.5)),
        const SizedBox(height: 20),
        _OtpTextField(
            ctrl: _phoneCtrl,
            label: 'New Mobile Number (09XXXXXXXXX)',
            keyboardType: TextInputType.phone),
        const SizedBox(height: 14),
        _OtpTextField(
            ctrl: _passCtrl, label: 'Current Password', obscure: true),
        const SizedBox(height: 28),
        ElevatedButton(
            onPressed: _loading ? null : _requestOtp,
            style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(double.infinity, 52)),
            child: _loading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white))
                : Text('Send Verification Code',
                    style: _pjs(
                        size: 15,
                        weight: FontWeight.w700,
                        color: Colors.white))),
      ]);

  Widget _buildStep2() =>
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Enter the 6-digit code sent to your registered email.',
            style: _pjs(size: 13, color: _kSubtext, height: 1.5)),
        const SizedBox(height: 20),
        _OtpTextField(
            ctrl: _codeCtrl,
            label: '6-Digit Code',
            keyboardType: TextInputType.number),
        const SizedBox(height: 28),
        ElevatedButton(
            onPressed: _loading ? null : _verifyOtp,
            style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(double.infinity, 52)),
            child: _loading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white))
                : Text('Verify & Update Phone',
                    style: _pjs(
                        size: 15,
                        weight: FontWeight.w700,
                        color: Colors.white))),
        const SizedBox(height: 12),
        Center(
            child: TextButton(
                onPressed:
                    _loading ? null : () => setState(() => _step2 = false),
                child: Text('Back', style: _pjs(size: 13, color: _kSubtext)))),
      ]);
}

// ── Shared text field for OTP pages ──────────────────────────────────────────
class _OtpTextField extends StatelessWidget {
  const _OtpTextField(
      {required this.ctrl,
      required this.label,
      this.keyboardType,
      this.obscure = false});
  final TextEditingController ctrl;
  final String label;
  final TextInputType? keyboardType;
  final bool obscure;
  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: ctrl,
      keyboardType: keyboardType,
      obscureText: obscure,
      style: _pjs(size: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: _pjs(size: 11, weight: FontWeight.w700, color: _kSubtext),
        floatingLabelBehavior: FloatingLabelBehavior.always,
        filled: true,
        fillColor: _kCard,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: _kBorder)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: _kPrimary, width: 1.5)),
      ),
    );
  }
}
