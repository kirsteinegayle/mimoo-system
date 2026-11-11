import 'package:flutter/material.dart';
import 'package:intl/intl.dart' show DateFormat;

import '../../core/api_config.dart';
import '../../core/theme.dart';
import '../../mock/rider_mock.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/motion.dart';
import 'job_actions.dart' show confirmSheet, runGuarded;

/// Wallet: earnings (Today / This week) with pickup + delivery breakdown and
/// a small bar chart, COD on hand with Remit COD, and remit history.
/// API mode: the weekly chart shows real per-day earnings for the last 7 days
/// (GET /earnings data.days). Mock mode keeps the mock data.
class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});
  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  int _range = 0; // 0 Today, 1 This week

  Future<void> _remit() async {
    final mock = RiderMock.instance;
    final amount = mock.codHeld;
    final ok = await confirmSheet(context,
        icon: Icons.account_balance_outlined,
        title: 'Remit ${peso(amount)}?',
        body: 'Hand over the COD from ${mock.codHeldParcels} parcel(s) to '
            '${mock.profile.hub}.'
            '${useMock ? ' (Mock: no real payment is made.)' : ' The hub confirms it after you hand over the cash.'}',
        action: 'Confirm remittance');
    if (!ok || !mounted) return;
    String? ref;
    final done = await runGuarded(context, () async => ref = await mock.remitCod());
    if (!done || !mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(useMock
            ? '${peso(amount)} remitted (mock).'
            : '${peso(amount)} remitted. Ref ${ref ?? '-'}.')));
  }

  @override
  Widget build(BuildContext context) {
    final mock = RiderMock.instance;
    return ListenableBuilder(
      listenable: mock,
      builder: (context, _) {
        final c = MC.of(context);
        final week = _range == 1;
        final pickups = week ? mock.pickupsWeek : mock.pickupsToday;
        final deliveries = week ? mock.deliveriesWeek : mock.deliveriesToday;
        final total = week ? mock.earnedWeek : mock.earnedToday;
        final pickupAmount = mock.pickupAmount(week: week);
        final deliveryAmount = mock.deliveryAmount(week: week);
        final bars = week
            ? [for (final d in mock.weekBars) _Bar(d.day, d.pickup, d.delivery)]
            : [
                _Bar('Pickup', pickupAmount, 0),
                _Bar('Delivery', 0, deliveryAmount),
              ];
        String detail(int count, double rate) => useMock
            ? '$count × ${peso(rate)}'
            : '$count parcel${count == 1 ? '' : 's'}';
        final sections = <Widget>[
          _RangeToggle(
            value: _range,
            labels: const ['Today', 'This week'],
            onChanged: (v) => setState(() => _range = v),
          ),
          MCard(
            radius: 20,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(week ? 'EARNINGS THIS WEEK' : 'EARNINGS TODAY',
                  style: MT.badge.copyWith(color: c.muted)),
              const SizedBox(height: 4),
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: CountUp(
                    key: ValueKey('total$_range'),
                    value: total,
                    format: peso,
                    style: ts(32, w: FontWeight.w800, c: c.primary)),
              ),
              const SizedBox(height: MS.lg),
              SizedBox(
                height: 140,
                child: TweenAnimationBuilder<double>(
                  key: ValueKey('chart$_range'),
                  tween: Tween(begin: 0, end: 1),
                  duration: motion(context, const Duration(milliseconds: 700)),
                  curve: Curves.easeOutCubic,
                  builder: (context, t, _) => CustomPaint(
                    size: Size.infinite,
                    painter: _BarChartPainter(
                      bars: bars,
                      t: t,
                      pickupColor: c.primary,
                      deliveryColor: c.coral,
                      gridColor: c.outlineVariant,
                      labelStyle: ts(11, w: FontWeight.w600, c: c.muted),
                    ),
                  ),
                ),
              ),
              if (week && !useMock)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text('Chart: last 7 days',
                      style: MT.bodySm.copyWith(color: c.muted)),
                ),
              const SizedBox(height: MS.md),
              Row(children: [
                _legend(c.primary, 'Pickup'),
                const SizedBox(width: 16),
                _legend(c.coral, 'Delivery'),
              ]),
              const Divider(height: 28),
              _BreakdownRow(
                  color: c.primary,
                  label: 'Pickup',
                  detail: detail(pickups, kPickupRate),
                  amount: pickupAmount),
              const SizedBox(height: 12),
              _BreakdownRow(
                  color: c.coral,
                  label: 'Delivery',
                  detail: detail(deliveries, kDeliveryRate),
                  amount: deliveryAmount),
            ]),
          ),
          MCard(
            radius: 20,
            color: mock.codHeld > 0 ? c.coralSoft : null,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Icon(Icons.payments_outlined,
                    color: mock.codHeld > 0 ? c.coral : c.primary),
                const SizedBox(width: 8),
                Text('COD ON HAND', style: MT.badge.copyWith(color: c.muted)),
              ]),
              const SizedBox(height: 4),
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: CountUp(
                    value: mock.codHeld,
                    format: peso,
                    style: ts(28,
                        w: FontWeight.w800,
                        c: mock.codHeld > 0 ? c.coral : c.primary)),
              ),
              Text(
                  mock.codHeld > 0
                      ? '${mock.codHeldParcels} parcel(s) · Remit before $kCodDueTime'
                      : 'Nothing to remit right now.',
                  style: MT.bodySm.copyWith(color: c.muted)),
              const SizedBox(height: MS.md),
              PillButton('Remit COD',
                  icon: Icons.account_balance_outlined,
                  onPressed: mock.codHeld > 0 ? _remit : null),
            ]),
          ),
          Padding(
            padding: const EdgeInsets.only(top: MS.sm),
            child: Text('REMIT HISTORY', style: MT.badge.copyWith(color: c.muted)),
          ),
          if (mock.remits.isEmpty)
            const MCard(
              child: EmptyState(
                icon: Icons.receipt_long_outlined,
                title: 'No remittances yet',
                message: 'Your COD remittances will be listed here.',
              ),
            )
          else
            MCard(
              radius: 20,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Column(children: [
                for (var i = 0; i < mock.remits.length; i++) ...[
                  if (i > 0) const Divider(height: 1),
                  _remitTile(c, mock.remits[i]),
                ],
              ]),
            ),
        ];
        return Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: ListView.separated(
              padding: MS.pagePadding,
              itemCount: sections.length,
              separatorBuilder: (_, __) => const SizedBox(height: MS.md),
              itemBuilder: (context, i) =>
                  FadeSlideIn.stagger(i, child: sections[i]),
            ),
          ),
        );
      },
    );
  }

  Widget _legend(Color color, String label) => Row(children: [
        Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
                color: color, borderRadius: BorderRadius.circular(3))),
        const SizedBox(width: 6),
        Text(label, style: MT.bodySm),
      ]);

  Widget _remitTile(MimooColors c, MockRemit r) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
                color: c.greenBg, borderRadius: BorderRadius.circular(12)),
            child: Icon(Icons.check, color: c.green),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(peso(r.amount), style: MT.labelLg),
              Text('${r.reference} · ${r.parcels} parcel(s)',
                  style: MT.bodySm.copyWith(color: c.muted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis),
            ]),
          ),
          const SizedBox(width: 8),
          Text(DateFormat('MMM d\nh:mm a', 'en').format(r.at),
              textAlign: TextAlign.end,
              style: MT.bodySm.copyWith(color: c.muted)),
        ]),
      );
}

/// Segmented toggle with a sliding thumb.
class _RangeToggle extends StatelessWidget {
  const _RangeToggle(
      {required this.value, required this.labels, required this.onChanged});
  final int value;
  final List<String> labels;
  final ValueChanged<int> onChanged;
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return Container(
      height: 48,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
          color: c.container, borderRadius: BorderRadius.circular(99)),
      child: LayoutBuilder(builder: (context, constraints) {
        final w = constraints.maxWidth / labels.length;
        return Stack(children: [
          AnimatedPositioned(
            duration: motion(context, const Duration(milliseconds: 250)),
            curve: Curves.easeOutCubic,
            left: value * w,
            top: 0,
            bottom: 0,
            width: w,
            child: Container(
              decoration: BoxDecoration(
                color: c.primary,
                borderRadius: BorderRadius.circular(99),
                boxShadow: [
                  BoxShadow(
                      color: c.primary.withValues(alpha: 0.25),
                      blurRadius: 8,
                      offset: const Offset(0, 2))
                ],
              ),
            ),
          ),
          Row(children: [
            for (var i = 0; i < labels.length; i++)
              Expanded(
                child: Semantics(
                  button: true,
                  selected: i == value,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(99),
                    onTap: () => onChanged(i),
                    child: Center(
                      child: AnimatedDefaultTextStyle(
                        duration:
                            motion(context, const Duration(milliseconds: 200)),
                        style: ts(14,
                            w: FontWeight.w700,
                            c: i == value ? c.lowest : c.onSurfaceVariant),
                        child: Text(labels[i]),
                      ),
                    ),
                  ),
                ),
              ),
          ]),
        ]);
      }),
    );
  }
}

class _BreakdownRow extends StatelessWidget {
  const _BreakdownRow(
      {required this.color,
      required this.label,
      required this.detail,
      required this.amount});
  final Color color;
  final String label, detail;
  final double amount;
  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    return Row(children: [
      Container(
          width: 4,
          height: 36,
          decoration: BoxDecoration(
              color: color, borderRadius: BorderRadius.circular(2))),
      const SizedBox(width: 10),
      Expanded(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: MT.labelLg),
          Text(detail, style: MT.bodySm.copyWith(color: c.muted)),
        ]),
      ),
      Text(peso(amount), style: MT.labelLg),
    ]);
  }
}

class _Bar {
  const _Bar(this.label, this.pickup, this.delivery);
  final String label;
  final double pickup, delivery;
  double get total => pickup + delivery;
}

/// Stacked bar chart (pickup bottom, delivery on top). [t] grows the bars.
class _BarChartPainter extends CustomPainter {
  _BarChartPainter({
    required this.bars,
    required this.t,
    required this.pickupColor,
    required this.deliveryColor,
    required this.gridColor,
    required this.labelStyle,
  });
  final List<_Bar> bars;
  final double t;
  final Color pickupColor, deliveryColor, gridColor;
  final TextStyle labelStyle;

  @override
  void paint(Canvas canvas, Size size) {
    const labelH = 18.0;
    final chartH = size.height - labelH;
    final maxV = bars.fold<double>(0, (m, b) => b.total > m ? b.total : m);
    final grid = Paint()
      ..color = gridColor
      ..strokeWidth = 1;
    for (var i = 0; i <= 2; i++) {
      final y = chartH * i / 2;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), grid);
    }
    if (bars.isEmpty) return;
    final slot = size.width / bars.length;
    final barW = (slot * 0.5).clamp(10.0, 36.0);
    for (var i = 0; i < bars.length; i++) {
      final b = bars[i];
      final x = slot * i + (slot - barW) / 2;
      final scale = maxV == 0 ? 0.0 : chartH / maxV * t;
      final pH = b.pickup * scale;
      final dH = b.delivery * scale;
      if (pH > 0) {
        canvas.drawRRect(
          RRect.fromRectAndCorners(
            Rect.fromLTWH(x, chartH - pH, barW, pH),
            topLeft: Radius.circular(dH > 0 ? 0 : 6),
            topRight: Radius.circular(dH > 0 ? 0 : 6),
          ),
          Paint()..color = pickupColor,
        );
      }
      if (dH > 0) {
        canvas.drawRRect(
          RRect.fromRectAndCorners(
            Rect.fromLTWH(x, chartH - pH - dH, barW, dH),
            topLeft: const Radius.circular(6),
            topRight: const Radius.circular(6),
          ),
          Paint()..color = deliveryColor,
        );
      }
      if (b.total == 0) {
        canvas.drawRRect(
          RRect.fromRectAndRadius(
              Rect.fromLTWH(x, chartH - 3, barW, 3), const Radius.circular(2)),
          Paint()..color = gridColor,
        );
      }
      final tp = TextPainter(
        text: TextSpan(text: b.label, style: labelStyle),
        textDirection: TextDirection.ltr,
        maxLines: 1,
        ellipsis: '…',
      )..layout(maxWidth: slot);
      tp.paint(canvas, Offset(slot * i + (slot - tp.width) / 2, chartH + 4));
    }
  }

  @override
  bool shouldRepaint(covariant _BarChartPainter old) =>
      old.t != t || old.bars != bars;
}
