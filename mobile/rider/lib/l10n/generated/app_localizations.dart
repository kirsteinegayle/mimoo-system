import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_fil.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'generated/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('fil')
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Mimoo Rider'**
  String get appTitle;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navJobs.
  ///
  /// In en, this message translates to:
  /// **'Jobs'**
  String get navJobs;

  /// No description provided for @navScan.
  ///
  /// In en, this message translates to:
  /// **'Scan'**
  String get navScan;

  /// No description provided for @navEarnings.
  ///
  /// In en, this message translates to:
  /// **'Earnings'**
  String get navEarnings;

  /// No description provided for @navHistory.
  ///
  /// In en, this message translates to:
  /// **'History'**
  String get navHistory;

  /// No description provided for @drawerVehicleDocuments.
  ///
  /// In en, this message translates to:
  /// **'Vehicle & Documents'**
  String get drawerVehicleDocuments;

  /// No description provided for @drawerCodRemittance.
  ///
  /// In en, this message translates to:
  /// **'COD Remittance'**
  String get drawerCodRemittance;

  /// No description provided for @drawerMessages.
  ///
  /// In en, this message translates to:
  /// **'Messages'**
  String get drawerMessages;

  /// No description provided for @drawerNotifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get drawerNotifications;

  /// No description provided for @drawerSettings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get drawerSettings;

  /// No description provided for @drawerHelpCenter.
  ///
  /// In en, this message translates to:
  /// **'Help Center'**
  String get drawerHelpCenter;

  /// No description provided for @drawerActive.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get drawerActive;

  /// No description provided for @drawerVersion.
  ///
  /// In en, this message translates to:
  /// **'Mimoo Rider v{version}'**
  String drawerVersion(String version);

  /// No description provided for @profileTitle.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profileTitle;

  /// No description provided for @profileChangePhoto.
  ///
  /// In en, this message translates to:
  /// **'Change photo'**
  String get profileChangePhoto;

  /// No description provided for @profileTakePhoto.
  ///
  /// In en, this message translates to:
  /// **'Take a photo'**
  String get profileTakePhoto;

  /// No description provided for @podPhotoSizeError.
  ///
  /// In en, this message translates to:
  /// **'Photo must be JPG or PNG and no larger than 5 MB.'**
  String get podPhotoSizeError;

  /// No description provided for @profileChooseGallery.
  ///
  /// In en, this message translates to:
  /// **'Choose from gallery'**
  String get profileChooseGallery;

  /// No description provided for @profileVerifiedIdentity.
  ///
  /// In en, this message translates to:
  /// **'Verified identity'**
  String get profileVerifiedIdentity;

  /// No description provided for @profileFullLegalName.
  ///
  /// In en, this message translates to:
  /// **'Full legal name'**
  String get profileFullLegalName;

  /// No description provided for @profileDateOfBirth.
  ///
  /// In en, this message translates to:
  /// **'Date of birth'**
  String get profileDateOfBirth;

  /// No description provided for @profileLicenseNumber.
  ///
  /// In en, this message translates to:
  /// **'License number'**
  String get profileLicenseNumber;

  /// No description provided for @profileContactLogistics.
  ///
  /// In en, this message translates to:
  /// **'Contact Logistics to change these details.'**
  String get profileContactLogistics;

  /// No description provided for @profileContactNumber.
  ///
  /// In en, this message translates to:
  /// **'Contact number'**
  String get profileContactNumber;

  /// No description provided for @profileResidentialAddress.
  ///
  /// In en, this message translates to:
  /// **'Residential address'**
  String get profileResidentialAddress;

  /// No description provided for @profileSaveChanges.
  ///
  /// In en, this message translates to:
  /// **'Save changes'**
  String get profileSaveChanges;

  /// No description provided for @profileDiscardTitle.
  ///
  /// In en, this message translates to:
  /// **'Discard changes?'**
  String get profileDiscardTitle;

  /// No description provided for @profileDiscardBody.
  ///
  /// In en, this message translates to:
  /// **'Your edits to the contact number or address will be lost.'**
  String get profileDiscardBody;

  /// No description provided for @profileKeepEditing.
  ///
  /// In en, this message translates to:
  /// **'Keep editing'**
  String get profileKeepEditing;

  /// No description provided for @profileDiscard.
  ///
  /// In en, this message translates to:
  /// **'Discard'**
  String get profileDiscard;

  /// No description provided for @profileUpdated.
  ///
  /// In en, this message translates to:
  /// **'Profile updated.'**
  String get profileUpdated;

  /// No description provided for @settingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settingsTitle;

  /// No description provided for @settingsAccountManagement.
  ///
  /// In en, this message translates to:
  /// **'Account management'**
  String get settingsAccountManagement;

  /// No description provided for @settingsChangePassword.
  ///
  /// In en, this message translates to:
  /// **'Change password'**
  String get settingsChangePassword;

  /// No description provided for @settingsEmergencyContact.
  ///
  /// In en, this message translates to:
  /// **'Emergency contact'**
  String get settingsEmergencyContact;

  /// No description provided for @settingsBiometric.
  ///
  /// In en, this message translates to:
  /// **'Biometric unlock on app open'**
  String get settingsBiometric;

  /// No description provided for @settingsPreferences.
  ///
  /// In en, this message translates to:
  /// **'Preferences'**
  String get settingsPreferences;

  /// No description provided for @settingsLanguage.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get settingsLanguage;

  /// No description provided for @settingsAppearance.
  ///
  /// In en, this message translates to:
  /// **'Appearance'**
  String get settingsAppearance;

  /// No description provided for @settingsNotifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get settingsNotifications;

  /// No description provided for @settingsDefaultNav.
  ///
  /// In en, this message translates to:
  /// **'Default navigation app'**
  String get settingsDefaultNav;

  /// No description provided for @settingsLocationPermissions.
  ///
  /// In en, this message translates to:
  /// **'Location & permissions'**
  String get settingsLocationPermissions;

  /// No description provided for @settingsAbout.
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get settingsAbout;

  /// No description provided for @settingsPrivacy.
  ///
  /// In en, this message translates to:
  /// **'Privacy policy'**
  String get settingsPrivacy;

  /// No description provided for @settingsTerms.
  ///
  /// In en, this message translates to:
  /// **'Terms of service'**
  String get settingsTerms;

  /// No description provided for @settingsAboutMimoo.
  ///
  /// In en, this message translates to:
  /// **'About Mimoo'**
  String get settingsAboutMimoo;

  /// No description provided for @settingsLogout.
  ///
  /// In en, this message translates to:
  /// **'Log out'**
  String get settingsLogout;

  /// No description provided for @languageSystem.
  ///
  /// In en, this message translates to:
  /// **'System default'**
  String get languageSystem;

  /// No description provided for @languageEnglish.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get languageEnglish;

  /// No description provided for @languageFilipino.
  ///
  /// In en, this message translates to:
  /// **'Filipino'**
  String get languageFilipino;

  /// No description provided for @appearanceSystem.
  ///
  /// In en, this message translates to:
  /// **'System'**
  String get appearanceSystem;

  /// No description provided for @appearanceLight.
  ///
  /// In en, this message translates to:
  /// **'Light'**
  String get appearanceLight;

  /// No description provided for @appearanceDark.
  ///
  /// In en, this message translates to:
  /// **'Dark'**
  String get appearanceDark;

  /// No description provided for @settingsAppearanceAfterSignIn.
  ///
  /// In en, this message translates to:
  /// **'Applies after you sign in.'**
  String get settingsAppearanceAfterSignIn;

  /// No description provided for @riderStatusOnline.
  ///
  /// In en, this message translates to:
  /// **'You\'re online'**
  String get riderStatusOnline;

  /// No description provided for @riderStatusOffline.
  ///
  /// In en, this message translates to:
  /// **'You\'re offline'**
  String get riderStatusOffline;

  /// No description provided for @riderStatusSuspended.
  ///
  /// In en, this message translates to:
  /// **'Your account is suspended. Contact your dispatcher to go online.'**
  String get riderStatusSuspended;

  /// No description provided for @riderStatusTooltipOnline.
  ///
  /// In en, this message translates to:
  /// **'Online. Tap to go offline.'**
  String get riderStatusTooltipOnline;

  /// No description provided for @riderStatusTooltipOffline.
  ///
  /// In en, this message translates to:
  /// **'Offline. Tap to go online.'**
  String get riderStatusTooltipOffline;

  /// No description provided for @riderStatusHeldTitle.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{You have 1 parcel out for delivery} other{You have {count} parcels out for delivery}}'**
  String riderStatusHeldTitle(int count);

  /// No description provided for @riderStatusHeldBody.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{You can go offline, but you must still deliver it to the buyer. No new jobs will be offered while offline.} other{You can go offline, but you must still deliver them to the buyer. No new jobs will be offered while offline.}}'**
  String riderStatusHeldBody(int count);

  /// No description provided for @outboxWaitingToSync.
  ///
  /// In en, this message translates to:
  /// **'Waiting to sync ({count})'**
  String outboxWaitingToSync(int count);

  /// No description provided for @databaseUnsupportedPlatform.
  ///
  /// In en, this message translates to:
  /// **'Local database storage is available on Android and iOS. Please open this app on a supported device.'**
  String get databaseUnsupportedPlatform;

  /// No description provided for @databaseResetTitle.
  ///
  /// In en, this message translates to:
  /// **'Reset local data?'**
  String get databaseResetTitle;

  /// No description provided for @databaseResetBody.
  ///
  /// In en, this message translates to:
  /// **'This will replace local demo data with the original seed. Queued changes will be removed.'**
  String get databaseResetBody;

  /// No description provided for @databaseResetAction.
  ///
  /// In en, this message translates to:
  /// **'Reset local data'**
  String get databaseResetAction;

  /// No description provided for @databaseResetCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get databaseResetCancel;

  /// No description provided for @databaseResetDone.
  ///
  /// In en, this message translates to:
  /// **'Local data has been reset.'**
  String get databaseResetDone;

  /// No description provided for @locationOffBanner.
  ///
  /// In en, this message translates to:
  /// **'Location is off. Tap to fix.'**
  String get locationOffBanner;

  /// No description provided for @locationOffFix.
  ///
  /// In en, this message translates to:
  /// **'Fix'**
  String get locationOffFix;

  /// No description provided for @riderStatusStayOnline.
  ///
  /// In en, this message translates to:
  /// **'Stay online'**
  String get riderStatusStayOnline;

  /// No description provided for @riderStatusGoOffline.
  ///
  /// In en, this message translates to:
  /// **'Go offline'**
  String get riderStatusGoOffline;

  /// No description provided for @notificationJobOffers.
  ///
  /// In en, this message translates to:
  /// **'Job offer alerts'**
  String get notificationJobOffers;

  /// No description provided for @notificationJobOfferSound.
  ///
  /// In en, this message translates to:
  /// **'Job offer sound'**
  String get notificationJobOfferSound;

  /// No description provided for @notificationMessages.
  ///
  /// In en, this message translates to:
  /// **'Messages'**
  String get notificationMessages;

  /// No description provided for @notificationRemittance.
  ///
  /// In en, this message translates to:
  /// **'Remittance reminders'**
  String get notificationRemittance;

  /// No description provided for @notificationAnnouncements.
  ///
  /// In en, this message translates to:
  /// **'System announcements'**
  String get notificationAnnouncements;

  /// No description provided for @navAskEveryTime.
  ///
  /// In en, this message translates to:
  /// **'Ask every time'**
  String get navAskEveryTime;

  /// No description provided for @navGoogleMaps.
  ///
  /// In en, this message translates to:
  /// **'Google Maps'**
  String get navGoogleMaps;

  /// No description provided for @navWaze.
  ///
  /// In en, this message translates to:
  /// **'Waze'**
  String get navWaze;

  /// No description provided for @helpTitle.
  ///
  /// In en, this message translates to:
  /// **'Help Center'**
  String get helpTitle;

  /// No description provided for @helpHeading.
  ///
  /// In en, this message translates to:
  /// **'How can we help?'**
  String get helpHeading;

  /// No description provided for @helpSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Search common rider questions or contact the Bilis Desk.'**
  String get helpSubtitle;

  /// No description provided for @helpSearchHint.
  ///
  /// In en, this message translates to:
  /// **'Search help topics'**
  String get helpSearchHint;

  /// No description provided for @helpCallDesk.
  ///
  /// In en, this message translates to:
  /// **'Call Bilis Desk'**
  String get helpCallDesk;

  /// No description provided for @helpReportProblem.
  ///
  /// In en, this message translates to:
  /// **'Report a problem'**
  String get helpReportProblem;

  /// No description provided for @helpNoResults.
  ///
  /// In en, this message translates to:
  /// **'No help topics match \"{query}\"'**
  String helpNoResults(String query);

  /// No description provided for @helpCategoryGettingStarted.
  ///
  /// In en, this message translates to:
  /// **'Getting started'**
  String get helpCategoryGettingStarted;

  /// No description provided for @helpCategoryJobs.
  ///
  /// In en, this message translates to:
  /// **'Jobs & pickups'**
  String get helpCategoryJobs;

  /// No description provided for @helpCategoryDelivery.
  ///
  /// In en, this message translates to:
  /// **'Delivery & proof of delivery'**
  String get helpCategoryDelivery;

  /// No description provided for @helpCategoryCod.
  ///
  /// In en, this message translates to:
  /// **'COD & remittance'**
  String get helpCategoryCod;

  /// No description provided for @helpCategoryEarnings.
  ///
  /// In en, this message translates to:
  /// **'Earnings'**
  String get helpCategoryEarnings;

  /// No description provided for @helpCategoryAccount.
  ///
  /// In en, this message translates to:
  /// **'Account & safety'**
  String get helpCategoryAccount;

  /// No description provided for @settingsEmergencyNone.
  ///
  /// In en, this message translates to:
  /// **'No emergency contact yet'**
  String get settingsEmergencyNone;

  /// No description provided for @settingsBiometricSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Require biometrics when reopening Mimoo Rider'**
  String get settingsBiometricSubtitle;

  /// No description provided for @settingsLogoutWarning.
  ///
  /// In en, this message translates to:
  /// **'If you have a picked-up parcel you must still deliver it.'**
  String get settingsLogoutWarning;

  /// No description provided for @biometricLockTitle.
  ///
  /// In en, this message translates to:
  /// **'Mimoo Rider is locked'**
  String get biometricLockTitle;

  /// No description provided for @biometricLockBody.
  ///
  /// In en, this message translates to:
  /// **'Unlock with your device biometrics to continue.'**
  String get biometricLockBody;

  /// No description provided for @biometricUnlock.
  ///
  /// In en, this message translates to:
  /// **'Unlock'**
  String get biometricUnlock;

  /// No description provided for @biometricUsePasscode.
  ///
  /// In en, this message translates to:
  /// **'Use device passcode'**
  String get biometricUsePasscode;

  /// No description provided for @biometricLockReason.
  ///
  /// In en, this message translates to:
  /// **'Unlock Mimoo Rider'**
  String get biometricLockReason;

  /// No description provided for @biometricUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Biometric unlock isn\'t available. Try your device passcode.'**
  String get biometricUnavailable;

  /// No description provided for @commonCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get commonCancel;

  /// No description provided for @commonSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get commonSave;

  /// No description provided for @commonRemove.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get commonRemove;

  /// No description provided for @commonEdit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get commonEdit;

  /// No description provided for @commonDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get commonDelete;

  /// No description provided for @settingsLogoutTitle.
  ///
  /// In en, this message translates to:
  /// **'Log out of Mimoo Rider?'**
  String get settingsLogoutTitle;

  /// No description provided for @changePasswordCurrent.
  ///
  /// In en, this message translates to:
  /// **'Current password'**
  String get changePasswordCurrent;

  /// No description provided for @changePasswordNew.
  ///
  /// In en, this message translates to:
  /// **'New password'**
  String get changePasswordNew;

  /// No description provided for @changePasswordConfirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm password'**
  String get changePasswordConfirm;

  /// No description provided for @changePasswordRuleLength.
  ///
  /// In en, this message translates to:
  /// **'At least 8 characters'**
  String get changePasswordRuleLength;

  /// No description provided for @changePasswordRuleUpper.
  ///
  /// In en, this message translates to:
  /// **'Includes an uppercase letter'**
  String get changePasswordRuleUpper;

  /// No description provided for @changePasswordRuleNumber.
  ///
  /// In en, this message translates to:
  /// **'Includes a number or special character'**
  String get changePasswordRuleNumber;

  /// No description provided for @changePasswordRuleMatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords match'**
  String get changePasswordRuleMatch;

  /// No description provided for @changePasswordSubmit.
  ///
  /// In en, this message translates to:
  /// **'Update password'**
  String get changePasswordSubmit;

  /// No description provided for @changePasswordUpdated.
  ///
  /// In en, this message translates to:
  /// **'Password updated.'**
  String get changePasswordUpdated;

  /// No description provided for @changePasswordCurrentIncorrect.
  ///
  /// In en, this message translates to:
  /// **'Current password is incorrect.'**
  String get changePasswordCurrentIncorrect;

  /// No description provided for @showPassword.
  ///
  /// In en, this message translates to:
  /// **'Show password'**
  String get showPassword;

  /// No description provided for @hidePassword.
  ///
  /// In en, this message translates to:
  /// **'Hide password'**
  String get hidePassword;

  /// No description provided for @emergencyAddTitle.
  ///
  /// In en, this message translates to:
  /// **'Add emergency contact'**
  String get emergencyAddTitle;

  /// No description provided for @emergencyEditTitle.
  ///
  /// In en, this message translates to:
  /// **'Edit emergency contact'**
  String get emergencyEditTitle;

  /// No description provided for @emergencyFullName.
  ///
  /// In en, this message translates to:
  /// **'Full name'**
  String get emergencyFullName;

  /// No description provided for @emergencyRelationship.
  ///
  /// In en, this message translates to:
  /// **'Relationship'**
  String get emergencyRelationship;

  /// No description provided for @emergencyRelationshipHint.
  ///
  /// In en, this message translates to:
  /// **'e.g. Spouse, Parent'**
  String get emergencyRelationshipHint;

  /// No description provided for @emergencyPhone.
  ///
  /// In en, this message translates to:
  /// **'Phone number'**
  String get emergencyPhone;

  /// No description provided for @emergencyRemoveTitle.
  ///
  /// In en, this message translates to:
  /// **'Remove contact?'**
  String get emergencyRemoveTitle;

  /// No description provided for @emergencyRemoveBody.
  ///
  /// In en, this message translates to:
  /// **'{name} will no longer be listed as an emergency contact.'**
  String emergencyRemoveBody(String name);

  /// No description provided for @emergencyInfoTitle.
  ///
  /// In en, this message translates to:
  /// **'Up to 2 emergency contacts'**
  String get emergencyInfoTitle;

  /// No description provided for @emergencyInfoBody.
  ///
  /// In en, this message translates to:
  /// **'The Bilis Desk may contact them if you are unreachable during a shift.'**
  String get emergencyInfoBody;

  /// No description provided for @emergencyEmptyBody.
  ///
  /// In en, this message translates to:
  /// **'Add someone the hub can call in an emergency.'**
  String get emergencyEmptyBody;

  /// No description provided for @emergencyAddAction.
  ///
  /// In en, this message translates to:
  /// **'Add contact'**
  String get emergencyAddAction;

  /// No description provided for @emergencyMaxNote.
  ///
  /// In en, this message translates to:
  /// **'You can keep at most 2 emergency contacts.'**
  String get emergencyMaxNote;

  /// No description provided for @emergencyEditTooltip.
  ///
  /// In en, this message translates to:
  /// **'Edit contact'**
  String get emergencyEditTooltip;

  /// No description provided for @emergencyDeleteTooltip.
  ///
  /// In en, this message translates to:
  /// **'Delete contact'**
  String get emergencyDeleteTooltip;

  /// No description provided for @permissionsTitle.
  ///
  /// In en, this message translates to:
  /// **'Location & permissions'**
  String get permissionsTitle;

  /// No description provided for @permissionsChecking.
  ///
  /// In en, this message translates to:
  /// **'Checking…'**
  String get permissionsChecking;

  /// No description provided for @permissionsAllowed.
  ///
  /// In en, this message translates to:
  /// **'Allowed'**
  String get permissionsAllowed;

  /// No description provided for @permissionsBlocked.
  ///
  /// In en, this message translates to:
  /// **'Blocked'**
  String get permissionsBlocked;

  /// No description provided for @permissionsNotAllowed.
  ///
  /// In en, this message translates to:
  /// **'Not allowed'**
  String get permissionsNotAllowed;

  /// No description provided for @permissionsUnknown.
  ///
  /// In en, this message translates to:
  /// **'Unknown'**
  String get permissionsUnknown;

  /// No description provided for @permissionsLocation.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get permissionsLocation;

  /// No description provided for @permissionsCamera.
  ///
  /// In en, this message translates to:
  /// **'Camera'**
  String get permissionsCamera;

  /// No description provided for @permissionsNotifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get permissionsNotifications;

  /// No description provided for @permissionsInfoTitle.
  ///
  /// In en, this message translates to:
  /// **'Manage access in system settings'**
  String get permissionsInfoTitle;

  /// No description provided for @permissionsInfoBody.
  ///
  /// In en, this message translates to:
  /// **'Location is required to go online. Camera is required for proof of delivery. Notifications keep you updated on offers.'**
  String get permissionsInfoBody;

  /// No description provided for @permissionsOpenSettings.
  ///
  /// In en, this message translates to:
  /// **'Open app settings'**
  String get permissionsOpenSettings;

  /// No description provided for @aboutTagline.
  ///
  /// In en, this message translates to:
  /// **'Delivery jobs, COD remittance and proof of delivery for partner fleets.'**
  String get aboutTagline;

  /// No description provided for @aboutSupportEmail.
  ///
  /// In en, this message translates to:
  /// **'Support email'**
  String get aboutSupportEmail;

  /// No description provided for @aboutLicenses.
  ///
  /// In en, this message translates to:
  /// **'Open-source licenses'**
  String get aboutLicenses;

  /// No description provided for @aboutMadeFor.
  ///
  /// In en, this message translates to:
  /// **'Made for riders on the road.'**
  String get aboutMadeFor;

  /// No description provided for @aboutEmailError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t open the email app.'**
  String get aboutEmailError;

  /// No description provided for @vehicleTitle.
  ///
  /// In en, this message translates to:
  /// **'Vehicle & Documents'**
  String get vehicleTitle;

  /// No description provided for @vehicleType.
  ///
  /// In en, this message translates to:
  /// **'Motorcycle'**
  String get vehicleType;

  /// No description provided for @vehiclePlate.
  ///
  /// In en, this message translates to:
  /// **'Plate {plate}'**
  String vehiclePlate(String plate);

  /// No description provided for @vehicleActive.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get vehicleActive;

  /// No description provided for @vehicleLicense.
  ///
  /// In en, this message translates to:
  /// **'Driver\'s license'**
  String get vehicleLicense;

  /// No description provided for @vehicleOrCr.
  ///
  /// In en, this message translates to:
  /// **'OR / CR'**
  String get vehicleOrCr;

  /// No description provided for @vehicleVerified.
  ///
  /// In en, this message translates to:
  /// **'Verified'**
  String get vehicleVerified;

  /// No description provided for @vehicleLicenseDetail.
  ///
  /// In en, this message translates to:
  /// **'Valid until Oct 2028'**
  String get vehicleLicenseDetail;

  /// No description provided for @vehicleOrCrDetail.
  ///
  /// In en, this message translates to:
  /// **'Registered to {name}'**
  String vehicleOrCrDetail(String name);

  /// No description provided for @vehicleInfoTitle.
  ///
  /// In en, this message translates to:
  /// **'Need to change a document?'**
  String get vehicleInfoTitle;

  /// No description provided for @vehicleInfoBody.
  ///
  /// In en, this message translates to:
  /// **'Send the updated photo to your fleet coordinator. Changes are reviewed within one business day.'**
  String get vehicleInfoBody;

  /// No description provided for @vehicleUpdate.
  ///
  /// In en, this message translates to:
  /// **'Update documents'**
  String get vehicleUpdate;

  /// No description provided for @vehicleUploadUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Document upload is not available yet.'**
  String get vehicleUploadUnavailable;

  /// No description provided for @helpNoResultsBody.
  ///
  /// In en, this message translates to:
  /// **'Try a shorter keyword or report the problem below.'**
  String get helpNoResultsBody;

  /// No description provided for @helpCallError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t start the call.'**
  String get helpCallError;

  /// No description provided for @helpReportTitle.
  ///
  /// In en, this message translates to:
  /// **'Report a problem'**
  String get helpReportTitle;

  /// No description provided for @helpReportSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Tell us what happened. Do not include passwords or OTPs.'**
  String get helpReportSubtitle;

  /// No description provided for @helpReportCategory.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get helpReportCategory;

  /// No description provided for @helpReportDescription.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get helpReportDescription;

  /// No description provided for @helpReportDescriptionHint.
  ///
  /// In en, this message translates to:
  /// **'Include the tracking number and what you expected to happen.'**
  String get helpReportDescriptionHint;

  /// No description provided for @helpReportAddScreenshot.
  ///
  /// In en, this message translates to:
  /// **'Add a screenshot (optional)'**
  String get helpReportAddScreenshot;

  /// No description provided for @helpReportScreenshotAttached.
  ///
  /// In en, this message translates to:
  /// **'Screenshot attached · tap to replace'**
  String get helpReportScreenshotAttached;

  /// No description provided for @helpReportSubmit.
  ///
  /// In en, this message translates to:
  /// **'Submit report'**
  String get helpReportSubmit;

  /// No description provided for @helpReportSubmitted.
  ///
  /// In en, this message translates to:
  /// **'Report submitted. The Bilis Desk will follow up.'**
  String get helpReportSubmitted;

  /// No description provided for @helpCategoryJobIssue.
  ///
  /// In en, this message translates to:
  /// **'Job issue'**
  String get helpCategoryJobIssue;

  /// No description provided for @helpCategoryPayment.
  ///
  /// In en, this message translates to:
  /// **'Payment or COD'**
  String get helpCategoryPayment;

  /// No description provided for @helpCategoryAppBug.
  ///
  /// In en, this message translates to:
  /// **'App bug'**
  String get helpCategoryAppBug;

  /// No description provided for @helpCategoryAccountAccess.
  ///
  /// In en, this message translates to:
  /// **'Account access'**
  String get helpCategoryAccountAccess;

  /// No description provided for @helpCategorySafety.
  ///
  /// In en, this message translates to:
  /// **'Safety concern'**
  String get helpCategorySafety;

  /// No description provided for @legalLastUpdated.
  ///
  /// In en, this message translates to:
  /// **'Last updated: Oct 29, 2026'**
  String get legalLastUpdated;

  /// No description provided for @legalPrivacyBody.
  ///
  /// In en, this message translates to:
  /// **'Privacy policy content will be provided by Mimoo before launch. This placeholder is not a legal document.'**
  String get legalPrivacyBody;

  /// No description provided for @legalTermsBody.
  ///
  /// In en, this message translates to:
  /// **'Terms of service content will be provided by Mimoo before launch. This placeholder is not a legal document.'**
  String get legalTermsBody;

  /// No description provided for @routeMissingData.
  ///
  /// In en, this message translates to:
  /// **'This screen is missing the data it needs. Go back and try again.'**
  String get routeMissingData;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'fil'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'fil':
      return AppLocalizationsFil();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
