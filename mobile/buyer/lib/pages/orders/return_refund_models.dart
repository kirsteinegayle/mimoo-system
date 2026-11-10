/// Shared data models for the Return / Refund flow.
library;

import 'package:flutter/foundation.dart';

// ── Order summary passed into the flow ───────────────────────────────────────
class ReturnOrderSummary {
  const ReturnOrderSummary({
    required this.orderId,
    required this.storeName,
    required this.productName,
    required this.productSub,
    required this.imageUrl,
    required this.price,
    required this.qty,
    required this.paymentMethod,
    this.contactEmail = '',
    this.onSubmitted,
  });

  final String orderId;
  final String storeName;
  final String productName;
  final String productSub;
  final String imageUrl;
  final double price;
  final int qty;
  final String paymentMethod;
  final String contactEmail;

  /// Called after the return/refund request is submitted so the order list
  /// can update its state immediately.
  final VoidCallback? onSubmitted;
}

// ── Issue categories shown on WhatHappenedScreen ─────────────────────────────
enum ReturnCategory {
  damaged,
  incorrect,
  notReceived,
}

extension ReturnCategoryX on ReturnCategory {
  String get label {
    switch (this) {
      case ReturnCategory.damaged:
        return 'Damaged / Defective';
      case ReturnCategory.incorrect:
        return 'Incorrect Item';
      case ReturnCategory.notReceived:
        return 'Item Not Received';
    }
  }

  String get description {
    switch (this) {
      case ReturnCategory.damaged:
        return 'Item arrived broken, scratched or not working';
      case ReturnCategory.incorrect:
        return 'Wrong item, size, color, or model was sent';
      case ReturnCategory.notReceived:
        return 'Parcel was marked delivered but I did not receive it';
    }
  }

  String get icon {
    switch (this) {
      case ReturnCategory.damaged:
        return '📦';
      case ReturnCategory.incorrect:
        return '🔄';
      case ReturnCategory.notReceived:
        return '🚫';
    }
  }
}

// ── Sub-reasons per category ──────────────────────────────────────────────────
const Map<ReturnCategory, List<ReturnSubReason>> kSubReasons = {
  ReturnCategory.damaged: [
    ReturnSubReason(
      label: 'Item is physically damaged / broken',
      solution: 'Return and Refund',
    ),
    ReturnSubReason(
      label: 'Item does not work / defective',
      solution: 'Return and Refund',
    ),
    ReturnSubReason(
      label: 'Packaging is damaged but item is okay',
      solution: 'Refund Only',
    ),
    ReturnSubReason(
      label: 'Missing parts or accessories',
      solution: 'Return and Refund',
    ),
  ],
  ReturnCategory.incorrect: [
    ReturnSubReason(
      label: 'Seller sent wrong item (e.g wrong size, model)',
      solution: 'Return and Refund',
    ),
    ReturnSubReason(
      label: 'Wrong color / variant received',
      solution: 'Return and Refund',
    ),
    ReturnSubReason(
      label: 'Counterfeit or not as described',
      solution: 'Return and Refund',
    ),
    ReturnSubReason(
      label: 'Item quantity is incorrect',
      solution: 'Refund Only',
    ),
  ],
  ReturnCategory.notReceived: [
    ReturnSubReason(
      label: 'Parcel marked delivered but not received',
      solution: 'Refund Only',
    ),
    ReturnSubReason(
      label: 'Partial delivery — some items missing',
      solution: 'Refund Only',
    ),
    ReturnSubReason(
      label: 'Delivered to wrong address',
      solution: 'Return and Refund',
    ),
  ],
};

class ReturnSubReason {
  const ReturnSubReason({required this.label, required this.solution});
  final String label;

  /// e.g. "Return and Refund" or "Refund Only"
  final String solution;
}

// ── In-memory store for submitted return/refund requests ──────────────────────
class ReturnRefundStore {
  ReturnRefundStore._();

  static final List<ReturnRequest> _requests = [];

  static void submit(ReturnRequest req) => _requests.add(req);

  static List<ReturnRequest> get all => List.unmodifiable(_requests);

  static ReturnRequest? forOrder(String orderId) {
    try {
      return _requests.lastWhere((r) => r.orderId == orderId);
    } catch (_) {
      return null;
    }
  }
}

class ReturnRequest {
  ReturnRequest({
    required this.orderId,
    required this.category,
    required this.subReason,
    required this.description,
    required this.photoCount,
    this.status = 'Pending Review',
    DateTime? submittedAt,
  }) : submittedAt = submittedAt ?? DateTime.now();

  final String orderId;
  final ReturnCategory category;
  final ReturnSubReason subReason;
  final String description;
  final int photoCount;
  final String status;
  final DateTime submittedAt;
}
