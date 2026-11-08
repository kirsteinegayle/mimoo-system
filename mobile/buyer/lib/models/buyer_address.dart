/// Saved address from GET /api/buyer/addresses.
class BuyerAddress {
  const BuyerAddress({
    required this.id,
    required this.label,
    required this.recipientName,
    required this.phone,
    required this.region,
    this.province,
    this.district,
    required this.municipalityCity,
    required this.barangay,
    required this.streetAddress,
    this.postalCode,
    required this.isDefault,
    required this.fullAddress,
  });

  final int id;
  final String label;
  final String recipientName;
  final String phone;
  final String region;
  final String? province;
  final String? district;
  final String municipalityCity;
  final String barangay;
  final String streetAddress;
  final String? postalCode;
  final bool isDefault;
  final String fullAddress;

  factory BuyerAddress.fromJson(Map<String, dynamic> j) => BuyerAddress(
        id: (j['id'] as num).toInt(),
        label: j['label'] as String? ?? '',
        recipientName: j['recipient_name'] as String? ?? '',
        phone: j['phone'] as String? ?? '',
        region: j['region'] as String? ?? '',
        province: j['province'] as String?,
        district: j['district'] as String?,
        municipalityCity: j['municipality_city'] as String? ?? '',
        barangay: j['barangay'] as String? ?? '',
        streetAddress: j['street_address'] as String? ?? '',
        postalCode: j['postal_code'] as String?,
        isDefault: j['is_default'] == true,
        fullAddress: j['full_address'] as String? ?? '',
      );
}
