// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Filipino Pilipino (`fil`).
class AppLocalizationsFil extends AppLocalizations {
  AppLocalizationsFil([String locale = 'fil']) : super(locale);

  @override
  String get appTitle => 'Mimoo Rider';

  @override
  String get navHome => 'Home';

  @override
  String get navJobs => 'Mga Trabaho';

  @override
  String get navScan => 'I-scan';

  @override
  String get navEarnings => 'Kita';

  @override
  String get navHistory => 'Kasaysayan';

  @override
  String get drawerVehicleDocuments => 'Sasakyan at Dokumento';

  @override
  String get drawerCodRemittance => 'Pag-remit ng COD';

  @override
  String get drawerMessages => 'Mga Mensahe';

  @override
  String get drawerNotifications => 'Mga Abiso';

  @override
  String get drawerSettings => 'Mga Setting';

  @override
  String get drawerHelpCenter => 'Sentro ng Tulong';

  @override
  String get drawerActive => 'Aktibo';

  @override
  String drawerVersion(String version) {
    return 'Mimoo Rider v$version';
  }

  @override
  String get profileTitle => 'Profile';

  @override
  String get profileChangePhoto => 'Palitan ang larawan';

  @override
  String get profileTakePhoto => 'Kumuha ng larawan';

  @override
  String get podPhotoSizeError =>
      'Dapat JPG o PNG ang larawan at hindi hihigit sa 5 MB.';

  @override
  String get profileChooseGallery => 'Pumili mula sa gallery';

  @override
  String get profileVerifiedIdentity => 'Beripikadong pagkakakilanlan';

  @override
  String get profileFullLegalName => 'Buong legal na pangalan';

  @override
  String get profileDateOfBirth => 'Petsa ng kapanganakan';

  @override
  String get profileLicenseNumber => 'Numero ng lisensya';

  @override
  String get profileContactLogistics =>
      'Makipag-ugnayan sa Logistics para baguhin ang mga detalyeng ito.';

  @override
  String get profileContactNumber => 'Numero ng telepono';

  @override
  String get profileResidentialAddress => 'Tirahan';

  @override
  String get profileSaveChanges => 'I-save ang mga pagbabago';

  @override
  String get profileDiscardTitle => 'Itapon ang mga pagbabago?';

  @override
  String get profileDiscardBody =>
      'Mawawala ang mga pagbabago sa numero ng telepono o tirahan.';

  @override
  String get profileKeepEditing => 'Magpatuloy sa pag-edit';

  @override
  String get profileDiscard => 'Itapon';

  @override
  String get profileUpdated => 'Na-update ang profile.';

  @override
  String get settingsTitle => 'Mga Setting';

  @override
  String get settingsAccountManagement => 'Pamamahala ng account';

  @override
  String get settingsChangePassword => 'Palitan ang password';

  @override
  String get settingsEmergencyContact => 'Emergency contact';

  @override
  String get settingsBiometric => 'Biometric unlock sa pagbukas ng app';

  @override
  String get settingsPreferences => 'Mga kagustuhan';

  @override
  String get settingsLanguage => 'Wika';

  @override
  String get settingsAppearance => 'Itsura';

  @override
  String get settingsNotifications => 'Mga abiso';

  @override
  String get settingsDefaultNav => 'Default na navigation app';

  @override
  String get settingsLocationPermissions => 'Lokasyon at mga pahintulot';

  @override
  String get settingsAbout => 'Tungkol';

  @override
  String get settingsPrivacy => 'Patakaran sa privacy';

  @override
  String get settingsTerms => 'Mga tuntunin ng serbisyo';

  @override
  String get settingsAboutMimoo => 'Tungkol sa Mimoo';

  @override
  String get settingsLogout => 'Mag-log out';

  @override
  String get languageSystem => 'Default ng system';

  @override
  String get languageEnglish => 'English';

  @override
  String get languageFilipino => 'Filipino';

  @override
  String get appearanceSystem => 'System';

  @override
  String get appearanceLight => 'Maliwanag';

  @override
  String get appearanceDark => 'Madilim';

  @override
  String get settingsAppearanceAfterSignIn =>
      'Mag-aapply pagkatapos mong mag-sign in.';

  @override
  String get riderStatusOnline => 'Online ka na';

  @override
  String get riderStatusOffline => 'Offline ka na';

  @override
  String get riderStatusSuspended =>
      'Naka-suspend ang account mo. Makipag-ugnayan sa dispatcher para makapag-online.';

  @override
  String get riderStatusTooltipOnline => 'Online. I-tap para mag-offline.';

  @override
  String get riderStatusTooltipOffline => 'Offline. I-tap para mag-online.';

  @override
  String riderStatusHeldTitle(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'May $count kang parcel na out for delivery',
      one: 'May 1 kang parcel na out for delivery',
    );
    return '$_temp0';
  }

  @override
  String riderStatusHeldBody(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other:
          'Pwede kang mag-offline, pero kailangan mo pa ring i-deliver ang mga ito sa buyer. Wala kang matatanggap na bagong job habang offline.',
      one:
          'Pwede kang mag-offline, pero kailangan mo pa ring i-deliver ito sa buyer. Wala kang matatanggap na bagong job habang offline.',
    );
    return '$_temp0';
  }

  @override
  String outboxWaitingToSync(int count) {
    return 'Naghihintay mag-sync ($count)';
  }

  @override
  String get databaseUnsupportedPlatform =>
      'Available ang lokal na database sa Android at iOS. Buksan ang app na ito sa suportadong device.';

  @override
  String get databaseResetTitle => 'I-reset ang lokal na data?';

  @override
  String get databaseResetBody =>
      'Papalitan nito ang lokal na demo data ng orihinal na seed. Tatanggalin ang mga nakapilang pagbabago.';

  @override
  String get databaseResetAction => 'I-reset ang lokal na data';

  @override
  String get databaseResetCancel => 'Kanselahin';

  @override
  String get databaseResetDone => 'Na-reset na ang lokal na data.';

  @override
  String get locationOffBanner => 'Naka-off ang lokasyon. I-tap para ayusin.';

  @override
  String get locationOffFix => 'Ayusin';

  @override
  String get riderStatusStayOnline => 'Manatiling online';

  @override
  String get riderStatusGoOffline => 'Mag-offline';

  @override
  String get notificationJobOffers => 'Alerto sa job offer';

  @override
  String get notificationJobOfferSound => 'Tunog ng job offer';

  @override
  String get notificationMessages => 'Mga mensahe';

  @override
  String get notificationRemittance => 'Paalala sa remittance';

  @override
  String get notificationAnnouncements => 'Mga anunsyo ng system';

  @override
  String get navAskEveryTime => 'Itanong tuwing gagamitin';

  @override
  String get navGoogleMaps => 'Google Maps';

  @override
  String get navWaze => 'Waze';

  @override
  String get helpTitle => 'Sentro ng Tulong';

  @override
  String get helpHeading => 'Paano kami makakatulong?';

  @override
  String get helpSubtitle =>
      'Maghanap ng karaniwang tanong ng rider o kontakin ang Bilis Desk.';

  @override
  String get helpSearchHint => 'Maghanap ng paksa';

  @override
  String get helpCallDesk => 'Tumawag sa Bilis Desk';

  @override
  String get helpReportProblem => 'Mag-ulat ng problema';

  @override
  String helpNoResults(String query) {
    return 'Walang paksang tumutugma sa \"$query\"';
  }

  @override
  String get helpCategoryGettingStarted => 'Pagsisimula';

  @override
  String get helpCategoryJobs => 'Mga trabaho at pickup';

  @override
  String get helpCategoryDelivery => 'Delivery at proof of delivery';

  @override
  String get helpCategoryCod => 'COD at remittance';

  @override
  String get helpCategoryEarnings => 'Kita';

  @override
  String get helpCategoryAccount => 'Account at kaligtasan';

  @override
  String get settingsEmergencyNone => 'Wala pang emergency contact';

  @override
  String get settingsBiometricSubtitle =>
      'Kailanganin ang biometrics sa pagbukas muli ng Mimoo Rider';

  @override
  String get settingsLogoutWarning =>
      'Kung may na-pick up kang parcel, kailangan mo pa rin itong i-deliver.';

  @override
  String get biometricLockTitle => 'Naka-lock ang Mimoo Rider';

  @override
  String get biometricLockBody =>
      'I-unlock gamit ang biometrics ng device para magpatuloy.';

  @override
  String get biometricUnlock => 'I-unlock';

  @override
  String get biometricUsePasscode => 'Gamitin ang passcode ng device';

  @override
  String get biometricLockReason => 'I-unlock ang Mimoo Rider';

  @override
  String get biometricUnavailable =>
      'Hindi available ang biometric unlock. Subukan ang passcode ng device.';

  @override
  String get commonCancel => 'Kanselahin';

  @override
  String get commonSave => 'I-save';

  @override
  String get commonRemove => 'Alisin';

  @override
  String get commonEdit => 'I-edit';

  @override
  String get commonDelete => 'Tanggalin';

  @override
  String get settingsLogoutTitle => 'Mag-log out sa Mimoo Rider?';

  @override
  String get changePasswordCurrent => 'Kasalukuyang password';

  @override
  String get changePasswordNew => 'Bagong password';

  @override
  String get changePasswordConfirm => 'Kumpirmahin ang password';

  @override
  String get changePasswordRuleLength => 'Hindi bababa sa 8 character';

  @override
  String get changePasswordRuleUpper => 'May malaking titik';

  @override
  String get changePasswordRuleNumber => 'May numero o espesyal na character';

  @override
  String get changePasswordRuleMatch => 'Magkapareho ang password';

  @override
  String get changePasswordSubmit => 'I-update ang password';

  @override
  String get changePasswordUpdated => 'Na-update ang password.';

  @override
  String get changePasswordCurrentIncorrect =>
      'Mali ang kasalukuyang password.';

  @override
  String get showPassword => 'Ipakita ang password';

  @override
  String get hidePassword => 'Itago ang password';

  @override
  String get emergencyAddTitle => 'Magdagdag ng emergency contact';

  @override
  String get emergencyEditTitle => 'I-edit ang emergency contact';

  @override
  String get emergencyFullName => 'Buong pangalan';

  @override
  String get emergencyRelationship => 'Relasyon';

  @override
  String get emergencyRelationshipHint => 'hal. Asawa, Magulang';

  @override
  String get emergencyPhone => 'Numero ng telepono';

  @override
  String get emergencyRemoveTitle => 'Alisin ang contact?';

  @override
  String emergencyRemoveBody(String name) {
    return 'Hindi na nakalista si $name bilang emergency contact.';
  }

  @override
  String get emergencyInfoTitle => 'Hanggang 2 emergency contact';

  @override
  String get emergencyInfoBody =>
      'Maaaring kontakin sila ng Bilis Desk kung hindi ka maabot habang naka-shift.';

  @override
  String get emergencyEmptyBody =>
      'Magdagdag ng taong matatawagan ng hub sa emergency.';

  @override
  String get emergencyAddAction => 'Magdagdag ng contact';

  @override
  String get emergencyMaxNote =>
      'Hanggang 2 emergency contact lang ang maaari mong panatilihin.';

  @override
  String get emergencyEditTooltip => 'I-edit ang contact';

  @override
  String get emergencyDeleteTooltip => 'Tanggalin ang contact';

  @override
  String get permissionsTitle => 'Lokasyon at mga pahintulot';

  @override
  String get permissionsChecking => 'Sinusuri…';

  @override
  String get permissionsAllowed => 'Pinapayagan';

  @override
  String get permissionsBlocked => 'Naka-block';

  @override
  String get permissionsNotAllowed => 'Hindi pinapayagan';

  @override
  String get permissionsUnknown => 'Hindi alam';

  @override
  String get permissionsLocation => 'Lokasyon';

  @override
  String get permissionsCamera => 'Camera';

  @override
  String get permissionsNotifications => 'Mga notification';

  @override
  String get permissionsInfoTitle => 'Pamahalaan ang access sa system settings';

  @override
  String get permissionsInfoBody =>
      'Kailangan ang lokasyon para mag-online. Kailangan ang camera para sa proof of delivery. Ang mga notification ay nagpapaalam sa iyo tungkol sa mga offer.';

  @override
  String get permissionsOpenSettings => 'Buksan ang app settings';

  @override
  String get aboutTagline =>
      'Mga delivery job, COD remittance at proof of delivery para sa partner fleets.';

  @override
  String get aboutSupportEmail => 'Email ng support';

  @override
  String get aboutLicenses => 'Mga open-source license';

  @override
  String get aboutMadeFor => 'Para sa mga rider sa kalsada.';

  @override
  String get aboutEmailError => 'Hindi mabuksan ang email app.';

  @override
  String get vehicleTitle => 'Sasakyan at mga dokumento';

  @override
  String get vehicleType => 'Motorsiklo';

  @override
  String vehiclePlate(String plate) {
    return 'Plaka $plate';
  }

  @override
  String get vehicleActive => 'Aktibo';

  @override
  String get vehicleLicense => 'Lisensya sa pagmamaneho';

  @override
  String get vehicleOrCr => 'OR / CR';

  @override
  String get vehicleVerified => 'Beripikado';

  @override
  String get vehicleLicenseDetail => 'May bisa hanggang Okt 2028';

  @override
  String vehicleOrCrDetail(String name) {
    return 'Nakarehistro kay $name';
  }

  @override
  String get vehicleInfoTitle => 'Kailangan mong baguhin ang isang dokumento?';

  @override
  String get vehicleInfoBody =>
      'Ipadala ang updated na larawan sa iyong fleet coordinator. Susuriin ang mga pagbabago sa loob ng isang business day.';

  @override
  String get vehicleUpdate => 'I-update ang mga dokumento';

  @override
  String get vehicleUploadUnavailable =>
      'Hindi pa available ang pag-upload ng dokumento.';

  @override
  String get helpNoResultsBody =>
      'Subukan ang mas maikling keyword o i-report ang problema sa ibaba.';

  @override
  String get helpCallError => 'Hindi masimulan ang tawag.';

  @override
  String get helpReportTitle => 'I-report ang problema';

  @override
  String get helpReportSubtitle =>
      'Sabihin sa amin ang nangyari. Huwag isama ang mga password o OTP.';

  @override
  String get helpReportCategory => 'Kategorya';

  @override
  String get helpReportDescription => 'Paglalarawan';

  @override
  String get helpReportDescriptionHint =>
      'Isama ang tracking number at ang inaasahan mong mangyari.';

  @override
  String get helpReportAddScreenshot => 'Magdagdag ng screenshot (opsyonal)';

  @override
  String get helpReportScreenshotAttached =>
      'Nakalakip ang screenshot · i-tap para palitan';

  @override
  String get helpReportSubmit => 'Isumite ang report';

  @override
  String get helpReportSubmitted =>
      'Naisumite ang report. Susundan ito ng Bilis Desk.';

  @override
  String get helpCategoryJobIssue => 'Isyu sa trabaho';

  @override
  String get helpCategoryPayment => 'Bayad o COD';

  @override
  String get helpCategoryAppBug => 'Bug sa app';

  @override
  String get helpCategoryAccountAccess => 'Access sa account';

  @override
  String get helpCategorySafety => 'Panganib sa kaligtasan';

  @override
  String get legalLastUpdated => 'Huling na-update: Okt 29, 2026';

  @override
  String get legalPrivacyBody =>
      'Privacy policy content will be provided by Mimoo before launch. This placeholder is not a legal document.';

  @override
  String get legalTermsBody =>
      'Terms of service content will be provided by Mimoo before launch. This placeholder is not a legal document.';

  @override
  String get routeMissingData =>
      'Kulang ang data na kailangan ng screen na ito. Bumalik at subukang muli.';
}
