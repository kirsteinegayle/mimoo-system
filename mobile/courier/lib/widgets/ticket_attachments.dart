import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/mimoo_theme.dart';
import 'courier_shared.dart';

const kMaxTicketFiles = 3;
const kMaxTicketFileBytes = 5 * 1024 * 1024;
const _allowed = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

typedef PickedFile = ({List<int> bytes, String filename});

/// Attach photos / PDFs to a ticket or reply. Checks type, size and count before upload
/// (the server validates again).
class AttachmentPickerField extends StatefulWidget {
  const AttachmentPickerField({super.key, required this.onChanged, this.enabled = true});
  final ValueChanged<List<PickedFile>> onChanged;
  final bool enabled;

  @override
  State<AttachmentPickerField> createState() => AttachmentPickerFieldState();
}

class AttachmentPickerFieldState extends State<AttachmentPickerField> {
  final List<PickedFile> _files = [];
  String? _error;

  void clear() {
    setState(_files.clear);
    widget.onChanged(const []);
  }

  Future<void> _pick() async {
    setState(() => _error = null);
    final r = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: _allowed,
      allowMultiple: true,
      withData: true,
    );
    if (r == null) return;
    for (final f in r.files) {
      final bytes = f.bytes;
      if (bytes == null) continue;
      if (!_allowed.contains((f.extension ?? '').toLowerCase())) {
        _error = '"${f.name}" is not allowed. Use JPG, PNG, WEBP or PDF.';
        continue;
      }
      if (bytes.length > kMaxTicketFileBytes) {
        _error = '"${f.name}" is larger than 5 MB.';
        continue;
      }
      if (_files.length >= kMaxTicketFiles) {
        _error = 'You can attach up to $kMaxTicketFiles files.';
        break;
      }
      _files.add((bytes: bytes, filename: f.name));
    }
    setState(() {});
    widget.onChanged(List.of(_files));
  }

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Wrap(spacing: 8, runSpacing: 4, crossAxisAlignment: WrapCrossAlignment.center, children: [
        OutlinedButton.icon(
          onPressed: widget.enabled && _files.length < kMaxTicketFiles ? _pick : null,
          style: OutlinedButton.styleFrom(minimumSize: const Size(48, 48), side: const BorderSide(color: kBorder)),
          icon: const Icon(Icons.attach_file, size: 18, color: kPrimary),
          label: Text('Attach photo / PDF', style: pjs(size: 12, weight: FontWeight.w700, color: kPrimary)),
        ),
        for (var i = 0; i < _files.length; i++)
          InputChip(
            label: SizedBox(
                width: 110,
                child: Text(_files[i].filename, overflow: TextOverflow.ellipsis, style: pjs(size: 11))),
            onDeleted: widget.enabled
                ? () {
                    setState(() => _files.removeAt(i));
                    widget.onChanged(List.of(_files));
                  }
                : null,
          ),
      ]),
      if (_error != null)
        Padding(padding: const EdgeInsets.only(top: 4), child: Text(_error!, style: pjs(size: 11, color: kFlash))),
    ]);
  }
}

/// Attachments of a ticket / reply: image thumbnails (tap to enlarge) and PDF chips.
/// Files are private, so the image request carries the same bearer token as API calls.
class AttachmentThumbs extends StatelessWidget {
  const AttachmentThumbs({super.key, required this.files, this.onDark = false});
  final List<dynamic> files;
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    if (files.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Wrap(spacing: 8, runSpacing: 8, children: [
        for (final raw in files)
          Builder(builder: (ctx) {
            final f = Map<String, dynamic>.from(raw as Map);
            final url = ApiService.absoluteUrl('${f['url']}');
            if (f['is_image'] == true) {
              return Semantics(
                label: 'Attachment ${f['name']}',
                button: true,
                child: InkWell(
                  onTap: () => showDialog<void>(
                    context: ctx,
                    builder: (_) => Dialog(
                      child: InteractiveViewer(
                        child: Image.network(url, headers: ApiService.authHeaders, fit: BoxFit.contain,
                            errorBuilder: (_, __, ___) => const Padding(padding: EdgeInsets.all(24), child: Text('Could not load the image.'))),
                      ),
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(url, headers: ApiService.authHeaders, width: 88, height: 88, fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(width: 88, height: 88, color: kChip, child: const Icon(Icons.broken_image_outlined, color: kSubtext))),
                  ),
                ),
              );
            }
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(color: onDark ? Colors.white12 : kChip, borderRadius: BorderRadius.circular(8)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.picture_as_pdf_outlined, size: 18, color: onDark ? Colors.white : kFlash),
                const SizedBox(width: 6),
                Flexible(child: Text('${f['name']} · open on the web to view', style: pjs(size: 11, color: onDark ? Colors.white : kText))),
              ]),
            );
          }),
      ]),
    );
  }
}

/// Convenience for snack errors from uploads.
String uploadError(Object e) => e is ApiException ? e.message : ApiService.friendlyError(e);

void showUploadError(BuildContext context, Object e) => courierSnack(context, uploadError(e), kFlash);
