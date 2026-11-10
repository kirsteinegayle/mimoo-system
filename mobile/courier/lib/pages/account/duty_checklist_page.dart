import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../services/location_service.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

class DutyChecklistPage extends StatefulWidget {
  const DutyChecklistPage({super.key});

  @override
  State<DutyChecklistPage> createState() => _DutyChecklistPageState();
}

class _DutyChecklistPageState extends State<DutyChecklistPage> {
  static const _items = [
    ('tires', 'Tires', Icons.trip_origin),
    ('lights', 'Lights', Icons.lightbulb_outline),
    ('brakes', 'Brakes', Icons.disc_full_outlined),
    ('fuel', 'Fuel', Icons.local_gas_station_outlined),
    ('cargo_door_lock', 'Cargo door lock', Icons.lock_outline),
  ];

  final Map<String, String> _answers = {
    for (final i in _items) i.$1: 'ok',
  };
  final Map<String, TextEditingController> _notes = {
    for (final i in _items) i.$1: TextEditingController(),
  };
  bool _submitting = false;

  @override
  void dispose() {
    for (final c in _notes.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (_submitting) return;
    for (final item in _items) {
      if (_answers[item.$1] == 'not_ok') {
        final length = _notes[item.$1]!.text.trim().length;
        if (length < 10 || length > 300) {
          courierSnack(
            context,
            'Add a note of 10 to 300 characters for ${item.$2}.',
            kFlash,
          );
          return;
        }
      }
    }

    setState(() => _submitting = true);
    double? latitude;
    double? longitude;
    try {
      final location = await LocationService.current();
      latitude = location.latitude;
      longitude = location.longitude;
    } catch (_) {
      if (mounted) {
        courierSnack(
          context,
          'Location is unavailable. The checklist will still be saved.',
          Colors.orange,
        );
      }
    }

    try {
      final result = await CourierRepository.instance.submitChecklist(
        items: _answers,
        notes: {
          for (final item in _items)
            if (_answers[item.$1] == 'not_ok')
              item.$1: _notes[item.$1]!.text.trim(),
        },
        latitude: latitude,
        longitude: longitude,
      );
      if (!mounted) return;
      if (result.dutyStatus == 'on_duty') {
        courierSnack(context, 'Checklist passed. You are On Duty.', kGreen);
        Navigator.pop(context, true);
      } else {
        await showDialog<void>(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Checklist saved'),
            content: const Text(
              'One or more items need attention, so you remain Off Duty. '
              'Logistics has been notified.',
            ),
            actions: [
              FilledButton(
                onPressed: () => Navigator.pop(context),
                style: FilledButton.styleFrom(backgroundColor: kPrimary),
                child: const Text('OK'),
              ),
            ],
          ),
        );
        if (mounted) Navigator.pop(context, false);
      }
    } catch (e) {
      if (!mounted) return;
      courierSnack(context, ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Text('Pre-trip Checklist',
            style: pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: kChip,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(children: [
              const Icon(Icons.fact_check_outlined, color: kPrimary),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Inspect your vehicle before going On Duty. Every item must be answered.',
                  style: pjs(size: 12, color: kPrimary, height: 1.4),
                ),
              ),
            ]),
          ),
          const SizedBox(height: 14),
          for (final item in _items) ...[
            Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(13),
              decoration: BoxDecoration(
                color: kCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: kBorder),
              ),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Icon(item.$3, size: 19, color: kPrimary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(item.$2,
                            style:
                                pjs(size: 13, weight: FontWeight.w800)),
                      ),
                      SegmentedButton<String>(
                        segments: const [
                          ButtonSegment(value: 'ok', label: Text('OK')),
                          ButtonSegment(
                              value: 'not_ok', label: Text('Not OK')),
                        ],
                        selected: {_answers[item.$1]!},
                        onSelectionChanged: (value) {
                          setState(() => _answers[item.$1] = value.first);
                        },
                        style: ButtonStyle(
                          visualDensity: VisualDensity.compact,
                          textStyle: WidgetStatePropertyAll(
                              pjs(size: 10, weight: FontWeight.w700)),
                        ),
                      ),
                    ]),
                    if (_answers[item.$1] == 'not_ok') ...[
                      const SizedBox(height: 10),
                      TextField(
                        controller: _notes[item.$1],
                        maxLines: 2,
                        maxLength: 300,
                        style: pjs(size: 12),
                        decoration: mimooInput(
                          hint: 'Describe the issue (min 10 characters)',
                          error: null,
                        ),
                      ),
                    ],
                  ]),
            ),
          ],
          const SizedBox(height: 8),
          SizedBox(
            height: 50,
            child: FilledButton.icon(
              onPressed: _submitting ? null : _submit,
              style: FilledButton.styleFrom(
                backgroundColor: kPrimary,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
              icon: _submitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.check_circle_outline, color: Colors.white),
              label: Text(
                _submitting ? 'Submitting...' : 'Submit Checklist',
                style: pjs(
                    size: 15,
                    weight: FontWeight.w800,
                    color: Colors.white),
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
