import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/app_info.dart';
import '../core/theme.dart';
import '../data/repositories/app_repositories_scope.dart';
import '../data/repositories/local_repositories.dart';
import '../l10n/generated/app_localizations.dart';
import '../widgets/common.dart';

class HelpCenterScreen extends StatefulWidget {
  const HelpCenterScreen({super.key});
  @override
  State<HelpCenterScreen> createState() => _HelpCenterScreenState();
}

class _HelpCenterScreenState extends State<HelpCenterScreen> {
  final _search = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  static const _groups = <String, List<(String, String)>>{
    'Getting started': [
      ('How do I go online?', 'Open Home and turn on the Online switch. Location access must be granted before you can receive jobs.'),
      ('What does Active mean?', 'Your account is approved and eligible for dispatch. You still need to go Online to receive offers.'),
      ('Why do I see no jobs?', 'Offers depend on your location, vehicle capacity and hub zone. Move closer to the pickup corridor or check the Jobs tab.'),
    ],
    'Jobs & pickups': [
      ('How do I accept a pickup?', 'Open Jobs, choose For Pickup, then tap Accept Pickup on the request. The seller details open in your job list.'),
      ('Can I cancel an accepted pickup?', 'Contact your hub coordinator before going to the seller. Repeated cancellations affect your acceptance rate.'),
      ('What if the parcel is not ready?', 'Ask the seller for an ETA and mark the pickup as delayed in the app. Do not scan the waybill until the parcel is handed over.'),
    ],
    'Delivery & proof of delivery': [
      ('What are the proof of delivery steps?', 'Take a live photo of the handover, ask the buyer for the 6-digit code, then key in the exact cash amount for COD parcels.'),
      ('Why is my photo rejected?', 'Photos must be taken live inside the app. Gallery uploads and screenshots are not accepted.'),
      ('The buyer is not home. What now?', 'Use Delivery failed / Customer unavailable and follow the reschedule or return-to-hub instructions from your coordinator.'),
    ],
    'COD & remittance': [
      ('When is COD due?', 'Collected cash is due before the cutoff shown on your Home card, usually 10:00 PM.'),
      ('How do I remit?', 'Open COD Remittance, check the collected orders, choose GCash or the Hub Counter, then submit the exact amount.'),
      ('What if my remittance is short?', 'Logistics flags the difference and deducts it from your weekly payout. Recount the cash before submitting.'),
    ],
    'Earnings': [
      ('When do I get paid?', 'Pickup and delivery pay are added to your weekly payout after the remittance cutoff.'),
      ('Why is a failed attempt ₱0.00?', 'Failed attempts are not paid unless the hub marks them as a valid paid retry.'),
      ('Where can I see my totals?', 'The Earnings tab shows pickup pay, delivery pay and COD on hand for today, this week or a custom range.'),
    ],
    'Account & safety': [
      ('How do I change my number?', 'Open Profile from the drawer and update your contact number, then save. Identity details need Logistics approval.'),
      ('How do I report an unsafe address?', 'Use Help Center > Report a problem and include the tracking number plus a short description.'),
      ('What if I feel unsafe during a delivery?', 'Leave the area, call the Bilis Desk, and report the incident in the app. Your safety comes before the delivery.'),
    ],
  };

  String _categoryLabel(AppLocalizations l10n, String key) => switch (key) {
        'Getting started' => l10n.helpCategoryGettingStarted,
        'Jobs & pickups' => l10n.helpCategoryJobs,
        'Delivery & proof of delivery' => l10n.helpCategoryDelivery,
        'COD & remittance' => l10n.helpCategoryCod,
        'Earnings' => l10n.helpCategoryEarnings,
        _ => l10n.helpCategoryAccount,
      };

  List<MapEntry<String, List<(String, String)>>> _filtered(AppLocalizations l10n) {
    final q = _query.trim().toLowerCase();
    if (q.isEmpty) return _groups.entries.toList();
    return [
      for (final group in _groups.entries)
        if (group.key.toLowerCase().contains(q) ||
            _categoryLabel(l10n, group.key).toLowerCase().contains(q) ||
            group.value.any((faq) => faq.$1.toLowerCase().contains(q) || faq.$2.toLowerCase().contains(q)))
          MapEntry(
            group.key,
            group.key.toLowerCase().contains(q) || _categoryLabel(l10n, group.key).toLowerCase().contains(q)
                ? group.value
                : group.value.where((faq) => faq.$1.toLowerCase().contains(q) || faq.$2.toLowerCase().contains(q)).toList(),
          ),
    ];
  }

  Future<void> _callDesk() async {
    final messenger = ScaffoldMessenger.of(context);
    final l10n = AppLocalizations.of(context);
    final uri = Uri.parse('tel:$kBilisDeskPhone');
    var opened = false;
    try {
      opened = await canLaunchUrl(uri) && await launchUrl(uri);
    } catch (_) {
      opened = false;
    }
    if (!opened) messenger.showSnackBar(SnackBar(content: Text(l10n.helpCallError)));
  }

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final l10n = AppLocalizations.of(context);
    final filtered = _filtered(l10n);
    return MScaffold(
      title: l10n.helpTitle,
      onBack: () => Navigator.maybePop(context),
      body: ListView(padding: MS.pagePadding, children: [
        Text(l10n.helpHeading, style: ts(22, w: FontWeight.w700, c: c.text)),
        const SizedBox(height: 4),
        Text(l10n.helpSubtitle, style: ts(14, c: c.muted)),
        const SizedBox(height: 12),
        TextField(
          controller: _search,
          onChanged: (v) => setState(() => _query = v),
          decoration: InputDecoration(
            hintText: l10n.helpSearchHint,
            prefixIcon: const Icon(Icons.search),
            suffixIcon: _query.isEmpty ? null : IconButton(icon: const Icon(Icons.close), onPressed: () { _search.clear(); setState(() => _query = ''); }),
            filled: true,
            fillColor: c.low,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(99), borderSide: BorderSide.none),
          ),
        ),
        const SizedBox(height: 12),
        if (filtered.isEmpty)
          MCard(color: c.low, child: Column(children: [
            IconDot(Icons.search_off, size: 56, bg: c.tint, fg: c.primary),
            const SizedBox(height: 8),
            Text(l10n.helpNoResults(_query), style: ts(15, w: FontWeight.w700, c: c.text), textAlign: TextAlign.center),
            Text(l10n.helpNoResultsBody, style: ts(12, c: c.muted), textAlign: TextAlign.center),
          ]))
        else
          for (final group in filtered) ...[
            Padding(padding: const EdgeInsets.only(top: 8, bottom: 4), child: Text(_categoryLabel(l10n, group.key), style: ts(13, w: FontWeight.w800, c: c.primary))),
            MCard(padding: EdgeInsets.zero, color: c.lowest, child: Column(children: [
              for (final faq in group.value)
                ExpansionTile(
                  tilePadding: const EdgeInsets.symmetric(horizontal: 16),
                  childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                  iconColor: c.primary,
                  collapsedIconColor: c.muted,
                  title: Text(faq.$1, style: ts(14, w: FontWeight.w600, c: c.text)),
                  children: [Align(alignment: Alignment.centerLeft, child: Text(faq.$2, style: ts(13, c: c.muted, h: 1.4)))],
                ),
            ])),
            const SizedBox(height: 8),
          ],
        const SizedBox(height: 8),
        PillButton(l10n.helpCallDesk, leading: Icons.call, trailing: null, onPressed: _callDesk),
        const SizedBox(height: 8),
        PillButton.secondary(l10n.helpReportProblem, leading: Icons.report_problem, onPressed: () => _openReport(context)),
      ]),
    );
  }

  void _openReport(BuildContext context) => showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        backgroundColor: MC.of(context).lowest,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
        builder: (_) => const _ReportProblemSheet(),
      );
}

class _ReportProblemSheet extends StatefulWidget {
  const _ReportProblemSheet();
  @override
  State<_ReportProblemSheet> createState() => _ReportProblemSheetState();
}

class _ReportProblemSheetState extends State<_ReportProblemSheet> {
  static const _categoryCount = 5;
  int _category = 0;
  final _description = TextEditingController();
  Uint8List? _screenshot;
  bool _busy = false;

  @override
  void dispose() {
    _description.dispose();
    super.dispose();
  }

  Future<void> _pickScreenshot() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(source: ImageSource.gallery, imageQuality: 70, maxWidth: 1600);
    if (file == null) return;
    final bytes = await file.readAsBytes();
    if (!mounted) return;
    setState(() => _screenshot = bytes);
  }

  String _categoryLabel(AppLocalizations l10n, int index) => switch (index) {
        0 => l10n.helpCategoryJobIssue,
        1 => l10n.helpCategoryPayment,
        2 => l10n.helpCategoryAppBug,
        3 => l10n.helpCategoryAccountAccess,
        _ => l10n.helpCategorySafety,
      };

  Future<void> _submit() async {
    if (_description.text.trim().isEmpty) return;
    final l10n = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _busy = true);
    try {
      final repos = AppRepositoriesScope.of(context);
      String? screenshotPath;
      if (_screenshot != null) {
        final docsDir = await getApplicationDocumentsDirectory();
        screenshotPath = '${docsDir.path}/report_screenshot_${DateTime.now().millisecondsSinceEpoch}.jpg';
        await File(screenshotPath).writeAsBytes(_screenshot!);
      }
      if (repos is AppRepositories) {
        await repos.saveIssueReport(
          category: _categoryLabel(l10n, _category),
          description: _description.text.trim(),
          screenshotPath: screenshotPath,
        );
      }
      if (!mounted) return;
      Navigator.pop(context);
      messenger.showSnackBar(SnackBar(content: Text(l10n.helpReportSubmitted)));
    } catch (e) {
      if (!mounted) return;
      messenger.showSnackBar(SnackBar(content: Text('Could not submit report: $e')));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = MC.of(context);
    final l10n = AppLocalizations.of(context);
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 12, 20, 20 + MediaQuery.of(context).viewInsets.bottom),
      child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        Center(child: Container(width: 44, height: 5, decoration: BoxDecoration(color: c.outlineVariant, borderRadius: BorderRadius.circular(9)))),
        const SizedBox(height: 16),
        Text(l10n.helpReportTitle, style: ts(20, w: FontWeight.w700, c: c.text)),
        const SizedBox(height: 4),
        Text(l10n.helpReportSubtitle, style: ts(13, c: c.muted)),
        const SizedBox(height: 16),
        DropdownButtonFormField<int>(
          initialValue: _category,
          decoration: InputDecoration(labelText: l10n.helpReportCategory, filled: true, fillColor: c.low, border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none)),
          items: [for (var i = 0; i < _categoryCount; i++) DropdownMenuItem(value: i, child: Text(_categoryLabel(l10n, i)))],
          onChanged: (v) => setState(() => _category = v ?? _category),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _description,
          minLines: 4,
          maxLines: 6,
          onChanged: (_) => setState(() {}),
          decoration: InputDecoration(labelText: l10n.helpReportDescription, hintText: l10n.helpReportDescriptionHint, filled: true, fillColor: c.low, border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none)),
        ),
        const SizedBox(height: 12),
        InkWell(
          onTap: _pickScreenshot,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: c.tintLow, borderRadius: BorderRadius.circular(12)),
            child: Row(children: [
              Icon(_screenshot == null ? Icons.add_photo_alternate_outlined : Icons.image, color: c.primary),
              const SizedBox(width: 10),
              Expanded(child: Text(_screenshot == null ? l10n.helpReportAddScreenshot : l10n.helpReportScreenshotAttached, style: ts(13, w: FontWeight.w600, c: c.text))),
              if (_screenshot != null) Icon(Icons.check_circle, color: c.green, size: 20),
            ]),
          ),
        ),
        const SizedBox(height: 16),
        PillButton(l10n.helpReportSubmit, leading: Icons.send, trailing: null, loading: _busy, onPressed: _description.text.trim().isEmpty ? null : _submit),
      ])),
    );
  }
}
