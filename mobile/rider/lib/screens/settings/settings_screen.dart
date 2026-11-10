import 'package:flutter/material.dart';
import '../../core/auth_controller.dart';
import '../../core/settings_controller.dart';
import '../../core/theme.dart';
import '../../data/repositories/app_repositories_scope.dart';
import '../../l10n/generated/app_localizations.dart';
import '../../mock/rider_mock.dart' show RiderMock;
import '../../widgets/common.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final settings = SettingsScope.of(context);

    return MScaffold(
      title: l10n.settingsTitle,
      body: ListView(padding: MS.pagePadding, children: [
        _SectionHeader(l10n.settingsAccountManagement),
        _Card(children: [
          _Tile(
            icon: Icons.lock_outline_rounded,
            title: l10n.settingsChangePassword,
            onTap: () =>
                Navigator.pushNamed(context, '/settings/change-password'),
          ),
          _Tile(
            icon: Icons.fingerprint_rounded,
            title: l10n.settingsPasskey,
            subtitle: settings.passkeySetUp
                ? l10n.settingsPasskeySet
                : l10n.settingsPasskeyNotSet,
            onTap: () => Navigator.pushNamed(context, '/settings/passkey'),
          ),
          _Tile(
            icon: Icons.emergency_outlined,
            title: l10n.settingsEmergencyContact,
            subtitle: settings.emergencyContacts.isEmpty
                ? l10n.settingsEmergencyNone
                : settings.emergencyContacts.first.name,
            onTap: () =>
                Navigator.pushNamed(context, '/settings/emergency-contacts'),
          ),
          _SwitchTile(
            icon: Icons.face_retouching_natural_outlined,
            title: l10n.settingsBiometric,
            subtitle: l10n.settingsBiometricSubtitle,
            value: settings.biometric,
            onChanged: (value) => _toggleBiometric(context, settings, value),
          ),
        ]),
        _SectionHeader(l10n.settingsPreferences),
        _Card(children: [
          _Tile(
            icon: Icons.translate_rounded,
            title: l10n.settingsLanguage,
            trailingText: _languageLabel(l10n, settings.locale),
            onTap: () => _pickLanguage(context, settings, l10n),
          ),
          _Tile(
            icon: Icons.brightness_6_outlined,
            title: l10n.settingsAppearance,
            trailingText: _appearanceLabel(l10n, settings.themeMode),
            onTap: () => _pickAppearance(context, settings, l10n),
          ),
          _SwitchTile(
            icon: Icons.work_outline_rounded,
            title: l10n.notificationJobOffers,
            value: settings.notifyJobOffers,
            onChanged: settings.setNotifyJobOffers,
          ),
          _SwitchTile(
            icon: Icons.volume_up_outlined,
            title: l10n.notificationJobOfferSound,
            value: settings.notifyJobOfferSound,
            onChanged: settings.notifyJobOffers
                ? settings.setNotifyJobOfferSound
                : null,
          ),
          _SwitchTile(
            icon: Icons.chat_bubble_outline_rounded,
            title: l10n.notificationMessages,
            value: settings.notifyMessages,
            onChanged: settings.setNotifyMessages,
          ),
          _SwitchTile(
            icon: Icons.account_balance_wallet_outlined,
            title: l10n.notificationRemittance,
            value: settings.notifyRemittance,
            onChanged: settings.setNotifyRemittance,
          ),
          _SwitchTile(
            icon: Icons.campaign_outlined,
            title: l10n.notificationAnnouncements,
            value: settings.notifyAnnouncements,
            onChanged: settings.setNotifyAnnouncements,
          ),
          _Tile(
            icon: Icons.navigation_outlined,
            title: l10n.settingsDefaultNav,
            trailingText: _navLabel(l10n, settings.navApp),
            onTap: () => _pickNavApp(context, settings, l10n),
          ),
          _Tile(
            icon: Icons.place_outlined,
            title: l10n.settingsLocationPermissions,
            onTap: () => Navigator.pushNamed(context, '/settings/permissions'),
          ),
        ]),
        _SectionHeader(l10n.settingsAbout),
        _Card(children: [
          _Tile(
            icon: Icons.privacy_tip_outlined,
            title: l10n.settingsPrivacy,
            onTap: () => Navigator.pushNamed(context, '/settings/privacy'),
          ),
          _Tile(
            icon: Icons.description_outlined,
            title: l10n.settingsTerms,
            onTap: () => Navigator.pushNamed(context, '/settings/terms'),
          ),
          _Tile(
            icon: Icons.info_outline_rounded,
            title: l10n.settingsAboutMimoo,
            onTap: () => Navigator.pushNamed(context, '/settings/about'),
          ),
        ]),
        const SizedBox(height: 24),
        PillButton.danger(
          l10n.settingsLogout,
          leading: Icons.logout,
          trailing: null,
          onPressed: () => _logout(context, l10n),
        ),
        const SizedBox(height: 8),
      ]),
    );
  }

  static String _languageLabel(AppLocalizations l10n, String? code) =>
      switch (code) {
        'en' => l10n.languageEnglish,
        'fil' => l10n.languageFilipino,
        _ => l10n.languageSystem,
      };

  static String _appearanceLabel(AppLocalizations l10n, ThemeMode mode) =>
      switch (mode) {
        ThemeMode.light => l10n.appearanceLight,
        ThemeMode.dark => l10n.appearanceDark,
        ThemeMode.system => l10n.appearanceSystem,
      };

  static String _navLabel(AppLocalizations l10n, NavAppPreference value) =>
      switch (value) {
        NavAppPreference.googleMaps => l10n.navGoogleMaps,
        NavAppPreference.waze => l10n.navWaze,
        NavAppPreference.ask => l10n.navAskEveryTime,
      };

  Future<void> _toggleBiometric(
      BuildContext context, SettingsController settings, bool value) async {
    if (!value) {
      await settings.setBiometric(false);
      return;
    }
    final l10n = AppLocalizations.of(context);
    final ok = await settings.authenticateBiometric(l10n.biometricLockReason);
    if (!context.mounted) return;
    if (!ok) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(l10n.biometricUnavailable)));
      return;
    }
    await settings.setBiometric(true);
  }

  Future<void> _pickLanguage(BuildContext context, SettingsController settings,
          AppLocalizations l10n) =>
      showModalBottomSheet<void>(
        context: context,
        backgroundColor: MC.of(context).lowest,
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
        builder: (ctx) => SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Text(l10n.settingsLanguage,
                  style: ts(18, w: FontWeight.w700, c: MC.of(ctx).text)),
              const SizedBox(height: 8),
              _ChoiceTile(
                  label: l10n.languageSystem,
                  selected: settings.locale == null,
                  onTap: () {
                    settings.setLocale(null);
                    Navigator.pop(ctx);
                  }),
              _ChoiceTile(
                  label: l10n.languageEnglish,
                  selected: settings.locale == 'en',
                  onTap: () {
                    settings.setLocale('en');
                    Navigator.pop(ctx);
                  }),
              _ChoiceTile(
                  label: l10n.languageFilipino,
                  selected: settings.locale == 'fil',
                  onTap: () {
                    settings.setLocale('fil');
                    Navigator.pop(ctx);
                  }),
            ]),
          ),
        ),
      );

  Future<void> _pickAppearance(BuildContext context,
          SettingsController settings, AppLocalizations l10n) =>
      showModalBottomSheet<void>(
        context: context,
        backgroundColor: MC.of(context).lowest,
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
        builder: (ctx) => SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Text(l10n.settingsAppearance,
                  style: ts(18, w: FontWeight.w700, c: MC.of(ctx).text)),
              const SizedBox(height: 8),
              _ChoiceTile(
                  label: l10n.appearanceSystem,
                  selected: settings.themeMode == ThemeMode.system,
                  onTap: () {
                    settings.setThemeMode(ThemeMode.system);
                    Navigator.pop(ctx);
                  }),
              _ChoiceTile(
                  label: l10n.appearanceLight,
                  selected: settings.themeMode == ThemeMode.light,
                  onTap: () {
                    settings.setThemeMode(ThemeMode.light);
                    Navigator.pop(ctx);
                  }),
              _ChoiceTile(
                  label: l10n.appearanceDark,
                  selected: settings.themeMode == ThemeMode.dark,
                  onTap: () {
                    settings.setThemeMode(ThemeMode.dark);
                    Navigator.pop(ctx);
                  }),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Text(l10n.settingsAppearanceAfterSignIn,
                    textAlign: TextAlign.center,
                    style: ts(12, c: MC.of(ctx).muted)),
              ),
            ]),
          ),
        ),
      );

  Future<void> _pickNavApp(BuildContext context, SettingsController settings,
          AppLocalizations l10n) =>
      showModalBottomSheet<void>(
        context: context,
        backgroundColor: MC.of(context).lowest,
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
        builder: (ctx) => SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Text(l10n.settingsDefaultNav,
                  style: ts(18, w: FontWeight.w700, c: MC.of(ctx).text)),
              const SizedBox(height: 8),
              _ChoiceTile(
                  label: l10n.navAskEveryTime,
                  selected: settings.navApp == NavAppPreference.ask,
                  onTap: () {
                    settings.setNavApp(NavAppPreference.ask);
                    Navigator.pop(ctx);
                  }),
              _ChoiceTile(
                  label: l10n.navGoogleMaps,
                  selected: settings.navApp == NavAppPreference.googleMaps,
                  onTap: () {
                    settings.setNavApp(NavAppPreference.googleMaps);
                    Navigator.pop(ctx);
                  }),
              _ChoiceTile(
                  label: l10n.navWaze,
                  selected: settings.navApp == NavAppPreference.waze,
                  onTap: () {
                    settings.setNavApp(NavAppPreference.waze);
                    Navigator.pop(ctx);
                  }),
            ]),
          ),
        ),
      );

  Future<void> _logout(BuildContext context, AppLocalizations l10n) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (c) {
        final palette = MC.of(c);
        return AlertDialog(
          backgroundColor: palette.lowest,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(l10n.settingsLogoutTitle,
              style: MT.headlineMd.copyWith(color: palette.text)),
          content: Column(mainAxisSize: MainAxisSize.min, children: [
            InfoBanner(Icons.report_problem, l10n.settingsLogoutWarning,
                bg: palette.errorContainer.withValues(alpha: .5),
                fg: palette.text),
          ]),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(c),
                child: Text(l10n.commonCancel)),
            FilledButton(
              style: FilledButton.styleFrom(
                  backgroundColor: palette.tertiaryContainer),
              onPressed: () => Navigator.pop(c, true),
              child: Text(l10n.settingsLogout),
            ),
          ],
        );
      },
    );
    if (confirmed == true && context.mounted) {
      try {
        final repositories = AppRepositoriesScope.of(context);
        await RiderMock.instance.signOut(); // API mode: revoke token + clear data
        await repositories.signOut();
      } catch (error) {
        if (!context.mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not sign out: $error')),
        );
        return;
      }
      if (!context.mounted) return;
      AuthScope.of(context).signOut();
      Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
    }
  }
}

class _SectionHeader extends StatelessWidget {
  final String text;
  const _SectionHeader(this.text);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(4, MS.xl, 4, MS.md),
        child: Text(text.toUpperCase(),
            style: ts(12, w: FontWeight.w800, c: MC.of(context).muted)),
      );
}

class _Card extends StatelessWidget {
  final List<Widget> children;
  const _Card({required this.children});
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final rows = <Widget>[];
    for (var i = 0; i < children.length; i++) {
      if (i > 0) {
        rows.add(Divider(height: 1, indent: 64, color: c.outlineVariant));
      }
      rows.add(children[i]);
    }
    return Container(
      decoration: BoxDecoration(
          color: c.lowest, borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      child: Column(children: rows),
    );
  }
}

class _Tile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final String? trailingText;
  final VoidCallback? onTap;
  const _Tile(
      {required this.icon,
      required this.title,
      this.subtitle,
      this.trailingText,
      this.onTap});
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return ListTile(
      minVerticalPadding: MS.md,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
      leading: IconDot(icon, size: 36, bg: c.tint, fg: c.primary),
      title: Text(title, style: ts(14, w: FontWeight.w600, c: c.text)),
      subtitle:
          subtitle == null ? null : Text(subtitle!, style: ts(12, c: c.muted)),
      trailing: Row(mainAxisSize: MainAxisSize.min, children: [
        if (trailingText != null)
          Text(trailingText!, style: ts(12, c: c.muted)),
        const SizedBox(width: 4),
        Icon(Icons.chevron_right, color: c.onSurfaceVariant),
      ]),
      onTap: onTap,
    );
  }
}

class _SwitchTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool>? onChanged;
  const _SwitchTile(
      {required this.icon,
      required this.title,
      this.subtitle,
      required this.value,
      this.onChanged});
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return SwitchListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      secondary: IconDot(icon, size: 36, bg: c.tint, fg: c.primary),
      title: Text(title, style: ts(14, w: FontWeight.w600, c: c.text)),
      subtitle:
          subtitle == null ? null : Text(subtitle!, style: ts(12, c: c.muted)),
      value: value,
      onChanged: onChanged,
      activeTrackColor: c.green,
    );
  }
}

class _ChoiceTile extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _ChoiceTile(
      {required this.label, required this.selected, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return ListTile(
      minVerticalPadding: MS.md,
      title: Text(label, style: ts(14, w: FontWeight.w600, c: c.text)),
      trailing: selected
          ? Icon(Icons.check_circle, color: c.primary)
          : Icon(Icons.circle_outlined, color: c.outline),
      onTap: onTap,
    );
  }
}
