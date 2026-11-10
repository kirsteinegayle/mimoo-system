import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/courier_models.dart';
import '../../services/api_service.dart';
import '../../services/courier_repository.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

class DocumentsPage extends StatefulWidget {
  const DocumentsPage({super.key});

  @override
  State<DocumentsPage> createState() => _DocumentsPageState();
}

class _DocumentsPageState extends State<DocumentsPage> {
  CourierProfile? _profile;
  bool _loading = true;
  bool _uploading = false;
  String? _error;
  String _type = 'or_cr';

  static const _types = [
    ('or_cr', 'OR / CR'),
    ('license', 'Driver License'),
    ('nbi', 'NBI Clearance'),
    ('other', 'Other'),
  ];

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
      final p = await CourierRepository.instance.profile();
      if (!mounted) return;
      setState(() {
        _profile = p;
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

  Future<void> _pickAndUpload() async {
    if (_uploading) return;
    final result = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['jpg', 'jpeg', 'png', 'pdf'],
      withData: true,
    );
    if (result == null || result.files.isEmpty) return;
    final file = result.files.single;
    final bytes = file.bytes;
    if (bytes == null) {
      if (mounted) {
        courierSnack(context, 'Could not read the selected file.', kFlash);
      }
      return;
    }
    await _upload(bytes, file.name);
  }

  Future<void> _captureAndUpload() async {
    if (_uploading) return;
    try {
      final photo = await ImagePicker().pickImage(
        source: ImageSource.camera,
        imageQuality: 80,
        maxWidth: 2000,
        maxHeight: 2000,
      );
      if (photo == null) return;
      await _upload(await photo.readAsBytes(), photo.name);
    } catch (e) {
      if (mounted) courierSnack(context, ApiService.friendlyError(e), kFlash);
    }
  }

  Future<void> _upload(List<int> bytes, String filename) async {
    if (bytes.length > 5 * 1024 * 1024) {
      if (mounted) {
        courierSnack(context, 'The file must be 5 MB or smaller.', kFlash);
      }
      return;
    }

    setState(() => _uploading = true);
    try {
      await CourierRepository.instance.uploadDocument(
        type: _type,
        bytes: bytes,
        filename: filename,
      );
      if (!mounted) return;
      courierSnack(context, 'Document uploaded for re-verification.', kGreen);
      await _load();
    } catch (e) {
      if (!mounted) return;
      courierSnack(context, ApiService.friendlyError(e), kFlash);
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Text('Documents', style: pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: kPrimary))
          : _error != null
              ? CourierErrorState(message: _error!, onRetry: _load)
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    CourierInfoCard(
                      title: 'Upload a document',
                      description:
                          'JPG, PNG or PDF up to 5 MB. Uploading replaces the existing file of the same type and sends it for re-verification.',
                      children: [
                        DropdownButtonFormField<String>(
                          initialValue: _type,
                          decoration: mimooInput(
                              hint: 'Document type',
                              icon: Icons.folder_outlined),
                          style: pjs(size: 13),
                          items: _types
                              .map((t) => DropdownMenuItem(
                                    value: t.$1,
                                    child: Text(t.$2, style: pjs(size: 13)),
                                  ))
                              .toList(),
                          onChanged: (value) {
                            if (value != null) setState(() => _type = value);
                          },
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 48,
                          child: FilledButton.icon(
                            onPressed: _uploading ? null : _pickAndUpload,
                            style: FilledButton.styleFrom(
                              backgroundColor: kPrimary,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                            icon: _uploading
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2, color: Colors.white))
                                : const Icon(Icons.upload_file_outlined,
                                    color: Colors.white, size: 19),
                            label: Text(
                              _uploading ? 'Uploading...' : 'Choose & Upload',
                              style: pjs(
                                  size: 13,
                                  weight: FontWeight.w800,
                                  color: Colors.white),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          height: 44,
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            onPressed: _uploading ? null : _captureAndUpload,
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: kPrimary),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                            icon: const Icon(Icons.camera_alt_outlined,
                                color: kPrimary, size: 18),
                            label: Text('Capture with camera',
                                style: pjs(
                                    size: 12,
                                    weight: FontWeight.w700,
                                    color: kPrimary)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    CourierInfoCard(
                      title: 'Your documents',
                      children: [
                        if (_profile == null || _profile!.documents.isEmpty)
                          Text('No documents uploaded yet.',
                              style: pjs(size: 12, color: kSubtext))
                        else
                          for (final d in _profile!.documents)
                            _DocumentRow(document: d),
                      ],
                    ),
                  ],
                ),
    );
  }
}

class _DocumentRow extends StatelessWidget {
  const _DocumentRow({required this.document});
  final CourierDocumentItem document;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(11),
      decoration: BoxDecoration(
        color: kSurface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: kBorder),
      ),
      child: Row(children: [
        Icon(
          document.url.toLowerCase().endsWith('.pdf')
              ? Icons.picture_as_pdf_outlined
              : Icons.image_outlined,
          color: kPrimary,
          size: 22,
        ),
        const SizedBox(width: 10),
        Expanded(
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(displayStatus(document.type),
                style: pjs(size: 12, weight: FontWeight.w800)),
            Text(document.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: pjs(size: 11, color: kSubtext)),
            if (document.uploadedAt != null)
              Text(document.uploadedAt!, style: pjs(size: 10, color: kSubtext)),
          ]),
        ),
        CourierStatusBadge(
          status: document.verified ? 'approved' : 'pending',
          label: document.verified ? 'Verified' : 'Pending',
        ),
      ]),
    );
  }
}
