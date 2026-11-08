import 'api_service.dart';

/// Result of a follow / unfollow call.
class FollowState {
  const FollowState({required this.isFollowing, required this.followersCount});
  final bool isFollowing;
  final int followersCount;

  factory FollowState.fromJson(Map<String, dynamic> j) => FollowState(
        isFollowing: j['is_following'] == true,
        followersCount: (j['followers_count'] as num?)?.toInt() ?? 0,
      );
}

/// A followed store from GET /api/buyer/following.
class FollowedStore {
  const FollowedStore({
    required this.sellerId,
    required this.displayName,
    this.profilePhotoUrl,
    required this.followersCount,
  });

  final int sellerId;
  final String displayName;
  final String? profilePhotoUrl;
  final int followersCount;

  factory FollowedStore.fromJson(Map<String, dynamic> j) => FollowedStore(
        sellerId: (j['seller_id'] as num).toInt(),
        displayName: j['display_name'] as String? ?? '',
        profilePhotoUrl: j['profile_photo_url'] as String?,
        followersCount: (j['followers_count'] as num?)?.toInt() ?? 0,
      );
}

class FollowRepository {
  FollowRepository._();
  static final FollowRepository instance = FollowRepository._();

  Future<FollowState> follow(int sellerId) async => FollowState.fromJson(
      await ApiService.post('/buyer/sellers/$sellerId/follow')
          as Map<String, dynamic>);

  Future<FollowState> unfollow(int sellerId) async => FollowState.fromJson(
      await ApiService.delete('/buyer/sellers/$sellerId/follow')
          as Map<String, dynamic>);

  Future<List<FollowedStore>> following() async {
    final res = await ApiService.get('/buyer/following') as Map<String, dynamic>;
    return (res['data'] as List<dynamic>? ?? [])
        .map((e) => FollowedStore.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
