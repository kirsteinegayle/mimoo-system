import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../services/courier_repository.dart';
import '../../services/api_service.dart';
import '../../state/auth_service.dart';
import '../home/home_page.dart';

const _loginText = Color(0xFF000000);
const _loginMuted = Color(0xFF969494);
const _loginBodyMuted = Color(0xFF787575);
const _loginFieldFill = Color(0xFFF5F4FC);
const _loginFieldBorder = Color(0xFF8D72B2);
const _loginButton = Color(0xFF34175B);
const _loginCardFill = Color(0xFFEFE9FD);
const _loginIcon = Color(0xFF655A93);

TextStyle _poppins({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = _loginText,
  double? height,
  TextLeadingDistribution? leadingDistribution,
}) =>
    TextStyle(
      fontFamily: 'Poppins',
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: height,
      letterSpacing: 0,
      wordSpacing: 0,
      leadingDistribution: leadingDistribution,
    );

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
  final _emailFocus = FocusNode();
  final _passFocus = FocusNode();

  bool _obscure = true;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _emailFocus.dispose();
    _passFocus.dispose();
    super.dispose();
  }

  void _toggleObscure() => setState(() => _obscure = !_obscure);

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

  void _clearError() {
    if (_error != null) setState(() => _error = null);
  }

  Widget _loginField({
    required Key boxKey,
    required TextEditingController controller,
    required FocusNode focusNode,
    required IconData icon,
    required String hint,
    required TextInputType keyboardType,
    required Iterable<String> autofillHints,
    required String? Function(String?) validator,
    TextInputAction textInputAction = TextInputAction.next,
    VoidCallback? onSubmitted,
  }) {
    return FormField<String>(
      initialValue: controller.text,
      validator: validator,
      builder: (field) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            key: boxKey,
            height: 44,
            decoration: BoxDecoration(
              color: _loginFieldFill,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: _loginFieldBorder, width: 0.2),
            ),
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: focusNode.requestFocus,
              // One 44 px box per field. The icon lives in this row (never in
              // InputDecoration.prefix, which only renders while focused):
              // 14 px lead-in + 18 px icon + 7 px gap puts the text at 39 px.
              child: Padding(
                padding: const EdgeInsets.only(left: 14, right: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Icon(icon, size: 18, color: _loginIcon),
                    const SizedBox(width: 7),
                    Expanded(
                      // Poppins' tall ascent leaves the glyphs ~1.5 px below
                      // the line-box centre; shifting the whole text layer
                      // (placeholder + field) keeps both on the icon centre.
                      child: Transform.translate(
                        offset: const Offset(0, -1.5),
                        child: Stack(
                          alignment: Alignment.centerLeft,
                          children: [
                            // Placeholder is painted here (not via hintText) so
                            // the InputDecorator baseline maths cannot shift it:
                            // the web and mobile renderers then share one exact
                            // centre line.
                            IgnorePointer(
                              child: ValueListenableBuilder<TextEditingValue>(
                                valueListenable: controller,
                                builder: (context, value, child) =>
                                    value.text.isEmpty
                                        ? Text(
                                            hint,
                                            maxLines: 1,
                                            style: _poppins(
                                              size: 12,
                                              color: _loginMuted.withValues(
                                                  alpha: 0.8),
                                              height: 1,
                                              leadingDistribution:
                                                  TextLeadingDistribution.even,
                                            ),
                                            textHeightBehavior:
                                                const TextHeightBehavior(
                                              applyHeightToFirstAscent: false,
                                              applyHeightToLastDescent: false,
                                            ),
                                          )
                                        : const SizedBox.shrink(),
                              ),
                            ),
                            TextField(
                              controller: controller,
                              focusNode: focusNode,
                              keyboardType: keyboardType,
                              textInputAction: textInputAction,
                              autofillHints: autofillHints,
                              obscureText:
                                  hint == 'Your password' ? _obscure : false,
                              onSubmitted: onSubmitted == null
                                  ? null
                                  : (_) => onSubmitted(),
                              onChanged: (value) {
                                field.didChange(value);
                                _clearError();
                              },
                              style: _poppins(
                                size: 12,
                                color: _loginText,
                                height: 1,
                                leadingDistribution:
                                    TextLeadingDistribution.even,
                              ),
                              strutStyle: const StrutStyle(
                                fontFamily: 'Poppins',
                                fontSize: 12,
                                height: 1,
                                leading: 0,
                                forceStrutHeight: true,
                              ),
                              textAlignVertical: TextAlignVertical.center,
                              cursorColor: _loginButton,
                              decoration: const InputDecoration(
                                border: InputBorder.none,
                                enabledBorder: InputBorder.none,
                                focusedBorder: InputBorder.none,
                                errorBorder: InputBorder.none,
                                disabledBorder: InputBorder.none,
                                filled: false,
                                isDense: true,
                                isCollapsed: true,
                                contentPadding: EdgeInsets.zero,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (field.errorText != null)
            Padding(
              padding: const EdgeInsets.only(left: 4, top: 3),
              child: Text(
                field.errorText!,
                style: _poppins(size: 11, color: const Color(0xFFB3261E)),
              ),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
      ),
      child: Theme(
        data: Theme.of(context).copyWith(
          brightness: Brightness.light,
          colorScheme: Theme.of(context)
              .colorScheme
              .copyWith(brightness: Brightness.light),
          scaffoldBackgroundColor: Colors.white,
          inputDecorationTheme: const InputDecorationTheme(
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
            errorBorder: InputBorder.none,
            disabledBorder: InputBorder.none,
            filled: false,
          ),
        ),
        child: Scaffold(
          backgroundColor: Colors.white,
          body: LayoutBuilder(
            builder: (context, constraints) {
              final width = constraints.maxWidth;
              final height = constraints.maxHeight;
              final topInset = MediaQuery.paddingOf(context).top;
              final safeOffset = math.max(0.0, topInset - 24.0);
              final headerHeight =
                  math.min(height, math.max(222.0, height * (296 / 852)));

              return Stack(
                children: [
                  const Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin:
                              Alignment(224 / 393 * 2 - 1, 7.5 / 852 * 2 - 1),
                          end: Alignment(
                              627.5 / 393 * 2 - 1, 196.5 / 852 * 2 - 1),
                          stops: [0, 0.149038, 0.3125, 0.51636, 1],
                          colors: [
                            Color(0xFF181329),
                            Color(0xFF1D1732),
                            Color(0xFF251E40),
                            Color(0xFF352A5A),
                            Color(0xFF54428F),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Column(
                    children: [
                      SizedBox(
                        key: const ValueKey('login-header'),
                        height: headerHeight,
                        width: double.infinity,
                        child: Stack(
                          clipBehavior: Clip.hardEdge,
                          children: [
                            Positioned(
                              top: 57 + safeOffset,
                              left: (width - 184) / 2,
                              width: 184,
                              height: 164,
                              child: Image.asset(
                                key: const ValueKey('login-logo'),
                                'assets/images/mimoo_logo_white.png',
                                fit: BoxFit.fill,
                              ),
                            ),
                            Positioned(
                              top: 179 + safeOffset,
                              left: 16,
                              right: 16,
                              child: Text(
                                'A Little Bit of Everything, Just a Moo Away',
                                textAlign: TextAlign.center,
                                style: _poppins(
                                  size: 10,
                                  weight: FontWeight.w300,
                                  color: const Color(0xFFD8D8D8),
                                  height: 1.2,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Container(
                          width: double.infinity,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.vertical(
                              top: Radius.circular(30),
                            ),
                          ),
                          child: SingleChildScrollView(
                            keyboardDismissBehavior:
                                ScrollViewKeyboardDismissBehavior.onDrag,
                            padding: const EdgeInsets.fromLTRB(24, 41, 24, 32),
                            child: Form(
                              key: _formKey,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.only(left: 6),
                                    child: Text(
                                      'Welcome back, Courier',
                                      style: _poppins(
                                        size: 20,
                                        weight: FontWeight.w600,
                                        height: 1.2,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 5),
                                  Padding(
                                    padding: const EdgeInsets.only(left: 6),
                                    child: Text(
                                      'Sign in to your courier account',
                                      style: _poppins(
                                        size: 12,
                                        weight: FontWeight.w300,
                                        color: _loginMuted,
                                        height: 1.2,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 27),
                                  Text(
                                    'Email Address',
                                    style: _poppins(
                                      size: 12,
                                      weight: FontWeight.w600,
                                      color: _loginMuted,
                                      height: 1.2,
                                    ),
                                  ),
                                  const SizedBox(height: 5),
                                  _loginField(
                                    boxKey: const ValueKey('email-field-box'),
                                    controller: _emailCtrl,
                                    focusNode: _emailFocus,
                                    icon: Icons.mail_outline_rounded,
                                    hint: 'name@email.com',
                                    keyboardType: TextInputType.emailAddress,
                                    autofillHints: const [AutofillHints.email],
                                    validator: (value) {
                                      if (value == null ||
                                          value.trim().isEmpty) {
                                        return 'Email is required';
                                      }
                                      if (!value.contains('@')) {
                                        return 'Enter a valid email';
                                      }
                                      return null;
                                    },
                                  ),
                                  const SizedBox(height: 25),
                                  Text(
                                    'Password',
                                    style: _poppins(
                                      size: 12,
                                      weight: FontWeight.w600,
                                      color: _loginMuted,
                                      height: 1.2,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  _loginField(
                                    boxKey:
                                        const ValueKey('password-field-box'),
                                    controller: _passCtrl,
                                    focusNode: _passFocus,
                                    icon: Icons.lock_outline_rounded,
                                    hint: 'Your password',
                                    keyboardType: TextInputType.visiblePassword,
                                    autofillHints: const [
                                      AutofillHints.password
                                    ],
                                    textInputAction: TextInputAction.done,
                                    onSubmitted: _login,
                                    validator: (value) =>
                                        (value == null || value.isEmpty)
                                            ? 'Password is required'
                                            : null,
                                  ),
                                  SizedBox(
                                    height: 44,
                                    child: Stack(
                                      children: [
                                        Positioned.fill(
                                          child: Semantics(
                                            button: true,
                                            label: _obscure
                                                ? 'Show password'
                                                : 'Hide password',
                                            child: GestureDetector(
                                              behavior: HitTestBehavior.opaque,
                                              onTap: _toggleObscure,
                                            ),
                                          ),
                                        ),
                                        Positioned(
                                          top: 5,
                                          right: 2,
                                          child: Text(
                                            _obscure
                                                ? 'Show Password'
                                                : 'Hide Password',
                                            style: _poppins(
                                              size: 12,
                                              weight: FontWeight.w500,
                                              color: _loginMuted,
                                              height: 1.2,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  SizedBox(
                                    height: 44,
                                    child: ElevatedButton(
                                      onPressed: _loading ? null : _login,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: _loginButton,
                                        disabledBackgroundColor: _loginButton
                                            .withValues(alpha: 0.65),
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                        padding: EdgeInsets.zero,
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(10),
                                        ),
                                      ),
                                      child: _loading
                                          ? const SizedBox(
                                              width: 20,
                                              height: 20,
                                              child: CircularProgressIndicator(
                                                strokeWidth: 2,
                                                color: Colors.white,
                                              ),
                                            )
                                          : Text(
                                              'Sign In',
                                              style: _poppins(
                                                size: 12,
                                                weight: FontWeight.w600,
                                                color: Colors.white,
                                              ),
                                            ),
                                    ),
                                  ),
                                  if (_error != null) ...[
                                    const SizedBox(height: 12),
                                    Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFFEBEE),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          const Icon(
                                            Icons.error_outline,
                                            size: 16,
                                            color: Color(0xFFB3261E),
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              _error!,
                                              style: _poppins(
                                                size: 12,
                                                color: const Color(0xFFB3261E),
                                                height: 1.3,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                  const SizedBox(height: 16),
                                  Container(
                                    key: const ValueKey('need-access-card'),
                                    constraints:
                                        const BoxConstraints(minHeight: 70),
                                    padding: const EdgeInsets.fromLTRB(
                                        14, 14, 16, 10),
                                    decoration: BoxDecoration(
                                      color: _loginCardFill,
                                      borderRadius: BorderRadius.circular(9),
                                    ),
                                    child: Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Transform.translate(
                                          offset: const Offset(0, -3),
                                          child: const Icon(
                                            Icons.error_outline,
                                            color: _loginIcon,
                                            size: 16,
                                          ),
                                        ),
                                        const SizedBox(width: 7),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                'Need access?',
                                                style: _poppins(
                                                  size: 12,
                                                  weight: FontWeight.w500,
                                                  height: 1.2,
                                                ),
                                              ),
                                              ConstrainedBox(
                                                constraints:
                                                    const BoxConstraints(
                                                  maxWidth: 272,
                                                ),
                                                child: Text(
                                                  'Ask your logistics company to provision your rider account',
                                                  style: _poppins(
                                                    size: 10,
                                                    weight: FontWeight.w300,
                                                    color: _loginBodyMuted,
                                                    height: 1.5,
                                                  ),
                                                  textHeightBehavior:
                                                      const TextHeightBehavior(
                                                    applyHeightToFirstAscent:
                                                        false,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 9),
                                  Text(
                                    'Mimoo Logistics Grid v3.4.2 | Protected by SafeRide Dispatch',
                                    textAlign: TextAlign.center,
                                    style: _poppins(
                                      size: 10,
                                      weight: FontWeight.w300,
                                      color: _loginBodyMuted,
                                      height: 1.2,
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
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
