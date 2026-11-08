import 'package:image_picker/image_picker.dart';

import '../services/review_repository.dart';

const int kMaxImageBytes = 5 * 1024 * 1024;

/// Detects JPG / PNG from the file's first bytes (not the extension).
String? sniffImageMime(List<int> b) {
  if (b.length > 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF) {
    return 'image/jpeg';
  }
  if (b.length > 8 &&
      b[0] == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47) {
    return 'image/png';
  }
  return null;
}

/// Result of a pick: accepted images plus a user-facing message for any
/// rejected file (wrong type / too big / over the limit).
class PickResult {
  const PickResult(this.images, this.warning);
  final List<PickedImage> images;
  final String? warning;
}

/// Picks up to [remaining] JPG/PNG images (≤ 5 MB each) from the gallery.
Future<PickResult> pickImages({required int remaining}) async {
  if (remaining <= 0) return const PickResult([], 'Photo limit reached.');
  final files = await ImagePicker().pickMultiImage(imageQuality: 85);
  final out = <PickedImage>[];
  String? warning;
  for (final f in files) {
    if (out.length >= remaining) {
      warning = 'Only $remaining more photo(s) allowed.';
      break;
    }
    final bytes = await f.readAsBytes();
    if (bytes.length > kMaxImageBytes) {
      warning = 'Each photo must be 5 MB or smaller.';
      continue;
    }
    final mime = sniffImageMime(bytes);
    if (mime == null) {
      warning = 'Only JPG and PNG photos are accepted.';
      continue;
    }
    out.add(PickedImage(
      bytes: bytes,
      name: mime == 'image/png' ? 'photo.png' : 'photo.jpg',
      mime: mime,
    ));
  }
  return PickResult(out, warning);
}

/// Picks a single JPG/PNG image (≤ 5 MB). Returns null if cancelled.
Future<PickResult> pickSingleImage() async {
  final f = await ImagePicker().pickImage(
      source: ImageSource.gallery, imageQuality: 85);
  if (f == null) return const PickResult([], null);
  final bytes = await f.readAsBytes();
  if (bytes.length > kMaxImageBytes) {
    return const PickResult([], 'Photo must be 5 MB or smaller.');
  }
  final mime = sniffImageMime(bytes);
  if (mime == null) {
    return const PickResult([], 'Only JPG and PNG photos are accepted.');
  }
  return PickResult([
    PickedImage(
        bytes: bytes,
        name: mime == 'image/png' ? 'photo.png' : 'photo.jpg',
        mime: mime)
  ], null);
}
