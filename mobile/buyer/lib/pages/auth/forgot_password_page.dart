import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/api_service.dart';
import '../../widgets/auth_layout.dart';

// ── Design tokens (identical to login_page.dart / verify_email_page.dart) ─────
const _kPrimary = Color(0xFF4B2E8A);
const _kSurface = Color(0xFFF5F4FC);
const _kBorder = Color(0xFFDDD8F0);
const _kText = Color(0xFF1A1035);
const _kSubtext = Color(0xFF8A84A3);
const _kAccent = Color(0xFF6B38D4);

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  // 0 = email step, 1 = code step, 2 = new password step
  int _step = 0;
  bool _loading = false;

  // Step 0
  final _emailCtrl = TextEditingController();

  // Step 1 — 6 digit boxes
  final List<TextEditingController> _digitCtrl =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  // Resend cooldown
  int _resendSecondsLeft = 0;
  Timer? _resendTimer;

  // Step 2
  final _passCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();
  bool _obscurePass = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    for (final c in _digitCtrl) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    _resendTimer?.cancel();
    _passCtrl.dispose();
    _confirmPassCtrl.dispose();
    super.dispose();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  String get _code => _digitCtrl.map((c) => c.text.trim()).join();
  bool get _codeComplete => _code.length == 6;

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content:
          Text(msg, style: GoogleFonts.plusJakartaSans(color: Colors.white)),
      backgroundColor: Colors.red.shade700,
      behavior: SnackBarBehavior.floating,
      duration: const Duration(seconds: 5),
    ));
  }

  void _startResendCooldown() {
    _resendTimer?.cancel();
    setState(() => _resendSecondsLeft = 60);
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      setState(() => _resendSecondsLeft--);
      if (_resendSecondsLeft <= 0) t.cancel();
    });
  }

  // ── Step 0: send code ─────────────────────────────────────────────────────

  Future<void> _sendCode() async {
    final email = _emailCtrl.text.trim().toLowerCase();
    if (email.isEmpty) {
      _showError('Please enter your email.');
      return;
    }

    setState(() => _loading = true);
    try {
      await ApiService.post(
        '/buyer/forgot-password',
        body: {'email': email},
        includeAuth: false,
      );
      if (!mounted) return;
      // Always shows the same message regardless of whether email exists
      _startResendCooldown();
      setState(() {
        _step = 1;
        _loading = false;
      });
    } on ApiException catch (e) {
      _showError(e.message);
    } catch (_) {
      _showError('Network error. Please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // ── Step 1: resend code ───────────────────────────────────────────────────

  Future<void> _resend() async {
    if (_resendSecondsLeft > 0 || _loading) return;
    setState(() => _loading = true);
    try {
      await ApiService.post(
        '/buyer/forgot-password',
        body: {'email': _emailCtrl.text.trim().toLowerCase()},
        includeAuth: false,
      );
      if (!mounted) return;
      _startResendCooldown();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('A new code has been sent.',
            style: GoogleFonts.plusJakartaSans(color: Colors.white)),
        backgroundColor: _kPrimary,
        behavior: SnackBarBehavior.floating,
      ));
    } on ApiException catch (e) {
      _showError(e.message);
    } catch (_) {
      _showError('Network error. Please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // ── Step 1 → Step 2 ───────────────────────────────────────────────────────

  void _goToPasswordStep() {
    if (!_codeComplete) {
      _showError('Please enter the complete 6-digit code.');
      return;
    }
    setState(() => _step = 2);
  }

  // ── Step 2: reset password ────────────────────────────────────────────────

  Future<void> _resetPassword() async {
    if (!_codeComplete) {
      setState(() => _step = 1);
      return;
    }
    final pass = _passCtrl.text;
    final confirm = _confirmPassCtrl.text;
    if (pass.isEmpty || confirm.isEmpty) {
      _showError('Please fill in all password fields.');
      return;
    }
    if (pass != confirm) {
      _showError('Passwords do not match.');
      return;
    }

    setState(() => _loading = true);
    try {
      await ApiService.post(
        '/buyer/reset-password',
        body: {
          'email': _emailCtrl.text.trim().toLowerCase(),
          'code': _code,
          'password': pass,
          'password_confirmation': confirm,
        },
        includeAuth: false,
      );
      if (!mounted) return;
      // Success — go back to login with snackbar
      Navigator.of(context).pop();
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(
            'Password reset! Please log in with your new password.',
            style: GoogleFonts.plusJakartaSans(color: Colors.white),
          ),
          backgroundColor: const Color(0xFF1DB966),
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 5),
        ));
      });
    } on ApiException catch (e) {
      // If code is invalid/expired, go back to code step
      if (e.statusCode == 422) {
        setState(() => _step = 1);
        _showError(e.errorFor('code') ?? e.message);
      } else {
        _showError(e.message);
      }
    } catch (_) {
      _showError('Network error. Please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
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
                  // Step content
                  if (_step == 0) _buildEmailStep(),
                  if (_step == 1) _buildCodeStep(),
                  if (_step == 2) _buildPasswordStep(),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Step 0 UI ─────────────────────────────────────────────────────────────

  Widget _buildEmailStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text('Reset Password',
            style: GoogleFonts.plusJakartaSans(
                fontSize: 24, fontWeight: FontWeight.w700, color: _kText)),
        const SizedBox(height: 8),
        Text('Enter your email and we\'ll send\na 6-digit reset code.',
            style: GoogleFonts.plusJakartaSans(fontSize: 13, color: _kSubtext),
            textAlign: TextAlign.center),
        const SizedBox(height: 36),
        _buildMimooField(
          controller: _emailCtrl,
          label: 'Email',
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.done,
          onFieldSubmitted: (_) => _loading ? null : _sendCode(),
        ),
        const SizedBox(height: 28),
        SizedBox(
          width: double.infinity,
          height: 52,
          child: FilledButton(
            onPressed: _loading ? null : _sendCode,
            style: FilledButton.styleFrom(
              backgroundColor: _kPrimary,
              disabledBackgroundColor: _kPrimary.withValues(alpha: 0.4),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: _loading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white))
                : Text('Send Reset Code',
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Colors.white)),
          ),
        ),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () => Navigator.of(context).pop(),
          child: Text('Back to Login',
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 13, fontWeight: FontWeight.w700, color: _kAccent)),
        ),
      ],
    );
  }

  // ── Step 1 UI ─────────────────────────────────────────────────────────────

  Widget _buildCodeStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text('Check your email',
            style: GoogleFonts.plusJakartaSans(
                fontSize: 24, fontWeight: FontWeight.w700, color: _kText)),
        const SizedBox(height: 8),
        Text('We sent a 6-digit code to',
            style: GoogleFonts.plusJakartaSans(fontSize: 13, color: _kSubtext),
            textAlign: TextAlign.center),
        const SizedBox(height: 4),
        Text(_emailCtrl.text.trim(),
            style: GoogleFonts.plusJakartaSans(
                fontSize: 13, fontWeight: FontWeight.w700, color: _kAccent),
            textAlign: TextAlign.center),
        const SizedBox(height: 36),
        // 6 digit boxes
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(6, _buildDigitBox),
        ),
        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          height: 52,
          child: FilledButton(
            onPressed: _codeComplete ? _goToPasswordStep : null,
            style: FilledButton.styleFrom(
              backgroundColor: _kPrimary,
              disabledBackgroundColor: _kPrimary.withValues(alpha: 0.4),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('Continue',
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Colors.white)),
          ),
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("Didn't receive a code? ",
                style: GoogleFonts.plusJakartaSans(
                    fontSize: 13, color: _kSubtext)),
            _loading
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: _kAccent))
                : GestureDetector(
                    onTap: _resendSecondsLeft > 0 ? null : _resend,
                    child: Text(
                      _resendSecondsLeft > 0
                          ? 'Resend in ${_resendSecondsLeft}s'
                          : 'Resend code',
                      style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: _resendSecondsLeft > 0 ? _kSubtext : _kAccent),
                    ),
                  ),
          ],
        ),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () => setState(() => _step = 0),
          child: Text('← Change email',
              style: GoogleFonts.plusJakartaSans(
                  fontSize: 13, fontWeight: FontWeight.w600, color: _kSubtext)),
        ),
      ],
    );
  }

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
            fontSize: 22, fontWeight: FontWeight.w700, color: _kText),
        decoration: InputDecoration(
          counterText: '',
          filled: true,
          fillColor: Colors.white,
          contentPadding: EdgeInsets.zero,
          enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: _kBorder)),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: _kPrimary, width: 2)),
        ),
        onChanged: (value) {
          if (value.length == 1 && index < 5) {
            _focusNodes[index + 1].requestFocus();
          }
          setState(() {});
        },
        onTap: () {
          _digitCtrl[index].selection = TextSelection(
              baseOffset: 0, extentOffset: _digitCtrl[index].text.length);
        },
      ),
    );
  }

  // ── Step 2 UI ─────────────────────────────────────────────────────────────

  Widget _buildPasswordStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text('New Password',
            style: GoogleFonts.plusJakartaSans(
                fontSize: 24, fontWeight: FontWeight.w700, color: _kText)),
        const SizedBox(height: 8),
        Text(
            'Must be at least 8 characters with uppercase,\nlowercase, number and special character.',
            style: GoogleFonts.plusJakartaSans(fontSize: 13, color: _kSubtext),
            textAlign: TextAlign.center),
        const SizedBox(height: 36),
        _buildMimooField(
          controller: _passCtrl,
          label: 'New Password',
          obscureText: _obscurePass,
          textInputAction: TextInputAction.next,
          suffixIcon: IconButton(
            icon: Icon(
                _obscurePass
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                color: _kSubtext,
                size: 18),
            onPressed: () => setState(() => _obscurePass = !_obscurePass),
          ),
        ),
        const SizedBox(height: 14),
        _buildMimooField(
          controller: _confirmPassCtrl,
          label: 'Confirm New Password',
          obscureText: _obscureConfirm,
          textInputAction: TextInputAction.done,
          onFieldSubmitted: (_) => _loading ? null : _resetPassword(),
          suffixIcon: IconButton(
            icon: Icon(
                _obscureConfirm
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                color: _kSubtext,
                size: 18),
            onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
          ),
        ),
        const SizedBox(height: 28),
        SizedBox(
          width: double.infinity,
          height: 52,
          child: FilledButton(
            onPressed: _loading ? null : _resetPassword,
            style: FilledButton.styleFrom(
              backgroundColor: _kPrimary,
              disabledBackgroundColor: _kPrimary.withValues(alpha: 0.4),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: _loading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white))
                : Text('Reset Password',
                    style: GoogleFonts.plusJakartaSans(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Colors.white)),
          ),
        ),
      ],
    );
  }

  // ── Reusable field (same style as login_page.dart) ────────────────────────

  Widget _buildMimooField({
    required TextEditingController controller,
    required String label,
    TextInputType? keyboardType,
    TextInputAction? textInputAction,
    bool obscureText = false,
    Widget? suffixIcon,
    ValueChanged<String>? onFieldSubmitted,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      obscureText: obscureText,
      onFieldSubmitted: onFieldSubmitted,
      style: GoogleFonts.plusJakartaSans(
          fontSize: 14, color: _kText, fontWeight: FontWeight.w500),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.plusJakartaSans(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: _kSubtext,
            letterSpacing: 0.5),
        floatingLabelBehavior: FloatingLabelBehavior.always,
        suffixIcon: suffixIcon,
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: _kBorder)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: _kPrimary, width: 1.5)),
        errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Colors.red)),
        focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Colors.red, width: 1.5)),
      ),
    );
  }
}
