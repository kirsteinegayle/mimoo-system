import 'package:flutter/material.dart';
import '../../services/courier_repository.dart';
import '../../services/api_service.dart';
import '../../state/auth_service.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/mimoo_logo.dart';
import '../home/home_page.dart';

/// Courier login page — wired to POST /api/courier-app/login.
class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  bool _obscure = true;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (_loading) return;
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final result = await CourierRepository.instance.login(
        email: _emailCtrl.text.trim().toLowerCase(),
        password: _passCtrl.text,
      );

      await AuthService.instance.persistLogin(
        token: result['token'] as String,
        courier: result['courier'],
      );

      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const HomePage()),
        (route) => false,
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _error = (e.statusCode == 401 || e.statusCode == 422)
          ? e.message
          : ApiService.friendlyError(e));
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = ApiService.friendlyError(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenH = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: kPrimary,
      body: SafeArea(
        child: Column(
          children: [
            // ── Dark purple header ─────────────────────────────────────────
            SizedBox(
              height: screenH * 0.30,
              child: const Center(
                child: MimooLogo(size: 76, showTagline: true),
              ),
            ),
            // ── White card ─────────────────────────────────────────────────
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: kCard,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                ),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 32, 24, 32),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Welcome back',
                            style: pjs(size: 24, weight: FontWeight.w800)),
                        const SizedBox(height: 4),
                        Text('Sign in to your courier account.',
                            style: pjs(size: 13, color: kSubtext)),
                        const SizedBox(height: 24),

                        // Email
                        Text('Email address',
                            style: pjs(
                                size: 12,
                                weight: FontWeight.w600,
                                color: kSubtext)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _emailCtrl,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.email],
                          style: pjs(size: 14, weight: FontWeight.w500),
                          decoration: mimooInput(
                              hint: 'name@email.com', icon: Icons.mail_outline),
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) {
                              return 'Email is required';
                            }
                            if (!v.contains('@')) return 'Enter a valid email';
                            return null;
                          },
                        ),

                        const SizedBox(height: 16),

                        // Password
                        Text('Password',
                            style: pjs(
                                size: 12,
                                weight: FontWeight.w600,
                                color: kSubtext)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _passCtrl,
                          obscureText: _obscure,
                          textInputAction: TextInputAction.done,
                          autofillHints: const [AutofillHints.password],
                          onFieldSubmitted: (_) => _login(),
                          style: pjs(size: 14, weight: FontWeight.w500),
                          decoration: mimooInput(
                            hint: 'Your password',
                            icon: Icons.lock_outline,
                            suffix: IconButton(
                              tooltip:
                                  _obscure ? 'Show password' : 'Hide password',
                              icon: Icon(
                                _obscure
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                                color: kSubtext,
                                size: 19,
                              ),
                              onPressed: () =>
                                  setState(() => _obscure = !_obscure),
                            ),
                          ),
                          validator: (v) => (v == null || v.isEmpty)
                              ? 'Password is required'
                              : null,
                        ),

                        // Inline error
                        if (_error != null) ...[
                          const SizedBox(height: 14),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: kFlash.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                  color: kFlash.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.error_outline,
                                    size: 16, color: kFlash),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(_error!,
                                      style: pjs(
                                          size: 12,
                                          color: kFlash,
                                          height: 1.4)),
                                ),
                              ],
                            ),
                          ),
                        ],

                        const SizedBox(height: 24),

                        // Sign in button
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton(
                            onPressed: _loading ? null : _login,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: kPrimary,
                              disabledBackgroundColor:
                                  kPrimary.withValues(alpha: 0.5),
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14)),
                            ),
                            child: _loading
                                ? const SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2.5, color: Colors.white))
                                : Text('Sign in',
                                    style: pjs(
                                        size: 15,
                                        weight: FontWeight.w800,
                                        color: Colors.white)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
