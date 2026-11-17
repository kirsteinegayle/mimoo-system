import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';
import '../../widgets/ticket_attachments.dart';

/// Support: the Courier Support queue (tickets routed to couriers, same as web) and the company's own
/// tickets to the admin team. Status flow: open, in progress, resolved, closed.
class SupportPage extends StatefulWidget {
  const SupportPage({super.key});

  @override
  State<SupportPage> createState() => _SupportPageState();
}

const _labels = {'open': 'Open', 'in_progress': 'In progress', 'resolved': 'Resolved', 'closed': 'Closed'};

class _SupportPageState extends State<SupportPage> with SingleTickerProviderStateMixin {
  late final TabController _tabs = TabController(length: 2, vsync: this);

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        title: const Text('Support'),
        bottom: TabBar(
          controller: _tabs,
          labelColor: kPrimary,
          indicatorColor: kPrimary,
          labelStyle: pjs(size: 13, weight: FontWeight.w700),
          tabs: const [Tab(text: 'Courier queue'), Tab(text: 'My tickets')],
        ),
      ),
      body: TabBarView(controller: _tabs, children: const [_QueueTab(), _MineTab()]),
    );
  }
}

class _QueueTab extends StatefulWidget {
  const _QueueTab();

  @override
  State<_QueueTab> createState() => _QueueTabState();
}

class _QueueTabState extends State<_QueueTab> with AutomaticKeepAliveClientMixin {
  List<Map<String, dynamic>> _rows = [];
  Map<String, dynamic> _counts = {};
  String _status = 'open';
  String _query = '';
  bool _loading = true;
  String? _error;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _error = null);
    try {
      final r = await CourierRepository.instance.supportFeed(_status);
      if (!mounted) return;
      setState(() {
        _rows = r.items;
        _counts = r.counts;
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

  Future<void> _open(Map<String, dynamic> t) async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => _TicketPage(id: t['id'] as int)));
    _load();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final q = _query.trim().toLowerCase();
    final shown = _rows.where((t) => q.isEmpty || '${t['subject']} ${t['user_name']} ${t['order_number']}'.toLowerCase().contains(q)).toList();
    return _loading
        ? const CourierLoadingState()
        : _error != null && _rows.isEmpty
            ? CourierErrorState(message: _error!, onRetry: _load)
            : RefreshIndicator(
                onRefresh: _load,
                child: ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(16),
                  children: [
                    CourierFilterChips(
                      options: {
                        'open': 'Open ${_counts['open'] ?? 0}',
                        'in_progress': 'In progress ${_counts['in_progress'] ?? 0}',
                        'resolved': 'Resolved ${_counts['resolved'] ?? 0}',
                        'closed': 'Closed ${_counts['closed'] ?? 0}',
                        'all': 'All',
                      },
                      value: _status,
                      onChanged: (v) {
                        setState(() {
                          _status = v;
                          _loading = true;
                        });
                        _load();
                      },
                    ),
                    const SizedBox(height: 8),
                    CourierSearchField(hint: 'Search subject, name or order', onChanged: (v) => setState(() => _query = v)),
                    const SizedBox(height: 12),
                    if (shown.isEmpty)
                      const SizedBox(height: 260, child: CourierEmptyState(icon: Icons.support_agent_outlined, message: 'No tickets in this queue. Issues about your couriers from buyers and sellers appear here.')),
                    for (final t in shown) _ticketCard(t),
                  ],
                ),
              );
  }

  Widget _ticketCard(Map<String, dynamic> t) => InkWell(
        onTap: () => _open(t),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.circular(12), border: Border.all(color: kBorder)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text('#${t['id']} ${t['subject']}', style: pjs(size: 14, weight: FontWeight.w800), maxLines: 2, overflow: TextOverflow.ellipsis)),
              CourierStatusBadge(status: _badge('${t['status']}'), label: _labels['${t['status']}']),
            ]),
            const SizedBox(height: 4),
            Text('${t['user_name']} (${t['user_role']}) · ${t['category_label']}${t['order_number'] != null ? ' · ${t['order_number']}' : ''}',
                style: pjs(size: 12, color: kSubtext)),
          ]),
        ),
      );
}

String _badge(String s) => switch (s) { 'open' => 'pending', 'in_progress' => 'in_transit', 'resolved' => 'completed', _ => 'cancelled' };

class _TicketPage extends StatefulWidget {
  const _TicketPage({required this.id});
  final int id;

  @override
  State<_TicketPage> createState() => _TicketPageState();
}

class _TicketPageState extends State<_TicketPage> {
  Map<String, dynamic>? _t;
  final _reply = TextEditingController();
  final _pickerKey = GlobalKey<AttachmentPickerFieldState>();
  List<PickedFile> _files = [];
  bool _loading = true;
  bool _busy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _reply.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final t = await CourierRepository.instance.supportTicket(widget.id);
      if (!mounted) return;
      setState(() {
        _t = t;
        _loading = false;
        _error = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = ApiService.friendlyError(e);
      });
    }
  }

  Future<void> _send() async {
    final body = _reply.text.trim();
    if (body.isEmpty) return;
    setState(() => _busy = true);
    try {
      await CourierRepository.instance.supportReply(widget.id, body, files: _files);
      _reply.clear();
      _pickerKey.currentState?.clear();
      await _load();
    } catch (e) {
      if (mounted) courierSnack(context, e is ApiException ? e.message : ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _status(String s) async {
    if (s == 'closed') {
      final ok = await courierConfirm(context, title: 'Close ticket?', message: 'The sender can no longer reply to a closed ticket.', confirmLabel: 'Close ticket', destructive: true);
      if (!ok) return;
    }
    setState(() => _busy = true);
    try {
      await CourierRepository.instance.supportStatus(widget.id, s);
      await _load();
    } catch (e) {
      if (mounted) courierSnack(context, e is ApiException ? e.message : ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = _t;
    final done = t != null && (t['status'] == 'resolved' || t['status'] == 'closed');
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(title: Text(t == null ? 'Ticket' : 'Ticket #${t['id']}')),
      body: _loading
          ? const CourierLoadingState()
          : t == null
              ? CourierErrorState(message: _error ?? 'Could not load the ticket.', onRetry: _load)
              : SafeArea(
                  child: Column(children: [
                    Expanded(
                      child: ListView(padding: const EdgeInsets.all(16), children: [
                        Text('${t['subject']}', style: pjs(size: 16, weight: FontWeight.w800)),
                        const SizedBox(height: 4),
                        Row(children: [
                          CourierStatusBadge(status: _badge('${t['status']}'), label: _labels['${t['status']}']),
                          const SizedBox(width: 8),
                          Expanded(child: Text('${t['user_name']} · ${t['category_label']}${t['order_number'] != null ? ' · ${t['order_number']}' : ''}', style: pjs(size: 12, color: kSubtext))),
                        ]),
                        const SizedBox(height: 12),
                        _bubble('${t['message']}', mine: false, files: t['attachments'] as List<dynamic>? ?? const []),
                        for (final r in (t['replies'] as List<dynamic>? ?? [])) _bubble('${r['body']}', mine: r['from'] != 'user', files: r['attachments'] as List<dynamic>? ?? const []),
                      ]),
                    ),
                    Container(
                      color: kCard,
                      padding: const EdgeInsets.all(12),
                      child: Column(mainAxisSize: MainAxisSize.min, children: [
                        if (!done) ...[
                          AttachmentPickerField(key: _pickerKey, enabled: !_busy, onChanged: (f) => _files = f),
                          const SizedBox(height: 8),
                          Row(children: [
                            Expanded(child: TextField(controller: _reply, minLines: 1, maxLines: 4, maxLength: 2000, style: pjs(size: 14), decoration: mimooInput(hint: 'Write a reply…').copyWith(counterText: ''))),
                            const SizedBox(width: 8),
                            IconButton.filled(
                              onPressed: _busy ? null : _send,
                              style: IconButton.styleFrom(backgroundColor: kPrimary, minimumSize: const Size(48, 48)),
                              icon: const Icon(Icons.send, color: Colors.white),
                              tooltip: 'Send reply',
                            ),
                          ]),
                        ] else
                          Text('This ticket is ${_labels['${t['status']}']!.toLowerCase()}. Reopen it to reply.', style: pjs(size: 12, color: kSubtext)),
                        const SizedBox(height: 8),
                        Wrap(spacing: 8, runSpacing: 4, children: [
                          for (final s in _labels.keys.where((s) => s != t['status']))
                            OutlinedButton(
                              onPressed: _busy ? null : () => _status(s),
                              style: OutlinedButton.styleFrom(minimumSize: const Size(48, 40)),
                              child: Text('Mark ${_labels[s]!.toLowerCase()}', style: pjs(size: 12, weight: FontWeight.w700)),
                            ),
                        ]),
                      ]),
                    ),
                  ]),
                ),
    );
  }

  Widget _bubble(String text, {required bool mine, List<dynamic> files = const []}) => Align(
        alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
          decoration: BoxDecoration(color: mine ? kPrimary : kCard, borderRadius: BorderRadius.circular(12), border: mine ? null : Border.all(color: kBorder)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(text, style: pjs(size: 13, color: mine ? Colors.white : kText)),
            AttachmentThumbs(files: files, onDark: mine),
          ]),
        ),
      );
}

class _MineTab extends StatefulWidget {
  const _MineTab();

  @override
  State<_MineTab> createState() => _MineTabState();
}

class _MineTabState extends State<_MineTab> with AutomaticKeepAliveClientMixin {
  List<Map<String, dynamic>> _rows = [];
  Map<String, String> _cats = {};
  bool _loading = true;
  String? _error;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _error = null);
    try {
      final r = await CourierRepository.instance.myTickets();
      if (!mounted) return;
      setState(() {
        _rows = r.items;
        _cats = r.categories;
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

  Future<void> _new() async {
    final cats = Map<String, String>.from(_cats)..removeWhere((k, _) => k == 'logistics' || k == 'courier');
    if (cats.isEmpty) cats.addAll({'technical': 'Technical problem', 'other': 'Other'});
    final sent = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => _NewTicket(categories: cats),
    );
    if (sent == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: kSurface,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _new,
        backgroundColor: kPrimary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text('New ticket', style: pjs(size: 13, weight: FontWeight.w700, color: Colors.white)),
      ),
      body: _loading
          ? const CourierLoadingState()
          : _error != null && _rows.isEmpty
              ? CourierErrorState(message: _error!, onRetry: _load)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
                    children: [
                      if (_rows.isEmpty)
                        SizedBox(height: 300, child: CourierEmptyState(icon: Icons.confirmation_number_outlined, message: 'No tickets yet. Need help from the mimoo team?', actionLabel: 'New ticket', onAction: _new)),
                      for (final t in _rows)
                        Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.circular(12), border: Border.all(color: kBorder)),
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Row(children: [
                              Expanded(child: Text('${t['subject']}', style: pjs(size: 14, weight: FontWeight.w800))),
                              CourierStatusBadge(status: _badge('${t['status']}'), label: _labels['${t['status']}']),
                            ]),
                            const SizedBox(height: 4),
                            Text('${t['category_label']} · to ${t['target'] ?? 'admin'}', style: pjs(size: 12, color: kSubtext)),
                            const SizedBox(height: 4),
                            Text('${t['message']}', maxLines: 2, overflow: TextOverflow.ellipsis, style: pjs(size: 12)),
                          ]),
                        ),
                    ],
                  ),
                ),
    );
  }
}

class _NewTicket extends StatefulWidget {
  const _NewTicket({required this.categories});
  final Map<String, String> categories;

  @override
  State<_NewTicket> createState() => _NewTicketState();
}

class _NewTicketState extends State<_NewTicket> {
  final _key = GlobalKey<FormState>();
  final _subject = TextEditingController();
  final _message = TextEditingController();
  List<PickedFile> _files = [];
  late String _cat = widget.categories.keys.first;
  bool _busy = false;

  @override
  void dispose() {
    _subject.dispose();
    _message.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (!_key.currentState!.validate()) return;
    setState(() => _busy = true);
    try {
      final msg = await CourierRepository.instance.createTicket(_cat, _subject.text.trim(), _message.text.trim(), files: _files);
      if (!mounted) return;
      courierSnack(context, msg, kGreen);
      Navigator.pop(context, true);
    } catch (e) {
      if (mounted) courierSnack(context, e is ApiException ? e.message : ApiService.friendlyError(e), kFlash);
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Padding(
        padding: EdgeInsets.fromLTRB(20, 0, 20, MediaQuery.of(context).viewInsets.bottom + 20),
        child: Form(
          key: _key,
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('New ticket to mimoo support', style: pjs(size: 16, weight: FontWeight.w800)),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _cat,
              isExpanded: true,
              decoration: mimooInput(hint: 'Category'),
              items: [for (final e in widget.categories.entries) DropdownMenuItem(value: e.key, child: Text(e.value, overflow: TextOverflow.ellipsis))],
              onChanged: (v) => setState(() => _cat = v ?? _cat),
            ),
            const SizedBox(height: 10),
            TextFormField(controller: _subject, maxLength: 120, style: pjs(size: 14), decoration: mimooInput(hint: 'Subject'), validator: (v) => (v == null || v.trim().length < 3) ? 'Subject needs at least 3 characters.' : null),
            TextFormField(controller: _message, minLines: 3, maxLines: 6, maxLength: 2000, style: pjs(size: 14), decoration: mimooInput(hint: 'What happened?'), validator: (v) => (v == null || v.trim().length < 10) ? 'Please describe the problem (at least 10 characters).' : null),
            const SizedBox(height: 8),
            AttachmentPickerField(enabled: !_busy, onChanged: (f) => _files = f),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: FilledButton(
                onPressed: _busy ? null : _send,
                style: FilledButton.styleFrom(backgroundColor: kPrimary),
                child: _busy ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : Text('Send ticket', style: pjs(size: 14, weight: FontWeight.w700, color: Colors.white)),
              ),
            ),
          ]),
        ),
      );
}
