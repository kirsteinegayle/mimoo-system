import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

/// Icon + colour per activity type (shared by the dashboard section).
(IconData, Color) activityStyle(ActivityItem a) {
  if (a.isProblem) return (Icons.error_outline, kFlash);
  switch (a.type) {
    case 'shipment':
      return (Icons.inbox_outlined, kSecondary);
    case 'pickup':
      return (Icons.storefront_outlined, kPrimary);
    case 'hub':
      return (Icons.warehouse_outlined, Colors.orange);
    case 'delivery':
      return (Icons.two_wheeler, kGreen);
    default:
      return (Icons.circle_outlined, kSubtext);
  }
}

String activityTimeAgo(DateTime at) {
  final d = DateTime.now().difference(at);
  if (d.inMinutes < 1) return 'just now';
  if (d.inMinutes < 60) return '${d.inMinutes}m ago';
  if (d.inHours < 24) return '${d.inHours}h ago';
  if (d.inDays < 7) return '${d.inDays}d ago';
  const m = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  return '${m[at.month - 1]} ${at.day}';
}

/// One activity row (icon, title, detail · waybill, time ago).
class ActivityRow extends StatelessWidget {
  const ActivityRow({super.key, required this.item, this.showDivider = true});
  final ActivityItem item;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    final (icon, color) = activityStyle(item);
    final sub = [item.detail, item.waybillNumber]
        .whereType<String>()
        .where((s) => s.isNotEmpty)
        .join(' · ');
    return Column(children: [
      Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 17, color: color),
          ),
          const SizedBox(width: 10),
          Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(item.title,
                  style: pjs(
                      size: 13,
                      weight: FontWeight.w700,
                      color: item.isProblem ? kFlash : kText)),
              if (sub.isNotEmpty)
                Text(sub,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: pjs(size: 11, color: kSubtext)),
            ]),
          ),
          const SizedBox(width: 8),
          Text(activityTimeAgo(item.at), style: pjs(size: 10, color: kSubtext)),
        ]),
      ),
      if (showDivider) const Divider(height: 1, color: kBorder),
    ]);
  }
}

/// Full Recent Activity list with type filters (opened from the dashboard).
class RecentActivityPage extends StatefulWidget {
  const RecentActivityPage({super.key});

  @override
  State<RecentActivityPage> createState() => _RecentActivityPageState();
}

class _RecentActivityPageState extends State<RecentActivityPage> {
  static const _filters = [
    (null, 'All'),
    ('shipment', 'Shipments'),
    ('pickup', 'Pickups'),
    ('hub', 'Hub'),
    ('delivery', 'Deliveries'),
  ];

  String? _type;
  List<ActivityItem> _items = [];
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
      final items =
          await CourierRepository.instance.activity(limit: 50, type: _type);
      if (!mounted) return;
      setState(() {
        _items = items;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = ApiService.friendlyError(e);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Text('Recent Activity',
            style: pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: Column(children: [
        Container(
          color: kCard,
          height: 52,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            children: _filters.map((f) {
              final sel = f.$1 == _type;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  selected: sel,
                  showCheckmark: false,
                  selectedColor: kPrimary,
                  backgroundColor: kChip,
                  side: BorderSide(color: sel ? kPrimary : kBorder),
                  label: Text(f.$2,
                      style: pjs(
                          size: 12,
                          weight: FontWeight.w700,
                          color: sel ? Colors.white : kText)),
                  onSelected: (_) {
                    setState(() => _type = f.$1);
                    _load();
                  },
                ),
              );
            }).toList(),
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator(color: kPrimary))
              : _error != null
                  ? CourierErrorState(message: _error!, onRetry: _load)
                  : RefreshIndicator(
                      color: kPrimary,
                      onRefresh: _load,
                      child: ListView(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        children: _items.isEmpty
                            ? const [
                                Padding(
                                  padding: EdgeInsets.only(top: 60),
                                  child: CourierEmptyState(
                                    icon: Icons.history,
                                    message: 'No activity yet.',
                                  ),
                                ),
                              ]
                            : [
                                for (var i = 0; i < _items.length; i++)
                                  ActivityRow(
                                      item: _items[i],
                                      showDivider: i < _items.length - 1),
                              ],
                      ),
                    ),
        ),
      ]),
    );
  }
}
