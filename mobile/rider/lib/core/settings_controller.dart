import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum NavAppPreference { ask, googleMaps, waze }

class EmergencyContact {
  final String name, relationship, phone;
  const EmergencyContact({required this.name, required this.relationship, required this.phone});

  Map<String, String> toJson() => {'name': name, 'relationship': relationship, 'phone': phone};

  factory EmergencyContact.fromJson(Map<String, dynamic> json) => EmergencyContact(
        name: json['name'] as String? ?? '',
        relationship: json['relationship'] as String? ?? '',
        phone: json['phone'] as String? ?? '',
      );
}

/// Single persisted source of truth for user preferences. Screens listen via
/// [SettingsScope] so a change applies immediately and survives restarts.
class SettingsController extends ChangeNotifier {
  SettingsController(this._prefs) {
    _themeMode = _readThemeMode();
    _locale = _readLocale();
    _navApp = _readNavApp();
    _notifyJobOffers = _prefs.getBool(_kNotifyJobOffers) ?? true;
    _notifyJobOfferSound = _prefs.getBool(_kNotifyJobOfferSound) ?? true;
    _notifyMessages = _prefs.getBool(_kNotifyMessages) ?? true;
    _notifyRemittance = _prefs.getBool(_kNotifyRemittance) ?? true;
    _notifyAnnouncements = _prefs.getBool(_kNotifyAnnouncements) ?? true;
    _biometric = _prefs.getBool(_kBiometric) ?? false;
    _remittanceCutoff =
        _prefs.getString(_kRemittanceCutoff) ?? '10:00 PM';
    _emergencyContacts = _readEmergencyContacts();
  }

  final SharedPreferences _prefs;
  final LocalAuthentication _auth = LocalAuthentication();

  static const _kThemeMode = 'settings.themeMode';
  static const _kLocale = 'settings.locale';
  static const _kNavApp = 'settings.navApp';
  static const _kNotifyJobOffers = 'settings.notify.jobOffers';
  static const _kNotifyJobOfferSound = 'settings.notify.jobOfferSound';
  static const _kNotifyMessages = 'settings.notify.messages';
  static const _kNotifyRemittance = 'settings.notify.remittance';
  static const _kNotifyAnnouncements = 'settings.notify.announcements';
  static const _kBiometric = 'settings.biometric';
  static const _kEmergencyContacts = 'settings.emergencyContacts';
  static const _kRemittanceCutoff = 'settings.remittanceCutoff';

  late ThemeMode _themeMode;
  late String? _locale;
  late NavAppPreference _navApp;
  late bool _notifyJobOffers, _notifyJobOfferSound, _notifyMessages, _notifyRemittance, _notifyAnnouncements;
  late bool _biometric;
  late String _remittanceCutoff;
  late List<EmergencyContact> _emergencyContacts;

  ThemeMode get themeMode => _themeMode;
  String? get locale => _locale;
  NavAppPreference get navApp => _navApp;
  bool get notifyJobOffers => _notifyJobOffers;
  bool get notifyJobOfferSound => _notifyJobOfferSound;
  bool get notifyMessages => _notifyMessages;
  bool get notifyRemittance => _notifyRemittance;
  bool get notifyAnnouncements => _notifyAnnouncements;
  bool get biometric => _biometric;
  String get remittanceCutoff => _remittanceCutoff;
  List<EmergencyContact> get emergencyContacts => List.unmodifiable(_emergencyContacts);

  ThemeMode _readThemeMode() => switch (_prefs.getString(_kThemeMode)) {
        'light' => ThemeMode.light,
        'dark' => ThemeMode.dark,
        _ => ThemeMode.system,
      };

  String? _readLocale() {
    final value = _prefs.getString(_kLocale);
    return value == null || value == 'system' ? null : value;
  }

  NavAppPreference _readNavApp() => switch (_prefs.getString(_kNavApp)) {
        'googleMaps' => NavAppPreference.googleMaps,
        'waze' => NavAppPreference.waze,
        _ => NavAppPreference.ask,
      };

  List<EmergencyContact> _readEmergencyContacts() {
    final raw = _prefs.getString(_kEmergencyContacts);
    if (raw == null || raw.isEmpty) return const [];
    try {
      final decoded = jsonDecode(raw) as List<dynamic>;
      return decoded.map((e) => EmergencyContact.fromJson(e as Map<String, dynamic>)).take(2).toList();
    } catch (_) {
      return const [];
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    notifyListeners();
    await _prefs.setString(_kThemeMode, switch (mode) {
      ThemeMode.light => 'light',
      ThemeMode.dark => 'dark',
      ThemeMode.system => 'system',
    });
  }

  Future<void> setLocale(String? code) async {
    _locale = code;
    notifyListeners();
    await _prefs.setString(_kLocale, code ?? 'system');
  }

  Future<void> setNavApp(NavAppPreference value) async {
    _navApp = value;
    notifyListeners();
    await _prefs.setString(_kNavApp, value.name);
  }

  Future<void> setNotifyJobOffers(bool value) async {
    _notifyJobOffers = value;
    notifyListeners();
    await _prefs.setBool(_kNotifyJobOffers, value);
  }

  Future<void> setNotifyJobOfferSound(bool value) async {
    _notifyJobOfferSound = value;
    notifyListeners();
    await _prefs.setBool(_kNotifyJobOfferSound, value);
  }

  Future<void> setNotifyMessages(bool value) async {
    _notifyMessages = value;
    notifyListeners();
    await _prefs.setBool(_kNotifyMessages, value);
  }

  Future<void> setNotifyRemittance(bool value) async {
    _notifyRemittance = value;
    notifyListeners();
    await _prefs.setBool(_kNotifyRemittance, value);
  }

  Future<void> setNotifyAnnouncements(bool value) async {
    _notifyAnnouncements = value;
    notifyListeners();
    await _prefs.setBool(_kNotifyAnnouncements, value);
  }

  Future<void> setBiometric(bool value) async {
    _biometric = value;
    notifyListeners();
    await _prefs.setBool(_kBiometric, value);
  }

  Future<void> setRemittanceCutoff(String value) async {
    _remittanceCutoff = value;
    notifyListeners();
    await _prefs.setString(_kRemittanceCutoff, value);
  }

  // TODO(api): sync the emergency contacts with the rider profile endpoint.
  Future<void> saveEmergencyContacts(List<EmergencyContact> contacts) async {
    _emergencyContacts = contacts.take(2).toList();
    notifyListeners();
    await _prefs.setString(_kEmergencyContacts, jsonEncode([for (final c in _emergencyContacts) c.toJson()]));
  }

  /// Device biometric / screen-lock prompt (biometric lock). Returns true
  /// when it succeeds.
  Future<bool> authenticateBiometric(String reason, {bool biometricOnly = true}) async {
    try {
      final supported = await _auth.isDeviceSupported();
      final canCheck = await _auth.canCheckBiometrics;
      if (!supported || (biometricOnly && !canCheck)) return false;
      return await _auth.authenticate(
        localizedReason: reason,
        biometricOnly: biometricOnly,
        persistAcrossBackgrounding: true,
      );
    } catch (_) {
      return false;
    }
  }
}

/// Provides the controller to the widget tree without adding a state package.
class SettingsScope extends InheritedNotifier<SettingsController> {
  const SettingsScope({super.key, required SettingsController controller, required super.child}) : super(notifier: controller);

  static SettingsController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<SettingsScope>();
    assert(scope != null, 'SettingsScope is missing above this widget');
    return scope!.notifier!;
  }

  static SettingsController? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<SettingsScope>()?.notifier;
}
