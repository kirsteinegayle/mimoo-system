import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mimoo_rider/core/settings_controller.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Tests for SettingsController persistence — verifies that preferences
/// survive a controller rebuild (simulating app restart).

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('SettingsController persists theme mode', () async {
    final prefs = await SharedPreferences.getInstance();
    final settings = SettingsController(prefs);

    // Default should be system.
    expect(settings.themeMode, ThemeMode.system);

    // Change to dark.
    await settings.setThemeMode(ThemeMode.dark);
    expect(settings.themeMode, ThemeMode.dark);

    // Simulate restart — create a new controller with the same prefs.
    final settings2 = SettingsController(prefs);
    expect(settings2.themeMode, ThemeMode.dark);
  });

  test('SettingsController persists locale', () async {
    final prefs = await SharedPreferences.getInstance();
    final settings = SettingsController(prefs);

    expect(settings.locale, isNull); // System default.

    await settings.setLocale('fil');
    expect(settings.locale, 'fil');

    // Simulate restart.
    final settings2 = SettingsController(prefs);
    expect(settings2.locale, 'fil');
  });

  test('SettingsController persists nav app preference', () async {
    final prefs = await SharedPreferences.getInstance();
    final settings = SettingsController(prefs);

    expect(settings.navApp, NavAppPreference.ask);

    await settings.setNavApp(NavAppPreference.waze);
    expect(settings.navApp, NavAppPreference.waze);

    final settings2 = SettingsController(prefs);
    expect(settings2.navApp, NavAppPreference.waze);
  });

  test('SettingsController persists notification toggles', () async {
    final prefs = await SharedPreferences.getInstance();
    final settings = SettingsController(prefs);

    expect(settings.notifyJobOffers, isTrue);
    expect(settings.notifyRemittance, isTrue);

    await settings.setNotifyJobOffers(false);
    await settings.setNotifyRemittance(false);

    expect(settings.notifyJobOffers, isFalse);
    expect(settings.notifyRemittance, isFalse);

    final settings2 = SettingsController(prefs);
    expect(settings2.notifyJobOffers, isFalse);
    expect(settings2.notifyRemittance, isFalse);
  });

  test('SettingsController persists biometric flag', () async {
    final prefs = await SharedPreferences.getInstance();
    final settings = SettingsController(prefs);

    expect(settings.biometric, isFalse);

    await settings.setBiometric(true);
    expect(settings.biometric, isTrue);

    final settings2 = SettingsController(prefs);
    expect(settings2.biometric, isTrue);
  });

  test('SettingsController emergency contacts serialize and persist', () async {
    final prefs = await SharedPreferences.getInstance();
    final settings = SettingsController(prefs);

    expect(settings.emergencyContacts, isEmpty);

    await settings.saveEmergencyContacts([
      const EmergencyContact(name: 'Jane', relationship: 'Spouse', phone: '09191234567'),
      const EmergencyContact(name: 'John', relationship: 'Brother', phone: '09181111111'),
    ]);

    expect(settings.emergencyContacts.length, 2);
    expect(settings.emergencyContacts.first.name, 'Jane');

    // Simulate restart.
    final settings2 = SettingsController(prefs);
    expect(settings2.emergencyContacts.length, 2);
    expect(settings2.emergencyContacts.first.name, 'Jane');
    expect(settings2.emergencyContacts.last.phone, '09181111111');
  });

  test('SettingsController caps emergency contacts at 2', () async {
    final prefs = await SharedPreferences.getInstance();
    final settings = SettingsController(prefs);

    await settings.saveEmergencyContacts([
      const EmergencyContact(name: 'A', relationship: 'X', phone: '1'),
      const EmergencyContact(name: 'B', relationship: 'Y', phone: '2'),
      const EmergencyContact(name: 'C', relationship: 'Z', phone: '3'),
    ]);

    expect(settings.emergencyContacts.length, 2);
    expect(settings.emergencyContacts.last.name, 'B');
  });

  test('SettingsController notifies listeners on change', () async {
    final prefs = await SharedPreferences.getInstance();
    final settings = SettingsController(prefs);

    var notifications = 0;
    settings.addListener(() => notifications++);

    await settings.setThemeMode(ThemeMode.dark);
    expect(notifications, greaterThan(0));

    final before = notifications;
    await settings.setNotifyJobOffers(false);
    expect(notifications, greaterThan(before));
  });
}
