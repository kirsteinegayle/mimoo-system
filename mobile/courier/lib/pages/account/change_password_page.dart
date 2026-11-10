import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../state/auth_service.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';
import '../auth/login_page.dart';

class ChangePasswordPage extends StatefulWidget {
  const ChangePasswordPage({super.key});

  @override
  State<ChangePasswordPage> createState() => _ChangePasswordPageState();
}

class _ChangePasswordPageState extends State<ChangePasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _currentCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _saving = false;
  bool _obscure = true;

  @override
  void dispose() {
    _currentCtrl.dispose();
    _newCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false) || _saving) return;
    setState(() => _saving = true);
    try {
      await CourierRepository.instance.changePassword(
        currentPassword: _currentCtrl.text,
        password: _newCtrl.text,
        passwordConfirmation: _confirmCtrl.text,
      );
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (_) => AlertDialog(
          title: const Text('Password changed'),
          content: const Text(
              'Please log in again with your new password. Other devices have been signed out.'),
          actions: [
            FilledButton(
              onPressed: () => Navigator.pop(context),
              style: FilledButton.styleFrom(backgroundColor: kPrimary),
              child: const Text('Log in again'),
            ),
          ],
        ),
      );
      await AuthService.instance.logout();
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginPage()),
        (route) => false,
      );
    } on ApiException catch (e) {
      if (mounted) courierSnack(context, e.message, kFlash);
    } catch (e) {
      if (mounted) courierSnack(context, ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Text('Change Password',
            style: pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _currentCtrl,
              obscureText: _obscure,
              style: pjs(size: 13),
              decoration: mimooInput(
                hint: 'Current password',
                icon: Icons.lock_outline,
                suffix: IconButton(
                  onPressed: () => setState(() => _obscure = !_obscure),
                  icon: Icon(
                    _obscure ? Icons.visibility_outlined : Icons.visibility_off,
                    size: 19,
                    color: kSubtext,
                  ),
                ),
              ),
              validator: (v) => (v == null || v.isEmpty)
                  ? 'Enter your current password'
                  : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _newCtrl,
              obscureText: _obscure,
              style: pjs(size: 13),
              decoration:
                  mimooInput(hint: 'New password', icon: Icons.lock_reset),
              validator: (v) {
                if (v == null || v.length < 8) {
                  return 'Use at least 8 characters';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _confirmCtrl,
              obscureText: _obscure,
              style: pjs(size: 13),
              decoration:
                  mimooInput(hint: 'Confirm new password', icon: Icons.lock),
              validator: (v) {
                if (v != _newCtrl.text) return 'Passwords do not match';
                return null;
              },
            ),
            const SizedBox(height: 18),
            SizedBox(
              height: 50,
              child: FilledButton.icon(
                onPressed: _saving ? null : _save,
                style: FilledButton.styleFrom(
                  backgroundColor: kPrimary,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                icon: _saving
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.lock_reset, color: Colors.white),
                label: Text(_saving ? 'Saving...' : 'Change Password',
                    style: pjs(
                        size: 15,
                        weight: FontWeight.w800,
                        color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
