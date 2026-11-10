import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../core/theme.dart';
import '../../data/parcel_flow.dart' show clock;
import '../../mock/rider_mock.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/job_widgets.dart';
import '../../widgets/motion.dart';
import 'job_actions.dart';
import 'state_gallery_screen.dart';

/// Jobs tab: "To do" (directly assigned) and "Done" (history), filtered by
/// All / Pickup / Delivery. MOCK data from [RiderMock].
class JobsScreen extends StatefulWidget {
  const JobsScreen({super.key, required this.onOpen, required this.onAction});

  final JobOpener onOpen;
  final JobOpener onAction;

  @override
  State<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends State<JobsScreen> {
  int _tab = 0; // 0 To do, 1 Done
  MockJobType? _filter; // null = All

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final mock = RiderMock.instance;
    return ListenableBuilder(
      listenable: mock,
      builder: (context, _) {
        final source = _tab == 0 ? mock.todo : mock.done;
        final items = _filter == null
            ? source
            : source.where((j) => j.type == _filter).toList();
        return Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Column(children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                child: SegmentedButton<int>(
                  showSelectedIcon: false,
                  expandedInsets: EdgeInsets.zero,
                  segments: [
                    ButtonSegment(
                        value: 0, label: Text('To do (${mock.todo.length})')),
                    ButtonSegment(
                        value: 1, label: Text('Done (${mock.done.length})')),
                  ],
                  selected: {_tab},
                  onSelectionChanged: (s) => setState(() => _tab = s.first),
                ),
              ),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(children: [
                  _chip('All', null),
                  const SizedBox(width: 8),
                  _chip('Pickup', MockJobType.pickup),
                  const SizedBox(width: 8),
                  _chip('Delivery', MockJobType.delivery),
                  if (kDebugMode) ...[
                    const SizedBox(width: 8),
                    TextButton.icon(
                      onPressed: () => Navigator.of(context).push(
                          MaterialPageRoute<void>(
                              builder: (_) => const StateGalleryScreen())),
                      icon: const Icon(Icons.palette_outlined, size: 18),
                      label: const Text('State gallery'),
                    ),
                  ],
                ]),
              ),
              const SizedBox(height: 4),
              Expanded(
                child: RefreshIndicator(
                  color: c.primary,
                  onRefresh: mock.refresh,
                  child: items.isEmpty
                      ? ListView(children: [
                          const SizedBox(height: 40),
                          EmptyState(
                            icon: _tab == 0
                                ? Icons.inventory_2_outlined
                                : Icons.history,
                            title: _tab == 0 ? 'No jobs to do' : 'No finished jobs yet',
                            message: _tab == 0
                                ? "You'll get a notification when the hub assigns one."
                                : 'Completed pickups and deliveries show up here.',
                          ),
                        ])
                      : ListView.separated(
                          key: ValueKey('$_tab-$_filter'),
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                          itemCount: items.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: MS.md),
                          itemBuilder: (context, i) => FadeSlideIn.stagger(i,
                              child: JobCard(
                                job: items[i],
                                onOpen: widget.onOpen,
                                onAction: widget.onAction,
                              )),
                        ),
                ),
              ),
            ]),
          ),
        );
      },
    );
  }

  Widget _chip(String label, MockJobType? type) => ChoiceChip(
        label: Text(label),
        selected: _filter == type,
        showCheckmark: false,
        onSelected: (_) => setState(() => _filter = type),
      );
}

/// Job card: type tag, status badge, tracking no., area, money, ONE button.
class JobCard extends StatelessWidget {
  const JobCard(
      {super.key,
      required this.job,
      required this.onOpen,
      required this.onAction});
  final MockJob job;
  final JobOpener onOpen, onAction;

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final ui = stageUi(job);
    final (_, tone) = ui.colors(c);
    return MCard(
      radius: 18,
      onTap: () => onOpen(context, job),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(
            child: Wrap(
              spacing: 6,
              runSpacing: 6,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [JobTypeTag(job), StageBadge(job)],
            ),
          ),
          if (job.isDone)
            Icon(ui.icon, color: tone, size: 22),
        ]),
        const SizedBox(height: 10),
        Text(job.tracking, style: MT.labelLg),
        const SizedBox(height: 2),
        Row(children: [
          Icon(Icons.place_outlined, size: 16, color: c.muted),
          const SizedBox(width: 4),
          Expanded(
            child: Text(job.area,
                style: MT.bodyMd.copyWith(color: c.muted),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ),
          const SizedBox(width: 8),
          Text(jobMoneyLabel(job),
              style: MT.labelLg.copyWith(
                  color: !job.isPickup && job.cod > 0 ? c.coral : c.primary)),
        ]),
        if (job.stage == MockStage.failedAttempt &&
            job.lastFailReason != null) ...[
          const SizedBox(height: 8),
          Row(children: [
            Icon(Icons.info_outline, size: 16, color: tone),
            const SizedBox(width: 4),
            Expanded(
              child: Text('Reason: ${job.lastFailReason}',
                  style: MT.bodySm.copyWith(color: tone)),
            ),
          ]),
        ],
        if (job.isDone) ...[
          const SizedBox(height: 8),
          Text(_doneLine(job), style: MT.bodySm.copyWith(color: c.muted)),
        ],
        if (ui.action != null) ...[
          const SizedBox(height: 12),
          StageButtons(
              job: job, onOpen: onOpen, showSecondary: false, height: 46),
        ],
      ]),
    );
  }

  static String _doneLine(MockJob job) {
    final at = job.completedAt == null ? '' : ' · ${clock(job.completedAt!)}';
    return switch (job.stage) {
      MockStage.delivered => job.cod > 0
          ? 'COD collected ${peso(job.cod)} · Earned ${peso(job.earned)}$at'
          : 'Paid order · Earned ${peso(job.earned)}$at',
      MockStage.droppedAtHub => 'Earned ${peso(job.earned)}$at',
      MockStage.returnedToHub =>
        '$kMaxDeliveryAttempts failed attempts · ${job.lastFailReason ?? ''}$at',
      _ => at,
    };
  }
}
