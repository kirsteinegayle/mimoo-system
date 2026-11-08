import 'package:flutter/material.dart';

import 'register_page.dart';
import 'forgot_password_page.dart';
import '../../main.dart';
import '../../state/auth_service.dart';
import '../../services/api_service.dart';
import '../../theme/mimoo_brand.dart';
import '../../widgets/auth_layout.dart';
import '../../widgets/motion.dart';
import '../../utils/animations.dart';

class LoginPage extends StatefulWidget {
  /// Optional callback to execute after successful login.
  /// Used when redirected from a gated action (e.g. Add to Cart).
  const LoginPage({super.key, this.onLoginSuccess});

  final VoidCallback? onLoginSuccess;

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
  int _shake = 0; // bumped on every error → shake animation

  // "Remember me" is intentionally not shown: the session token is always
  // persisted in secure storage until logout, so the checkbox would do nothing.

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (_loading) return;
    if (!_formKey.currentState!.validate()) {
      setState(() => _shake++);
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final res = await ApiService.post(
        '/buyer/login',
        body: {
          'email': _emailCtrl.text.trim().toLowerCase(),
          'password': _passCtrl.text,
        },
        includeAuth: false,
      );

      final data = res['data'] as Map<String, dynamic>;
      final buyer = data['buyer'] as Map<String, dynamic>;
      final token = data['token'] as String;

      await AuthService.instance.persistLogin(
        token: token,
        buyerName: '${buyer['first_name']} ${buyer['last_name']}',
        buyerId: buyer['id'].toString(),
        contactNumber: buyer['contact_number'] as String?,
        streetAddress: buyer['street_address'] as String?,
        barangay: buyer['barangay'] as String?,
        municipalityCity: buyer['municipality_city'] as String?,
        province: buyer['province'] as String?,
        region: buyer['region'] as String?,
      );

      if (!mounted) return;

      if (widget.onLoginSuccess != null) {
        Navigator.of(context).pop();
        widget.onLoginSuccess!();
      } else {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const HomePage()),
          (route) => false,
        );
      }
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _shake++);
      setState(() => _error = e.statusCode == 403
          ? 'Please verify your email before logging in.'
          : e.statusCode == 401 || e.statusCode == 422
              ? e.message
              : ApiService.friendlyError(e));
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
    return MimooAuthLayout(
      onBack: Navigator.of(context).canPop()
          ? () => Navigator.of(context).pop()
          : null,
      card: ShakeOnChange(
        trigger: _shake,
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              StaggeredItem(
                index: 0,
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Welcome back',
                          style: mimooText(size: 24, weight: FontWeight.w800)),
                      const SizedBox(height: 4),
                      Text(
                          'Sign in to continue shopping on ${MimooBrand.name}.',
                          style:
                              mimooText(size: 13, color: MimooBrand.subtext)),
                    ]),
              ),
              const SizedBox(height: 22),
              StaggeredItem(
                index: 1,
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const MimooFieldLabel('Email address'),
                      FocusGlow(
                          child: TextFormField(
                        controller: _emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        autofillHints: const [AutofillHints.email],
                        style: mimooText(size: 14, weight: FontWeight.w500),
                        decoration: mimooInputDecoration(
                            hint: 'name@email.com', icon: Icons.mail_outline),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) {
                            return 'Email is required';
                          }
                          if (!v.contains('@')) return 'Enter a valid email';
                          return null;
                        },
                      )),
                    ]),
              ),
              const SizedBox(height: 14),
              StaggeredItem(
                index: 2,
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const MimooFieldLabel('Password'),
                      FocusGlow(
                          child: TextFormField(
                        controller: _passCtrl,
                        obscureText: _obscure,
                        textInputAction: TextInputAction.done,
                        autofillHints: const [AutofillHints.password],
                        onFieldSubmitted: (_) => _login(),
                        style: mimooText(size: 14, weight: FontWeight.w500),
                        decoration: mimooInputDecoration(
                          hint: 'Your password',
                          icon: Icons.lock_outline,
                          suffix: IconButton(
                            tooltip:
                                _obscure ? 'Show password' : 'Hide password',
                            icon: Icon(
                              _obscure
                                  ? Icons.visibility_outlined
                                  : Icons.visibility_off_outlined,
                              color: MimooBrand.subtext,
                              size: 19,
                            ),
                            onPressed: () =>
                                setState(() => _obscure = !_obscure),
                          ),
                        ),
                        validator: (v) => (v == null || v.isEmpty)
                            ? 'Password is required'
                            : null,
                      )),
                    ]),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => Navigator.push(
                    context,
                    MimooPageRoute(builder: (_) => const ForgotPasswordPage()),
                  ),
                  child: Text('Forgot password?',
                      style: mimooText(
                          size: 13,
                          weight: FontWeight.w700,
                          color: MimooBrand.accent)),
                ),
              ),
              AnimatedReveal(
                child: _error == null
                    ? null
                    : MimooInlineError(_error!, key: ValueKey(_error)),
              ),
              const SizedBox(height: 14),
              StaggeredItem(
                index: 3,
                child: MimooPrimaryButton(
                    label: 'Sign in', loading: _loading, onPressed: _login),
              ),
            ],
          ),
        ),
      ),
      below: Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Text('New to ${MimooBrand.name}? ',
              style: mimooText(size: 13, color: MimooBrand.subtext)),
          GestureDetector(
            onTap: () => Navigator.push(
              context,
              MimooPageRoute(builder: (_) => const RegisterPage()),
            ),
            child: Text('Create an account',
                style: mimooText(
                    size: 13,
                    weight: FontWeight.w800,
                    color: MimooBrand.primary)),
          ),
        ],
      ),
    );
  }
}
