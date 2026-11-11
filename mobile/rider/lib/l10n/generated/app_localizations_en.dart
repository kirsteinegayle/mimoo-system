// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Mimoo Rider';

  @override
  String get navHome => 'Home';

  @override
  String get navJobs => 'Jobs';

  @override
  String get navScan => 'Scan';

  @override
  String get navEarnings => 'Earnings';

  @override
  String get navHistory => 'History';

  @override
  String get drawerVehicleDocuments => 'Vehicle & Documents';

  @override
  String get drawerCodRemittance => 'COD Remittance';

  @override
  String get drawerMessages => 'Messages';

  @override
  String get drawerNotifications => 'Notifications';

  @override
  String get drawerSettings => 'Settings';

  @override
  String get drawerHelpCenter => 'Help Center';

  @override
  String get drawerActive => 'Active';

  @override
  String drawerVersion(String version) {
    return 'Mimoo Rider v$version';
  }

  @override
  String get profileTitle => 'Profile';

  @override
  String get profileChangePhoto => 'Change photo';

  @override
  String get profileTakePhoto => 'Take a photo';

  @override
  String get podPhotoSizeError =>
      'Photo must be JPG or PNG and no larger than 5 MB.';

  @override
  String get profileChooseGallery => 'Choose from gallery';

  @override
  String get profileVerifiedIdentity => 'Verified identity';

  @override
  String get profileFullLegalName => 'Full legal name';

  @override
  String get profileDateOfBirth => 'Date of birth';

  @override
  String get profileLicenseNumber => 'License number';

  @override
  String get profileContactLogistics =>
      'Contact Logistics to change these details.';

  @override
  String get profileContactNumber => 'Contact number';

  @override
  String get profileResidentialAddress => 'Residential address';

  @override
  String get profileSaveChanges => 'Save changes';

  @override
  String get profileDiscardTitle => 'Discard changes?';

  @override
  String get profileDiscardBody =>
      'Your edits to the contact number or address will be lost.';

  @override
  String get profileKeepEditing => 'Keep editing';

  @override
  String get profileDiscard => 'Discard';

  @override
  String get profileUpdated => 'Profile updated.';

  @override
  String get settingsTitle => 'Settings';

  @override
  String get settingsAccountManagement => 'Account management';

  @override
  String get settingsChangePassword => 'Change password';

  @override
  String get settingsEmergencyContact => 'Emergency contact';

  @override
  String get settingsBiometric => 'Biometric unlock on app open';

  @override
  String get settingsPreferences => 'Preferences';

  @override
  String get settingsLanguage => 'Language';

  @override
  String get settingsAppearance => 'Appearance';

  @override
  String get settingsNotifications => 'Notifications';

  @override
  String get settingsDefaultNav => 'Default navigation app';

  @override
  String get settingsLocationPermissions => 'Location & permissions';

  @override
  String get settingsAbout => 'About';

  @override
  String get settingsPrivacy => 'Privacy policy';

  @override
  String get settingsTerms => 'Terms of service';

  @override
  String get settingsAboutMimoo => 'About Mimoo';

  @override
  String get settingsLogout => 'Log out';

  @override
  String get languageSystem => 'System default';

  @override
  String get languageEnglish => 'English';

  @override
  String get languageFilipino => 'Filipino';

  @override
  String get appearanceSystem => 'System';

  @override
  String get appearanceLight => 'Light';

  @override
  String get appearanceDark => 'Dark';

  @override
  String get settingsAppearanceAfterSignIn => 'Applies after you sign in.';

  @override
  String get riderStatusOnline => 'You\'re online';

  @override
  String get riderStatusOffline => 'You\'re offline';

  @override
  String get riderStatusSuspended =>
      'Your account is suspended. Contact your dispatcher to go online.';

  @override
  String get riderStatusTooltipOnline => 'Online. Tap to go offline.';

  @override
  String get riderStatusTooltipOffline => 'Offline. Tap to go online.';

  @override
  String riderStatusHeldTitle(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'You have $count parcels out for delivery',
      one: 'You have 1 parcel out for delivery',
    );
    return '$_temp0';
  }

  @override
  String riderStatusHeldBody(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other:
          'You can go offline, but you must still deliver them to the buyer. No new jobs will be offered while offline.',
      one:
          'You can go offline, but you must still deliver it to the buyer. No new jobs will be offered while offline.',
    );
    return '$_temp0';
  }

  @override
  String outboxWaitingToSync(int count) {
    return 'Waiting to sync ($count)';
  }

  @override
  String get databaseUnsupportedPlatform =>
      'Local database storage is available on Android and iOS. Please open this app on a supported device.';

  @override
  String get databaseResetTitle => 'Reset local data?';

  @override
  String get databaseResetBody =>
      'This will replace local demo data with the original seed. Queued changes will be removed.';

  @override
  String get databaseResetAction => 'Reset local data';

  @override
  String get databaseResetCancel => 'Cancel';

  @override
  String get databaseResetDone => 'Local data has been reset.';

  @override
  String get locationOffBanner => 'Location is off. Tap to fix.';

  @override
  String get locationOffFix => 'Fix';

  @override
  String get riderStatusStayOnline => 'Stay online';

  @override
  String get riderStatusGoOffline => 'Go offline';

  @override
  String get notificationJobOffers => 'Job offer alerts';

  @override
  String get notificationJobOfferSound => 'Job offer sound';

  @override
  String get notificationMessages => 'Messages';

  @override
  String get notificationRemittance => 'Remittance reminders';

  @override
  String get notificationAnnouncements => 'System announcements';

  @override
  String get navAskEveryTime => 'Ask every time';

  @override
  String get navGoogleMaps => 'Google Maps';

  @override
  String get navWaze => 'Waze';

  @override
  String get helpTitle => 'Help Center';

  @override
  String get helpHeading => 'How can we help?';

  @override
  String get helpSubtitle =>
      'Search common rider questions or contact the Bilis Desk.';

  @override
  String get helpSearchHint => 'Search help topics';

  @override
  String get helpCallDesk => 'Call Bilis Desk';

  @override
  String get helpReportProblem => 'Report a problem';

  @override
  String helpNoResults(String query) {
    return 'No help topics match \"$query\"';
  }

  @override
  String get helpCategoryGettingStarted => 'Getting started';

  @override
  String get helpCategoryJobs => 'Jobs & pickups';

  @override
  String get helpCategoryDelivery => 'Delivery & proof of delivery';

  @override
  String get helpCategoryCod => 'COD & remittance';

  @override
  String get helpCategoryEarnings => 'Earnings';

  @override
  String get helpCategoryAccount => 'Account & safety';

  @override
  String get settingsEmergencyNone => 'No emergency contact yet';

  @override
  String get settingsBiometricSubtitle =>
      'Require biometrics when reopening Mimoo Rider';

  @override
  String get settingsLogoutWarning =>
      'If you have a picked-up parcel you must still deliver it.';

  @override
  String get biometricLockTitle => 'Mimoo Rider is locked';

  @override
  String get biometricLockBody =>
      'Unlock with your device biometrics to continue.';

  @override
  String get biometricUnlock => 'Unlock';

  @override
  String get biometricUsePasscode => 'Use device passcode';

  @override
  String get biometricLockReason => 'Unlock Mimoo Rider';

  @override
  String get biometricUnavailable =>
      'Biometric unlock isn\'t available. Try your device passcode.';

  @override
  String get commonCancel => 'Cancel';

  @override
  String get commonSave => 'Save';

  @override
  String get commonRemove => 'Remove';

  @override
  String get commonEdit => 'Edit';

  @override
  String get commonDelete => 'Delete';

  @override
  String get settingsLogoutTitle => 'Log out of Mimoo Rider?';

  @override
  String get changePasswordCurrent => 'Current password';

  @override
  String get changePasswordNew => 'New password';

  @override
  String get changePasswordConfirm => 'Confirm password';

  @override
  String get changePasswordRuleLength => 'At least 8 characters';

  @override
  String get changePasswordRuleUpper => 'Includes an uppercase letter';

  @override
  String get changePasswordRuleNumber =>
      'Includes a number or special character';

  @override
  String get changePasswordRuleMatch => 'Passwords match';

  @override
  String get changePasswordSubmit => 'Update password';

  @override
  String get changePasswordUpdated => 'Password updated.';

  @override
  String get changePasswordCurrentIncorrect => 'Current password is incorrect.';

  @override
  String get showPassword => 'Show password';

  @override
  String get hidePassword => 'Hide password';

  @override
  String get emergencyAddTitle => 'Add emergency contact';

  @override
  String get emergencyEditTitle => 'Edit emergency contact';

  @override
  String get emergencyFullName => 'Full name';

  @override
  String get emergencyRelationship => 'Relationship';

  @override
  String get emergencyRelationshipHint => 'e.g. Spouse, Parent';

  @override
  String get emergencyPhone => 'Phone number';

  @override
  String get emergencyRemoveTitle => 'Remove contact?';

  @override
  String emergencyRemoveBody(String name) {
    return '$name will no longer be listed as an emergency contact.';
  }

  @override
  String get emergencyInfoTitle => 'Up to 2 emergency contacts';

  @override
  String get emergencyInfoBody =>
      'The Bilis Desk may contact them if you are unreachable during a shift.';

  @override
  String get emergencyEmptyBody =>
      'Add someone the hub can call in an emergency.';

  @override
  String get emergencyAddAction => 'Add contact';

  @override
  String get emergencyMaxNote => 'You can keep at most 2 emergency contacts.';

  @override
  String get emergencyEditTooltip => 'Edit contact';

  @override
  String get emergencyDeleteTooltip => 'Delete contact';

  @override
  String get permissionsTitle => 'Location & permissions';

  @override
  String get permissionsChecking => 'Checking…';

  @override
  String get permissionsAllowed => 'Allowed';

  @override
  String get permissionsBlocked => 'Blocked';

  @override
  String get permissionsNotAllowed => 'Not allowed';

  @override
  String get permissionsUnknown => 'Unknown';

  @override
  String get permissionsLocation => 'Location';

  @override
  String get permissionsCamera => 'Camera';

  @override
  String get permissionsNotifications => 'Notifications';

  @override
  String get permissionsInfoTitle => 'Manage access in system settings';

  @override
  String get permissionsInfoBody =>
      'Location is required to go online. Camera is required for proof of delivery. Notifications keep you updated on offers.';

  @override
  String get permissionsOpenSettings => 'Open app settings';

  @override
  String get aboutTagline =>
      'Delivery jobs, COD remittance and proof of delivery for partner fleets.';

  @override
  String get aboutSupportEmail => 'Support email';

  @override
  String get aboutLicenses => 'Open-source licenses';

  @override
  String get aboutMadeFor => 'Made for riders on the road.';

  @override
  String get aboutEmailError => 'Couldn\'t open the email app.';

  @override
  String get vehicleTitle => 'Vehicle & Documents';

  @override
  String get vehicleType => 'Motorcycle';

  @override
  String vehiclePlate(String plate) {
    return 'Plate $plate';
  }

  @override
  String get vehicleActive => 'Active';

  @override
  String get vehicleLicense => 'Driver\'s license';

  @override
  String get vehicleOrCr => 'OR / CR';

  @override
  String get vehicleVerified => 'Verified';

  @override
  String get vehicleLicenseDetail => 'Valid until Oct 2028';

  @override
  String vehicleOrCrDetail(String name) {
    return 'Registered to $name';
  }

  @override
  String get vehicleInfoTitle => 'Need to change a document?';

  @override
  String get vehicleInfoBody =>
      'Send the updated photo to your fleet coordinator. Changes are reviewed within one business day.';

  @override
  String get vehicleUpdate => 'Update documents';

  @override
  String get vehicleUploadUnavailable =>
      'Document upload is not available yet.';

  @override
  String get helpNoResultsBody =>
      'Try a shorter keyword or report the problem below.';

  @override
  String get helpCallError => 'Couldn\'t start the call.';

  @override
  String get helpReportTitle => 'Report a problem';

  @override
  String get helpReportSubtitle =>
      'Tell us what happened. Do not include passwords or OTPs.';

  @override
  String get helpReportCategory => 'Category';

  @override
  String get helpReportDescription => 'Description';

  @override
  String get helpReportDescriptionHint =>
      'Include the tracking number and what you expected to happen.';

  @override
  String get helpReportAddScreenshot => 'Add a screenshot (optional)';

  @override
  String get helpReportScreenshotAttached =>
      'Screenshot attached · tap to replace';

  @override
  String get helpReportSubmit => 'Submit report';

  @override
  String get helpReportSubmitted =>
      'Report submitted. The Bilis Desk will follow up.';

  @override
  String get helpCategoryJobIssue => 'Job issue';

  @override
  String get helpCategoryPayment => 'Payment or COD';

  @override
  String get helpCategoryAppBug => 'App bug';

  @override
  String get helpCategoryAccountAccess => 'Account access';

  @override
  String get helpCategorySafety => 'Safety concern';

  @override
  String get legalLastUpdated => 'Last updated: Oct 29, 2026';

  @override
  String get legalPrivacyBody =>
      'Privacy policy content will be provided by Mimoo before launch. This placeholder is not a legal document.';

  @override
  String get legalTermsBody =>
      'Terms of service content will be provided by Mimoo before launch. This placeholder is not a legal document.';

  @override
  String get routeMissingData =>
      'This screen is missing the data it needs. Go back and try again.';
}
