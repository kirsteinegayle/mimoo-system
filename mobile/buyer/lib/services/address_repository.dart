import '../models/buyer_address.dart';
import 'api_service.dart';

/// Address book API. All methods throw [ApiException] on non-2xx.
class AddressRepository {
  AddressRepository._();
  static final AddressRepository instance = AddressRepository._();

  static const int maxAddresses = 10;

  List<BuyerAddress> _parseList(dynamic data) => (data as List<dynamic>? ?? [])
      .map((e) => BuyerAddress.fromJson(e as Map<String, dynamic>))
      .toList();

  Future<List<BuyerAddress>> fetchAll() async {
    final res = await ApiService.get('/buyer/addresses') as Map<String, dynamic>;
    return _parseList(res['data']);
  }

  Future<BuyerAddress> create(Map<String, dynamic> body) async {
    final res = await ApiService.post('/buyer/addresses', body: body)
        as Map<String, dynamic>;
    return BuyerAddress.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<BuyerAddress> update(int id, Map<String, dynamic> body) async {
    final res = await ApiService.put('/buyer/addresses/$id', body: body)
        as Map<String, dynamic>;
    return BuyerAddress.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> delete(int id) async {
    await ApiService.delete('/buyer/addresses/$id');
  }

  Future<List<BuyerAddress>> setDefault(int id) async {
    final res = await ApiService.post('/buyer/addresses/$id/default')
        as Map<String, dynamic>;
    return _parseList(res['data']);
  }
}
