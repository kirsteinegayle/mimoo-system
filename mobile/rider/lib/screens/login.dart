import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/api_config.dart';
import '../core/app_info.dart';
import '../core/auth_controller.dart';
import '../core/error_messages.dart';
import '../core/settings_controller.dart';
import '../core/theme.dart';
import '../data/repositories/app_repositories_scope.dart';
import '../data/api/rider_api.dart';
import '../mock/rider_mock.dart'
    show RiderMock, kApplyToRideUrl, kForgotPasswordUrl;
import '../widgets/mimoo_logo.dart';
import '../widgets/motion.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _hide = true;
  bool _isLoading = false;
  bool _debugVisible = false;
  int _debugPresses = 0;
  String? _error;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // DEBUG builds only: prefill the demo rider from `rider:demo-seed`.
    if (kDebugMode && !useMock) {
      _emailController.text = kDebugDemoEmail;
      _passwordController.text = kDebugDemoPassword;
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (_isLoading) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      if (!useMock) {
        // Real login: POST /api/rider-app/login, token saved for next start.
        await RiderApi.instance
            .login(_emailController.text.trim(), _passwordController.text);
        if (!mounted) return;
        AuthScope.of(context).signIn();
        RiderMock.instance.onLoggedIn(); // loads jobs in the background
        Navigator.pushReplacementNamed(context, '/home');
        return;
      }
      await AppRepositoriesScope.of(context)
          .signIn(_emailController.text.trim(), _passwordController.text);
      if (!mounted) return;
      AuthScope.of(context).signIn();
      Navigator.pushReplacementNamed(context, '/home');
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = friendlyError(error));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loginWithPasskey() async {
    if (_isLoading) return;
    if (!useMock) {
      // TODO(api): passkey sign-in has no server endpoint yet.
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text(
              'Passkey sign-in is not available yet. Use your email and password.')));
      return;
    }
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final settings = SettingsScope.of(context);
      final authScope = AuthScope.of(context);

      if (!settings.passkeySetUp) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text(
                  'No passkey registered. Sign in with your password first, then set up a passkey in Settings.')));
        }
        return;
      }

      final ok = await settings.authenticateBiometric('Sign in to Mimoo Rider');
      if (!mounted) return;
      if (!ok) {
        setState(() => _error = 'Biometric authentication failed. Please try again.');
        return;
      }

      // Biometrics passed — sign in by refreshing local data without password check.
      await AppRepositoriesScope.of(context).signIn('rider@mimoo.ph', '___passkey___');
      if (!mounted) return;
      authScope.signIn();
      Navigator.pushReplacementNamed(context, '/home');
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = friendlyError(error));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _revealDebugTools() {
    if (!kDebugMode || _debugVisible) return;
    if (++_debugPresses >= 5) setState(() => _debugVisible = true);
  }

  void _clearError() {
    if (_error != null) setState(() => _error = null);
  }

  // ── UI only below. Sign-in logic above is unchanged. ──────────────────────

  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();
  int _shake = 0;
  String? _lastError;

  Future<void> _openWebsite(String? url, String fallback) async {
    final messenger = ScaffoldMessenger.of(context);
    var opened = false;
    if (url != null) {
      try {
        opened = await launchUrl(Uri.parse(url),
            mode: LaunchMode.externalApplication);
      } catch (_) {
        opened = false;
      }
    }
    if (!opened) {
      messenger.showSnackBar(SnackBar(content: Text(fallback)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final startupError = AuthScope.of(context).startupError;
    final message = _error ?? startupError;
    // Shake the form once each time a new login error appears.
    if (_error != null && _error != _lastError) _shake++;
    _lastError = _error;
    return Scaffold(
      backgroundColor: MC.bg,
      body: SingleChildScrollView(
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          FadeSlideIn(offset: -12, child: _brandHeader()),
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    FadeSlideIn(
                        delay: const Duration(milliseconds: 120),
                        child: _loginCard(message)),
                    const SizedBox(height: 20),
                    FadeSlideIn(
                      delay: const Duration(milliseconds: 360),
                      child: Center(
                        child: TextButton(
                          onPressed: () => _openWebsite(kApplyToRideUrl,
                              'Apply on the Mimoo website'),
                          child: Text.rich(
                            TextSpan(
                              text: 'New courier? ',
                              style: MT.bodyMd
                                  .copyWith(color: MC.onSurfaceVariant),
                              children: [
                                TextSpan(
                                    text: 'Apply to ride with Mimoo',
                                    style: MT.labelLg
                                        .copyWith(color: MC.violet)),
                              ],
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                      const Icon(Icons.lock_outline,
                          size: 13, color: MC.onSurfaceVariant),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text('Secure Rider Portal • v$kAppVersion',
                            style: MT.bodySm
                                .copyWith(color: MC.onSurfaceVariant)),
                      ),
                    ]),
                    if (kDebugMode && _debugVisible) ...[
                      const SizedBox(height: 16),
                      _debugTools(),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ]),
      ),
    );
  }

  Widget _brandHeader() => GestureDetector(
        onLongPress: _revealDebugTools,
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [MC.violetDark, MC.violet],
            ),
            borderRadius: BorderRadius.vertical(bottom: Radius.circular(32)),
          ),
          child: SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 36),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Container(
                      width: 52,
                      height: 52,
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                            color: Colors.white.withValues(alpha: 0.2)),
                      ),
                      child: const MimooLogo(size: 44, showRiderLabel: false),
                    ),
                    const SizedBox(width: 12),
                    Flexible(
                      child: Text('Mimoo Rider',
                          style: ts(20, w: FontWeight.w800, c: Colors.white)),
                    ),
                    const SizedBox(width: 6),
                    const PulseDot(color: MC.greenSoft, size: 7),
                  ]),
                  const SizedBox(height: 28),
                  Text('Deliver more.',
                      style:
                          ts(32, w: FontWeight.w800, c: Colors.white, h: 1.15)),
                  Text('Earn better.',
                      style: ts(32,
                          w: FontWeight.w800,
                          c: const Color(0xFFFFB2B7),
                          h: 1.15)),
                  const SizedBox(height: 10),
                  Text('Track parcels and payouts in one place.',
                      style: ts(15,
                          w: FontWeight.w500,
                          c: Colors.white.withValues(alpha: 0.8))),
                ],
              ),
            ),
          ),
        ),
      );

  Widget _loginCard(String? message) => Shake(
        trigger: _shake,
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Welcome back', style: MT.headlineXl),
              const SizedBox(height: 4),
              Text('Sign in to see your assigned jobs.',
                  style: MT.bodyMd.copyWith(color: MC.onSurfaceVariant)),
              const SizedBox(height: 20),
              FadeSlideIn(
                delay: const Duration(milliseconds: 200),
                child: _GlowField(
                  label: 'Email',
                  hint: 'you@example.com',
                  icon: Icons.mail_outline,
                  controller: _emailController,
                  focusNode: _emailFocus,
                  keyboard: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  hasError: _error != null,
                  onChanged: (_) => _clearError(),
                  onSubmitted: (_) => _passwordFocus.requestFocus(),
                ),
              ),
              const SizedBox(height: 14),
              FadeSlideIn(
                delay: const Duration(milliseconds: 260),
                child: _GlowField(
                  label: 'Password',
                  hint: 'Your password',
                  icon: Icons.lock_outline,
                  controller: _passwordController,
                  focusNode: _passwordFocus,
                  obscure: _hide,
                  hasError: _error != null,
                  textInputAction: TextInputAction.done,
                  onChanged: (_) => _clearError(),
                  onSubmitted: (_) => _login(),
                  suffix: IconButton(
                    tooltip: _hide ? 'Show password' : 'Hide password',
                    onPressed: () => setState(() => _hide = !_hide),
                    icon: Icon(
                        _hide
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        color: MC.onSurfaceVariant),
                  ),
                ),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => _openWebsite(kForgotPasswordUrl,
                      'Reset your password on the Mimoo website'),
                  child: Text('Forgot password?',
                      style: MT.labelMd.copyWith(color: MC.violet)),
                ),
              ),
              if (message != null) ...[
                _errorBanner(message, closable: _error != null),
                const SizedBox(height: 12),
              ],
              FadeSlideIn(
                delay: const Duration(milliseconds: 320),
                child: _GradientButton(
                  label: 'Sign in',
                  loading: _isLoading,
                  onPressed: _isLoading ? null : _login,
                ),
              ),
              const SizedBox(height: 4),
              Center(
                child: TextButton.icon(
                  onPressed: _isLoading ? null : _loginWithPasskey,
                  icon: const Icon(Icons.fingerprint, size: 20),
                  label: const Text('Sign in with passkey'),
                ),
              ),
            ]),
      );

  Widget _errorBanner(String message, {required bool closable}) => Container(
        padding: const EdgeInsets.fromLTRB(12, 8, 4, 8),
        decoration: BoxDecoration(
          color: MC.errorSoft,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Padding(
            padding: EdgeInsets.only(top: 4),
            child: Icon(Icons.error_outline, color: MC.coral, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Text(message,
                  style: MT.bodySm.copyWith(
                      color: MC.coral, fontWeight: FontWeight.w600)),
            ),
          ),
          if (closable)
            IconButton(
              tooltip: 'Dismiss',
              onPressed: _clearError,
              icon: const Icon(Icons.close, size: 18, color: MC.coral),
            )
          else
            const SizedBox(width: 8),
        ]),
      );

  Widget _debugTools() => MCard(
        color: MC.low,
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('DEBUG TOOLS',
                  style: MT.badge.copyWith(color: MC.onSurfaceVariant)),
              const SizedBox(height: 4),
              Wrap(spacing: 8, runSpacing: 4, children: [
                TextButton(
                    onPressed: () =>
                        Navigator.pushNamed(context, '/suspended'),
                    child: const Text('Suspended')),
              ]),
            ]),
      );
}


/// Text field with an animated focus glow.
class _GlowField extends StatefulWidget {
  const _GlowField({
    required this.label,
    required this.icon,
    required this.controller,
    required this.focusNode,
    this.hint,
    this.obscure = false,
    this.hasError = false,
    this.keyboard,
    this.textInputAction,
    this.suffix,
    this.onChanged,
    this.onSubmitted,
  });
  final String label;
  final String? hint;
  final IconData icon;
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool obscure, hasError;
  final TextInputType? keyboard;
  final TextInputAction? textInputAction;
  final Widget? suffix;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  @override
  State<_GlowField> createState() => _GlowFieldState();
}

class _GlowFieldState extends State<_GlowField> {
  @override
  void initState() {
    super.initState();
    widget.focusNode.addListener(_onFocus);
  }

  @override
  void dispose() {
    widget.focusNode.removeListener(_onFocus);
    super.dispose();
  }

  void _onFocus() => setState(() {});

  @override
  Widget build(BuildContext context) {
    final focused = widget.focusNode.hasFocus;
    final accent = widget.hasError ? MC.coral : MC.violet;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(widget.label, style: ts(13, w: FontWeight.w700, c: MC.text)),
      const SizedBox(height: 6),
      AnimatedContainer(
        duration: motion(context, const Duration(milliseconds: 180)),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
              color: focused || widget.hasError ? accent : MC.outlineVariant,
              width: focused ? 1.6 : 1),
          boxShadow: [
            if (focused)
              BoxShadow(
                  color: accent.withValues(alpha: 0.18),
                  blurRadius: 14,
                  spreadRadius: 1),
          ],
        ),
        child: TextField(
          controller: widget.controller,
          focusNode: widget.focusNode,
          obscureText: widget.obscure,
          keyboardType: widget.keyboard,
          textInputAction: widget.textInputAction,
          autocorrect: false,
          enableSuggestions: !widget.obscure,
          onChanged: widget.onChanged,
          onSubmitted: widget.onSubmitted,
          style: ts(15, c: MC.text),
          decoration: InputDecoration(
            hintText: widget.hint,
            border: InputBorder.none,
            prefixIcon: Icon(widget.icon,
                size: 20, color: focused ? accent : MC.onSurfaceVariant),
            suffixIcon: widget.suffix,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          ),
        ),
      ),
    ]);
  }
}

/// Large gradient call-to-action with press scale and loading spinner.
class _GradientButton extends StatelessWidget {
  const _GradientButton(
      {required this.label, required this.loading, this.onPressed});
  final String label;
  final bool loading;
  final VoidCallback? onPressed;
  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null;
    final active = enabled || loading;
    return PressScale(
      child: Semantics(
        button: true,
        enabled: enabled,
        label: label,
        excludeSemantics: true,
        child: Material(
          color: Colors.transparent,
          child: Ink(
            height: 56,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [
                active ? MC.violet : MC.highest,
                active ? MC.coral : MC.highest,
              ]),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                if (enabled)
                  BoxShadow(
                      color: MC.violet.withValues(alpha: 0.3),
                      blurRadius: 16,
                      offset: const Offset(0, 6)),
              ],
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(18),
              onTap: onPressed,
              child: Center(
                child: AnimatedSwitcher(
                  duration: motion(context, const Duration(milliseconds: 180)),
                  child: loading
                      ? const SizedBox(
                          key: ValueKey('spin'),
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                              strokeWidth: 2.5, color: Colors.white))
                      : Row(
                          key: const ValueKey('label'),
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(label,
                                style: ts(16,
                                    w: FontWeight.w800, c: Colors.white)),
                            const SizedBox(width: 8),
                            const Icon(Icons.arrow_forward,
                                color: Colors.white, size: 20),
                          ]),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
