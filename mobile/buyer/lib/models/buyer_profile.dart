/// Buyer profile as returned by GET /api/buyer/profile and PUT /api/buyer/profile.
/// Separate from models/user.dart (which is used by auth_state.dart) to avoid
/// breaking that file.
class BuyerProfile {
  const BuyerProfile({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.middleInitial,
    required this.email,
    this.contactNumber,
    this.birthday,
    this.sex,
    this.region,
    this.province,
    this.district,
    this.municipalityCity,
    this.barangay,
    this.streetAddress,
    this.profilePhotoUrl,
  });

  final int id;
  final String firstName;
  final String lastName;
  final String? middleInitial;
  final String email;
  final String? contactNumber;
  final String? birthday;
  final String? sex;
  final String? region;
  final String? province;
  final String? district;
  final String? municipalityCity;
  final String? barangay;
  final String? streetAddress;
  final String? profilePhotoUrl;

  String get fullName => '$firstName $lastName'.trim();

  factory BuyerProfile.fromJson(Map<String, dynamic> j) => BuyerProfile(
        id: (j['id'] as num).toInt(),
        firstName: j['first_name'] as String? ?? '',
        lastName: j['last_name'] as String? ?? '',
        middleInitial: j['middle_initial'] as String?,
        email: j['email'] as String? ?? '',
        contactNumber: j['contact_number'] as String?,
        birthday: j['birthday'] as String?,
        sex: j['sex'] as String?,
        region: j['region'] as String?,
        province: j['province'] as String?,
        district: j['district'] as String?,
        municipalityCity: j['municipality_city'] as String?,
        barangay: j['barangay'] as String?,
        streetAddress: j['street_address'] as String?,
        profilePhotoUrl: j['profile_photo_url'] as String?,
      );

  Map<String, dynamic> toUpdateJson() {
    final m = <String, dynamic>{};
    if (firstName.isNotEmpty) m['first_name'] = firstName;
    if (lastName.isNotEmpty) m['last_name'] = lastName;
    if (middleInitial != null) m['middle_initial'] = middleInitial;
    // contact_number intentionally excluded — use change-phone flow
    if (birthday != null) m['birthday'] = birthday;
    if (sex != null) m['sex'] = sex;
    if (region != null) m['region'] = region;
    if (province != null) m['province'] = province;
    if (district != null) m['district'] = district;
    if (municipalityCity != null) m['municipality_city'] = municipalityCity;
    if (barangay != null) m['barangay'] = barangay;
    if (streetAddress != null) m['street_address'] = streetAddress;
    return m;
  }
}
