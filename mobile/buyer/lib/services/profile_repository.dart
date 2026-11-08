import '../models/buyer_profile.dart';
import 'api_service.dart';

/// Thin repository over [ApiService] for buyer profile and account-security operations.
class ProfileRepository {
  ProfileRepository._();
  static final ProfileRepository instance = ProfileRepository._();

  // ── Profile ─────────────────────────────────────────────────────────────────

  Future<BuyerProfile> fetchProfile() async {
    final res = await ApiService.get('/buyer/profile') as Map<String, dynamic>;
    return BuyerProfile.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<BuyerProfile> updateProfile(Map<String, dynamic> fields) async {
    final res = await ApiService.put('/buyer/profile', body: fields)
        as Map<String, dynamic>;
    return BuyerProfile.fromJson(res['data'] as Map<String, dynamic>);
  }

  // ── Change password ──────────────────────────────────────────────────────────

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String newPasswordConfirmation,
  }) async {
    await ApiService.post('/buyer/change-password', body: {
      'current_password': currentPassword,
      'new_password': newPassword,
      'new_password_confirmation': newPasswordConfirmation,
    });
  }

  // ── Change email (two-step) ──────────────────────────────────────────────────

  /// Step 1: request OTP sent to new email.
  Future<void> requestEmailChange({
    required String newEmail,
    required String password,
  }) async {
    await ApiService.post('/buyer/change-email/request', body: {
      'new_email': newEmail,
      'password': password,
    });
  }

  /// Step 2: verify OTP and update email.
  /// Returns the new email address.
  Future<String> verifyEmailChange({required String code}) async {
    final res = await ApiService.post('/buyer/change-email/verify', body: {
      'code': code,
    }) as Map<String, dynamic>;
    return res['data']['email'] as String? ?? '';
  }

  // ── Change phone (two-step) ──────────────────────────────────────────────────

  /// Step 1: request OTP sent to current email.
  Future<void> requestPhoneChange({
    required String newPhone,
    required String password,
  }) async {
    await ApiService.post('/buyer/change-phone/request', body: {
      'new_phone': newPhone,
      'password': password,
    });
  }

  /// Step 2: verify OTP and update phone.
  /// Returns the new contact_number.
  Future<String> verifyPhoneChange({required String code}) async {
    final res = await ApiService.post('/buyer/change-phone/verify', body: {
      'code': code,
    }) as Map<String, dynamic>;
    return res['data']['contact_number'] as String? ?? '';
  }

  // ── Profile photo ─────────────────────────────────────────────────────────────

  /// Upload a profile photo as bytes (works on Flutter Web — no dart:io).
  /// [bytes] is the raw file bytes; [filename] is the suggested name (e.g. 'photo.jpg').
  /// [mimeType] should be 'image/jpeg' or 'image/png'.
  Future<String> uploadProfilePhoto({
    required List<int> bytes,
    required String filename,
    required String mimeType,
  }) async {
    final res = await ApiService.postMultipart(
      '/buyer/profile/photo',
      fieldName: 'photo',
      bytes: bytes,
      filename: filename,
      contentType: mimeType,
    ) as Map<String, dynamic>;
    return res['data']['profile_photo_url'] as String? ?? '';
  }
}
