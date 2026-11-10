import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../core/api_config.dart';
import '../../core/theme.dart';
import '../../data/parcel_flow.dart' show clock;
import '../../mock/rider_mock.dart';
import '../../widgets/common.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/motion.dart';

/// Bell destination: notifications only (new assigned jobs, reminders).
/// Messages have their own header icon. MOCK data from [RiderMock].
class InboxScreen extends StatelessWidget {
  const InboxScreen({super.key, this.onOpenJob});

  final void Function(BuildContext context, MockJob job)? onOpenJob;

  @override
  Widget build(BuildContext context) {
    final mock = RiderMock.instance;
    return ListenableBuilder(
      listenable: mock,
      builder: (context, _) {
        final c = MC.of(context);
        final items = mock.notifications;
        return MScaffold(
          title: 'Notifications',
          onBack: () => Navigator.maybePop(context),
          actions: [
            if (mock.unreadNotifications > 0)
              TextButton(
                onPressed: mock.markAllNotificationsRead,
                child: Text('Mark all read',
                    style: ts(14, w: FontWeight.w700, c: Colors.white)),
              ),
          ],
          body: ListView(padding: MS.pagePadding, children: [
            if (items.isEmpty)
              const EmptyState(
                icon: Icons.notifications_none_rounded,
                title: 'No notifications',
                message: 'New assigned jobs and reminders will show up here.',
              ),
            for (var i = 0; i < items.length; i++) ...[
              FadeSlideIn.stagger(i, child: _tile(context, c, mock, items[i])),
              const SizedBox(height: MS.sm),
            ],
            if (kDebugMode && useMock) ...[
              const SizedBox(height: MS.lg),
              TextButton.icon(
                onPressed: mock.simulateAssignment,
                icon: const Icon(Icons.add_task, size: 18),
                label: const Text('DEBUG: Simulate assigned job (MOCK)'),
              ),
            ],
          ]),
        );
      },
    );
  }

  Widget _tile(BuildContext context, MimooColors c, RiderMock mock,
      MockNotification n) {
    final isJob = n.jobId != null;
    return MCard(
      color: n.unread ? c.tint : null,
      onTap: () {
        mock.markNotificationRead(n);
        final job = isJob ? mock.byId(n.jobId!) : null;
        if (job != null && onOpenJob != null) onOpenJob!(context, job);
      },
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        IconDot(isJob ? Icons.assignment_turned_in_outlined : Icons.payments_outlined,
            bg: isJob ? c.tint : c.coralSoft, fg: isJob ? c.primary : c.coral),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(n.title, style: MT.labelLg),
            const SizedBox(height: 2),
            Text(n.body, style: MT.bodySm.copyWith(color: c.muted)),
            const SizedBox(height: 4),
            Text(clock(n.at), style: MT.bodySm.copyWith(color: c.muted)),
          ]),
        ),
        if (n.unread)
          Container(
              width: 8,
              height: 8,
              margin: const EdgeInsets.only(top: 6),
              decoration: BoxDecoration(color: c.coral, shape: BoxShape.circle)),
      ]),
    );
  }
}
