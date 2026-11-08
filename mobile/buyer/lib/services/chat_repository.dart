import 'api_service.dart';
import 'review_repository.dart' show PickedImage;

class ChatProductCard {
  const ChatProductCard({
    required this.id,
    required this.name,
    required this.price,
    this.imageUrl,
  });
  final int id;
  final String name;
  final double price;
  final String? imageUrl;

  static ChatProductCard? fromJson(dynamic j) {
    if (j is! Map) return null;
    return ChatProductCard(
      id: (j['id'] as num).toInt(),
      name: j['name'] as String? ?? '',
      price: (j['effective_price'] as num?)?.toDouble() ?? 0,
      imageUrl: j['image_url'] as String?,
    );
  }
}

class ChatMessageItem {
  const ChatMessageItem({
    required this.id,
    required this.isMine,
    this.body,
    this.imageUrl,
    this.readAt,
    this.createdAt,
  });

  final int id;
  final bool isMine;
  final String? body;
  final String? imageUrl;
  final DateTime? readAt;
  final DateTime? createdAt;

  factory ChatMessageItem.fromJson(Map<String, dynamic> j) => ChatMessageItem(
        id: (j['id'] as num).toInt(),
        isMine: j['is_mine'] == true,
        body: j['body'] as String?,
        imageUrl: j['image_url'] as String?,
        readAt: DateTime.tryParse(j['read_at'] as String? ?? ''),
        createdAt: DateTime.tryParse(j['created_at'] as String? ?? ''),
      );
}

class ChatThreadItem {
  const ChatThreadItem({
    required this.id,
    required this.sellerId,
    required this.sellerName,
    this.sellerPhotoUrl,
    this.product,
    this.lastMessage,
    this.lastMessageAt,
    required this.unreadCount,
  });

  final int id;
  final int sellerId;
  final String sellerName;
  final String? sellerPhotoUrl;
  final ChatProductCard? product;
  final ChatMessageItem? lastMessage;
  final DateTime? lastMessageAt;
  final int unreadCount;

  factory ChatThreadItem.fromJson(Map<String, dynamic> j) => ChatThreadItem(
        id: (j['id'] as num).toInt(),
        sellerId: (j['seller_id'] as num).toInt(),
        sellerName: j['seller_name'] as String? ?? 'Seller',
        sellerPhotoUrl: j['seller_photo_url'] as String?,
        product: ChatProductCard.fromJson(j['product']),
        lastMessage: j['last_message'] is Map
            ? ChatMessageItem.fromJson(Map<String, dynamic>.from(j['last_message'] as Map))
            : null,
        lastMessageAt: DateTime.tryParse(j['last_message_at'] as String? ?? ''),
        unreadCount: (j['unread_count'] as num?)?.toInt() ?? 0,
      );
}

class ChatMessagesResult {
  const ChatMessagesResult({required this.messages, this.product, required this.sellerName});
  final List<ChatMessageItem> messages;
  final ChatProductCard? product;
  final String sellerName;
}

class ChatRepository {
  ChatRepository._();
  static final ChatRepository instance = ChatRepository._();

  Future<ChatThreadItem> start({required int sellerId, int? productId}) async {
    final res = await ApiService.post('/buyer/chat/start', body: {
      'seller_id': sellerId,
      if (productId != null) 'product_id': productId,
    }) as Map<String, dynamic>;
    return ChatThreadItem.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<List<ChatThreadItem>> threads() async {
    final res = await ApiService.get('/buyer/chat') as Map<String, dynamic>;
    return (res['data'] as List<dynamic>? ?? [])
        .map((e) => ChatThreadItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<ChatMessagesResult> messages(int threadId, {int afterId = 0}) async {
    final res = await ApiService.get('/buyer/chat/$threadId/messages',
        queryParameters: afterId > 0 ? {'after_id': '$afterId'} : null)
        as Map<String, dynamic>;
    final t = res['thread'] as Map<String, dynamic>? ?? {};
    return ChatMessagesResult(
      messages: (res['data'] as List<dynamic>? ?? [])
          .map((e) => ChatMessageItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      product: ChatProductCard.fromJson(t['product']),
      sellerName: t['seller_name'] as String? ?? 'Seller',
    );
  }

  Future<ChatMessageItem> sendText(int threadId, String body) async {
    final res = await ApiService.post('/buyer/chat/$threadId/messages',
        body: {'body': body}) as Map<String, dynamic>;
    return ChatMessageItem.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<ChatMessageItem> sendImage(int threadId, PickedImage img) async {
    final res = await ApiService.postMultipartFields(
      '/buyer/chat/$threadId/messages',
      files: [
        MultipartUpload(
            field: 'image', bytes: img.bytes, filename: img.name, contentType: img.mime)
      ],
    ) as Map<String, dynamic>;
    return ChatMessageItem.fromJson(res['data'] as Map<String, dynamic>);
  }
}
