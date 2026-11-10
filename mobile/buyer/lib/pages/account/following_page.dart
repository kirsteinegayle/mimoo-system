import 'package:flutter/material.dart';

import '../../services/api_service.dart';
import '../../services/follow_repository.dart';
import '../seller/seller_store_page.dart';
import '../../theme/app_theme.dart';

const _kPrimary = AppColors.primary;
const _kBorder = AppColors.border;
const _kSubtext = AppColors.textMuted;

/// Stores the buyer follows (GET /api/buyer/following).
class FollowingPage extends StatefulWidget {
  const FollowingPage({super.key});

  @override
  State<FollowingPage> createState() => _FollowingPageState();
}

class _FollowingPageState extends State<FollowingPage> {
  List<FollowedStore> _items = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await FollowRepository.instance.following();
      if (!mounted) return;
      setState(() {
        _items = list;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not load. Check your connection.';
        _loading = false;
      });
    }
  }

  Future<void> _unfollow(FollowedStore s) async {
    try {
      await FollowRepository.instance.unfollow(s.sellerId);
      if (!mounted) return;
      setState(() => _items.removeWhere((x) => x.sellerId == s.sellerId));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Could not unfollow. Please try again.'),
        behavior: SnackBarBehavior.floating,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Following'),
        backgroundColor: Colors.white,
        foregroundColor: _kPrimary,
        elevation: 0.5,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Text(_error!),
                    const SizedBox(height: 8),
                    OutlinedButton(onPressed: _load, child: const Text('Retry')),
                  ]),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: _items.isEmpty
                      ? ListView(children: const [
                          SizedBox(height: 120),
                          Icon(Icons.storefront_outlined,
                              size: 56, color: _kSubtext),
                          SizedBox(height: 12),
                          Center(
                              child: Text("You're not following any stores yet.")),
                        ])
                      : ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _items.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (_, i) {
                            final s = _items[i];
                            return Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: _kBorder),
                              ),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: AppColors.chip,
                                  backgroundImage: s.profilePhotoUrl != null
                                      ? NetworkImage(s.profilePhotoUrl!)
                                      : null,
                                  child: s.profilePhotoUrl == null
                                      ? const Icon(Icons.storefront_outlined,
                                          color: _kPrimary)
                                      : null,
                                ),
                                title: Text(s.displayName,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w700)),
                                subtitle: Text(
                                    '${s.followersCount} follower${s.followersCount == 1 ? '' : 's'}'),
                                trailing: OutlinedButton(
                                  onPressed: () => _unfollow(s),
                                  child: const Text('Unfollow'),
                                ),
                                onTap: () async {
                                  await Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => SellerStorePage(
                                        sellerId: '${s.sellerId}',
                                        sellerName: s.displayName,
                                      ),
                                    ),
                                  );
                                  _load();
                                },
                              ),
                            );
                          },
                        ),
                ),
    );
  }
}
