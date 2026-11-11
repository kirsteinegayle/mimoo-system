import 'package:flutter/material.dart';
import '../../models/courier_models.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

/// Rider Management, READ-ONLY (GET /api/courier-app/riders): riders of this
/// courier with vehicle, plate, online / offline and account status.
/// Approving or rejecting rider applications is done on the web only.
class RiderManagementPage extends StatefulWidget {
  const RiderManagementPage({super.key});

  @override
  State<RiderManagementPage> createState() => _RiderManagementPageState();
}

class _RiderManagementPageState extends State<RiderManagementPage> {
  List<CourierRiderItem> _items = [];
  int _online = 0;
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
      final r = await CourierRepository.instance.riders();
      if (!mounted) return;
      setState(() {
        _items = r.items;
        _online = r.online;
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
        title: Text('Rider Management',
            style: pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kPrimary))
          : _error != null
              ? CourierErrorState(message: _error!, onRetry: _load)
              : RefreshIndicator(
                  color: kPrimary,
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Container(
                        padding: const EdgeInsets.all(11),
                        decoration: BoxDecoration(
                          color: kChip,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(children: [
                          const Icon(Icons.info_outline,
                              size: 16, color: kPrimary),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Approve riders on the web (Rider Management). This list is read-only.',
                              style: pjs(size: 11, color: kPrimary),
                            ),
                          ),
                        ]),
                      ),
                      const SizedBox(height: 10),
                      Text('${_items.length} riders · $_online online',
                          style: pjs(
                              size: 12,
                              weight: FontWeight.w700,
                              color: kSubtext)),
                      const SizedBox(height: 8),
                      if (_items.isEmpty)
                        const Padding(
                          padding: EdgeInsets.only(top: 40),
                          child: CourierEmptyState(
                            icon: Icons.groups_outlined,
                            message:
                                'No riders yet. Approved rider applications appear here.',
                          ),
                        )
                      else
                        ..._items.map(_card),
                    ],
                  ),
                ),
    );
  }

  Widget _card(CourierRiderItem r) {
    final vehicle = [
      if (r.vehicleType != null && r.vehicleType!.isNotEmpty)
        displayStatus(r.vehicleType!),
      if (r.plateNumber != null && r.plateNumber!.isNotEmpty) r.plateNumber!,
    ].join(' · ');

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        CircleAvatar(
          radius: 20,
          backgroundColor: kChip,
          child: Icon(Icons.two_wheeler,
              color: r.isOnline ? kGreen : kSubtext, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(r.name, style: pjs(size: 14, weight: FontWeight.w800)),
            Text(vehicle.isEmpty ? 'Vehicle not provided' : vehicle,
                style: pjs(size: 12, color: kSubtext)),
            if (r.contactNumber != null && r.contactNumber!.isNotEmpty)
              Text(r.contactNumber!, style: pjs(size: 11, color: kSubtext)),
            const SizedBox(height: 6),
            Wrap(spacing: 6, runSpacing: 6, children: [
              CourierStatusBadge(
                status: r.isOnline ? 'active' : 'off_duty',
                label: r.isOnline ? 'Online' : 'Offline',
              ),
              CourierStatusBadge(
                status: r.approved ? 'approved' : 'pending',
                label: r.approved ? 'Approved' : 'Not approved',
              ),
              if (r.status != 'active')
                CourierStatusBadge(status: r.status),
              if (r.activeJobs > 0)
                CourierStatusBadge(
                  status: 'in_transit',
                  label: '${r.activeJobs} active job${r.activeJobs == 1 ? '' : 's'}',
                ),
            ]),
          ]),
        ),
      ]),
    );
  }
}
