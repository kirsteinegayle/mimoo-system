import 'package:flutter/material.dart';

import '../../core/theme.dart';
import '../../mock/rider_mock.dart';
import '../../widgets/job_widgets.dart';
import '../../widgets/motion.dart';
import 'job_actions.dart';
import 'job_router.dart';
import 'jobs_screen.dart';

/// DEBUG ONLY (opened behind kDebugMode): one card per job state so every
/// design can be previewed. Uses standalone MOCK sample jobs, so tapping
/// buttons here never changes the rider's real (mock) job list.
class StateGalleryScreen extends StatefulWidget {
  const StateGalleryScreen({super.key});
  @override
  State<StateGalleryScreen> createState() => _StateGalleryScreenState();
}

class _StateGalleryScreenState extends State<StateGalleryScreen> {
  List<MockJob> _jobs = RiderMock.galleryJobs();

  static const _captions = {
    'GAL-0001': '1 · PICKUP · Ready to pick up',
    'GAL-0002': '2 · PICKUP · Picked up',
    'GAL-0003': '3 · PICKUP · Dropped at hub (done)',
    'GAL-0004': '4 · DELIVERY · Ready to deliver',
    'GAL-0005': '5 · DELIVERY · Out for delivery',
    'GAL-0006': '6 · DELIVERY · Delivered (done)',
    'GAL-0007': '7 · DELIVERY · Failed attempt 1/3 (Retry)',
    'GAL-0008': '7 · DELIVERY · Failed attempt 3/3 (Return to Hub)',
    'GAL-0009': 'DELIVERY · Returned to hub (done)',
    'GAL-0010': 'MAP · Pickup with coordinates (map shown)',
    'GAL-0011': 'MAP · Delivery without coordinates (map unavailable)',
  };

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return ListenableBuilder(
      listenable: RiderMock.instance,
      builder: (context, _) => MScaffold(
        title: 'State gallery (debug)',
        onBack: () => Navigator.maybePop(context),
        actions: [
          IconButton(
            tooltip: 'Reset samples',
            onPressed: () => setState(() => _jobs = RiderMock.galleryJobs()),
            icon: const Icon(Icons.restart_alt, color: Colors.white),
          ),
        ],
        body: ListView.separated(
          padding: MS.pagePadding,
          itemCount: _jobs.length + 1,
          separatorBuilder: (_, __) => const SizedBox(height: MS.lg),
          itemBuilder: (context, i) {
            if (i == 0) {
              return Text(
                  'Sample jobs only. Buttons work, but only change these '
                  'samples. Tap reset to start over.',
                  style: MT.bodySm.copyWith(color: c.muted));
            }
            final job = _jobs[i - 1];
            final ui = stageUi(job);
            final (bg, fg) = ui.colors(c);
            return FadeSlideIn.stagger(i,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Container(
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                            color: bg,
                            border: Border.all(color: fg, width: 2),
                            shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(_captions[job.tracking] ?? job.tracking,
                            style: MT.labelMd.copyWith(color: c.muted)),
                      ),
                    ]),
                    const SizedBox(height: 6),
                    JobCard(
                      job: job,
                      onOpen: openJobDetail,
                      onAction: (context, j) =>
                          runJobAction(context, j, openJobDetail),
                    ),
                  ],
                ));
          },
        ),
      ),
    );
  }
}
