import 'package:flutter/foundation.dart';
import 'package:sqflite/sqflite.dart';

import '../db/app_database.dart';
import '../models/entities.dart';
import 'repository_bundle.dart';
import 'repository_interfaces.dart';

class LocalParcelRepository extends ChangeNotifier implements ParcelRepository {
  LocalParcelRepository(this._db, [this._outbox]);
  final AppDatabase _db;
  final LocalOutboxRepository? _outbox;
  List<Parcel> _parcels = const [];
  List<ParcelStatusLog> _logs = const [];
  int _outboxCount = 0;

  @override
  List<Parcel> get parcels => List.unmodifiable(_parcels);
  @override
  List<Parcel> get active => _parcels
      .where((p) => const {
            ParcelStatus.assigned,
            ParcelStatus.pickedUp,
            ParcelStatus.outForDelivery
          }.contains(p.status))
      .toList(growable: false);
  @override
  List<Parcel> get unremitted => _parcels
      .where((p) =>
          p.status == ParcelStatus.delivered &&
          !p.isPrepaid &&
          p.codCollected &&
          !p.codRemitted)
      .toList(growable: false);
  @override
  List<ParcelStatusLog> get statusLogs => List.unmodifiable(_logs);
  @override
  int get outboxCount => _outboxCount;
  @override
  Parcel get focus {
    for (final status in [
      ParcelStatus.outForDelivery,
      ParcelStatus.assigned,
      ParcelStatus.failedDelivery,
      ParcelStatus.pickedUp,
    ]) {
      for (final parcel in _parcels) {
        if (parcel.status == status) return parcel;
      }
    }
    if (_parcels.isEmpty) {
      throw StateError('No parcels are available in the local database.');
    }
    return _parcels.first;
  }

  @override
  Parcel? get assignedPickup {
    for (final parcel in _parcels) {
      if (parcel.jobType == ParcelJobType.pickup &&
          const {
            ParcelStatus.assigned,
            ParcelStatus.pickedUp,
          }.contains(parcel.status)) {
        return parcel;
      }
    }
    return null;
  }

  @override
  double earningsSince(DateTime from) => _parcels.fold<double>(
        0,
        (sum, parcel) =>
            sum +
            (parcel.pickedUpAt != null && !parcel.pickedUpAt!.isBefore(from)
                ? parcel.pickupFee
                : 0) +
            (parcel.deliveredAt != null && !parcel.deliveredAt!.isBefore(from)
                ? parcel.deliveryFee
                : 0),
      );
  @override
  int completedJobsSince(DateTime from) => _parcels.fold<int>(
        0,
        (count, parcel) =>
            count +
            (parcel.pickedUpAt != null && !parcel.pickedUpAt!.isBefore(from)
                ? 1
                : 0) +
            (parcel.deliveredAt != null && !parcel.deliveredAt!.isBefore(from)
                ? 1
                : 0),
      );

  @override
  Parcel? byTracking(String tracking) {
    for (final parcel in _parcels) {
      if (parcel.trackingNo == tracking) return parcel;
    }
    return null;
  }

  @override
  Parcel? fromArgs(Object? argument) {
    if (argument is Parcel) {
      return byTracking(argument.trackingNo);
    }
    if (argument is String) return byTracking(argument);
    return _parcels.isEmpty ? null : focus;
  }

  @override
  Map<String, List<Parcel>> groupedByArea(Iterable<Parcel> parcels) {
    final grouped = <String, List<Parcel>>{};
    for (final parcel in parcels) {
      final key = '${parcel.areaName ?? ''}|${parcel.routeCode ?? ''}';
      grouped.putIfAbsent(key, () => []).add(parcel);
    }
    return grouped;
  }

  @override
  Future<void> refresh() async {
    final rows =
        await _db.database.query('parcels', orderBy: 'updated_at DESC');
    final logs = await _db.database.query(
      'parcel_status_logs',
      orderBy: 'created_at DESC',
    );
    final outbox =
        await _db.database.rawQuery('SELECT COUNT(*) AS count FROM outbox');
    final remits = await _db.database.query(
      'cod_remittances',
      columns: ['amount'],
      where: 'status = ?',
      whereArgs: ['pending'],
    );
    _parcels = rows.map(Parcel.fromMap).toList(growable: false);
    _logs = logs.map(ParcelStatusLog.fromMap).toList(growable: false);
    _outboxCount = Sqflite.firstIntValue(outbox) ?? 0;
    _pendingRemittance = remits.fold<double>(
      0,
      (sum, row) => sum + (row['amount'] as num).toDouble(),
    );
    notifyListeners();
  }

  double _pendingRemittance = 0;

  @override
  double get pendingRemittance => _pendingRemittance;

  @override
  double get codOnHand {
    final collected = unremitted.fold<double>(0, (sum, p) => sum + p.codAmount);
    return (collected - pendingRemittance).clamp(0, double.infinity);
  }

  @override
  Future<bool> transition(
    String trackingNo,
    ParcelStatus to, {
    String? reason,
  }) async {
    var changed = false;
    await _db.database.transaction((txn) async {
      final rows = await txn.query('parcels',
          where: 'tracking_no = ?', whereArgs: [trackingNo], limit: 1);
      if (rows.isEmpty) return;
      final parcel = Parcel.fromMap(rows.single);
      var target = to;
      if (to == ParcelStatus.failedDelivery) {
        const validReasons = {'Buyer not home', 'Wrong address', 'Refused'};
        if (reason == null || !validReasons.contains(reason)) {
          throw ArgumentError.value(
              reason, 'reason', 'A valid failure reason is required.');
        }
        if (reason == 'Refused' || parcel.deliveryAttempts >= 2) {
          target = ParcelStatus.returnToSender;
        }
      }
      if (!canTransition(parcel.status, target)) return;
      final now = DateTime.now();
      final values = <String, Object?>{
        'status': target.value,
        'updated_at': now.toIso8601String(),
        'synced': 0,
      };
      if (target == ParcelStatus.assigned) {
        values['assigned_at'] = now.toIso8601String();
      } else if (target == ParcelStatus.pickedUp) {
        values['picked_up_at'] = now.toIso8601String();
        values['pickup_fee'] = 30.0;
      } else if (target == ParcelStatus.outForDelivery) {
        values['out_for_delivery_at'] = now.toIso8601String();
      } else if (to == ParcelStatus.failedDelivery) {
        values['failure_reason'] = reason;
        values['delivery_attempts'] = parcel.deliveryAttempts + 1;
      } else if (target == ParcelStatus.delivered) {
        values['delivered_at'] = now.toIso8601String();
        values['delivery_fee'] = 50.0;
      }
      await txn
          .update('parcels', values, where: 'id = ?', whereArgs: [parcel.id]);
      await txn.insert(
          'parcel_status_logs',
          ParcelStatusLog(
            parcelId: parcel.id!,
            fromStatus: parcel.status.value,
            toStatus: target.value,
            reason: reason,
            createdAt: now,
          ).toMap());
      await _db.enqueue(txn,
          entity: 'parcel',
          entityId: trackingNo,
          action: 'status_change',
          payload: {
            'from_status': parcel.status.value,
            'to_status': target.value,
            'reason': reason,
          });
      changed = true;
    });
    await refresh();
    await _outbox?.refresh();
    return changed;
  }

  @override
  Future<bool> completeDelivery(
    String trackingNo, {
    required String photoPath,
    required bool otpVerified,
    required double codCollected,
  }) async {
    final parcel = byTracking(trackingNo);
    if (parcel == null ||
        parcel.status != ParcelStatus.outForDelivery ||
        photoPath.isEmpty ||
        !otpVerified ||
        (parcel.isCod &&
            (codCollected * 100).round() != (parcel.codAmount * 100).round()) ||
        (!parcel.isCod && codCollected != 0)) {
      return false;
    }
    var changed = false;
    final now = DateTime.now();
    await _db.database.transaction((txn) async {
      final fresh = await txn.query('parcels',
          where: 'tracking_no = ?', whereArgs: [trackingNo], limit: 1);
      if (fresh.isEmpty) return;
      final current = Parcel.fromMap(fresh.single);
      if (current.status != ParcelStatus.outForDelivery ||
          photoPath.isEmpty ||
          !otpVerified ||
          (current.isCod &&
              (codCollected * 100).round() !=
                  (current.codAmount * 100).round()) ||
          (!current.isCod && codCollected != 0)) {
        return;
      }
      await txn.update(
        'parcels',
        {
          'status': ParcelStatus.delivered.value,
          'delivered_at': now.toIso8601String(),
          'delivery_fee': 50.0,
          'delivery_otp_verified': 1,
          'pod_photo_path': photoPath,
          'cod_collected': current.isCod ? 1 : 0,
          'updated_at': now.toIso8601String(),
          'synced': 0,
        },
        where: 'id = ?',
        whereArgs: [current.id],
      );
      await txn.insert(
          'parcel_status_logs',
          ParcelStatusLog(
            parcelId: current.id!,
            fromStatus: current.status.value,
            toStatus: ParcelStatus.delivered.value,
            createdAt: now,
          ).toMap());
      await _db.enqueue(txn,
          entity: 'parcel',
          entityId: trackingNo,
          action: 'delivery_proof',
          payload: {
            'photo_path': photoPath,
            'delivery_otp_verified': true,
            'cod_collected': codCollected,
          });
      changed = true;
    });
    await refresh();
    await _outbox?.refresh();
    return changed;
  }

  @override
  Future<CodRemittance> submitRemittance({
    required double amount,
    required String method,
    required String reference,
  }) async {
    final expected = codOnHand;
    if ((amount - expected).abs() >= 0.001 ||
        reference.trim().length < 3 ||
        pendingRemittance > 0) {
      throw StateError(
          'Remittance must match available COD and have a unique pending submission.');
    }
    late final CodRemittance record;
    await _db.database.transaction((txn) async {
      final now = DateTime.now();
      final id = await txn.insert('cod_remittances', {
        'amount': expected,
        'collected': amount,
        'difference': (expected - amount).abs(),
        'status': 'pending',
        'reference': reference.trim(),
        'method': method,
        'created_at': now.toIso8601String(),
      });
      record = CodRemittance(
        id: id,
        amount: expected,
        collected: amount,
        difference: (expected - amount).abs(),
        status: 'pending',
        reference: reference.trim(),
        method: method,
        createdAt: now,
      );
      await _db.enqueue(txn,
          entity: 'cod_remittance',
          entityId: '$id',
          action: 'submit',
          payload: record.toMap());
    });
    await refresh();
    await _outbox?.refresh();
    return record;
  }

  @override
  Future<CodRemittance> remitCollected({
    required String method,
    required String reference,
  }) async {
    final collected = unremitted;
    final total = collected.fold<double>(0, (sum, p) => sum + p.codAmount);
    if (total <= 0) {
      throw StateError('There is no collected COD to remit.');
    }
    if (reference.trim().length < 3) {
      throw StateError('A reference of at least 3 characters is required.');
    }
    late final CodRemittance record;
    await _db.database.transaction((txn) async {
      final now = DateTime.now();
      for (final parcel in collected) {
        await txn.update(
          'parcels',
          {'cod_remitted': 1, 'updated_at': now.toIso8601String()},
          where: 'tracking_no = ?',
          whereArgs: [parcel.trackingNo],
        );
      }
      final id = await txn.insert('cod_remittances', {
        'amount': total,
        'collected': total,
        'difference': 0.0,
        'status': 'confirmed',
        'reference': reference.trim(),
        'method': method,
        'created_at': now.toIso8601String(),
        'confirmed_at': now.toIso8601String(),
      });
      record = CodRemittance(
        id: id,
        amount: total,
        collected: total,
        difference: 0,
        status: 'confirmed',
        reference: reference.trim(),
        method: method,
        createdAt: now,
        confirmedAt: now,
      );
      await _db.enqueue(txn,
          entity: 'cod_remittance',
          entityId: '$id',
          action: 'remit',
          payload: record.toMap());
    });
    await refresh();
    await _outbox?.refresh();
    return record;
  }

  @override
  Future<String> uploadPhoto(String filePath, {String purpose = 'pod'}) async {
    // Local repo: return the file path directly (no upload in test/offline mode).
    return filePath;
  }

  @override
  Future<Map<String, dynamic>> sendDeliveryOtp(String trackingNo) async {
    // Local repo: return a static debug OTP for testing.
    return {
      'expires_at':
          DateTime.now().add(const Duration(minutes: 10)).toIso8601String(),
      'resend_after': 60,
      'debug_otp': '000000',
    };
  }

  @override
  Future<void> verifyDeliveryOtp(String trackingNo, String code) async {
    // Local repo: accept any 6-digit code for offline testing.
    if (code.length != 6) throw Exception('Code must be 6 digits.');
  }
}

class LocalRiderProfileRepository extends ChangeNotifier
    implements RiderProfileRepository {
  LocalRiderProfileRepository(this._db, [this._outbox]);
  final AppDatabase _db;
  final LocalOutboxRepository? _outbox;
  RiderProfile? _profile;
  @override
  RiderProfile? get profile => _profile;

  @override
  Future<void> refresh() async {
    final rows = await _db.database.query('rider_profile', limit: 1);
    _profile = rows.isEmpty ? null : RiderProfile.fromMap(rows.single);
    notifyListeners();
  }

  @override
  Future<void> saveProfile(RiderProfile profile) async {
    await _db.database.transaction((txn) async {
      await txn.update('rider_profile', profile.toMap(),
          where: 'id = ?', whereArgs: [profile.id]);
      await _db.enqueue(txn,
          entity: 'rider_profile',
          entityId: profile.userId,
          action: 'profile_edit',
          payload: profile.toMap());
    });
    await refresh();
    await _outbox?.refresh();
  }

  @override
  Future<void> setCheckedIn(bool checkedIn) async {
    final current = _profile;
    if (current == null || !current.isActive) {
      throw StateError(
          'An active rider profile is required to change shift status.');
    }
    final checkedInAt = checkedIn ? DateTime.now().toIso8601String() : null;
    await _db.database.transaction((txn) async {
      await txn.update('rider_profile', {'checked_in_at': checkedInAt},
          where: 'id = ?', whereArgs: [current.id]);
      await _db.enqueue(txn,
          entity: 'rider_profile',
          entityId: current.userId,
          action: checkedIn ? 'check_in' : 'check_out',
          payload: {'checked_in_at': checkedInAt});
    });
    await refresh();
    await _outbox?.refresh();
  }

  @override
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final profile = _profile;
    if (profile == null) throw StateError('No profile loaded.');
    final email = profile.email;
    if (email == null || email.isEmpty) {
      throw StateError('No email on rider profile.');
    }
    final rows = await _db.database.query(
      'rider_accounts',
      where: 'email = ?',
      whereArgs: [email.toLowerCase()],
      limit: 1,
    );
    if (rows.isEmpty) throw Exception('Account not found.');
    final stored = rows.first['password_hash'] as String;
    if (hashPassword(currentPassword) != stored) {
      throw Exception('The current password is incorrect.');
    }
    await _db.database.update(
      'rider_accounts',
      {'password_hash': hashPassword(newPassword)},
      where: 'email = ?',
      whereArgs: [email.toLowerCase()],
    );
  }
}

class LocalJobOfferRepository extends ChangeNotifier
    implements JobOfferRepository {
  LocalJobOfferRepository(this._db, this._parcels, [this._outbox]);
  final AppDatabase _db;
  final ParcelRepository _parcels;
  final LocalOutboxRepository? _outbox;
  List<JobOffer> _offers = const [];
  @override
  List<JobOffer> get offers => List.unmodifiable(_offers);

  @override
  Future<void> refresh() async {
    final rows = await _db.database.query('job_offers', orderBy: 'expires_at');
    _offers = rows.map(JobOffer.fromMap).toList(growable: false);
    notifyListeners();
  }

  @override
  Future<void> setState(int id, String state) async {
    if (!const {'pending', 'accepted', 'declined', 'expired'}.contains(state)) {
      throw ArgumentError.value(state, 'state');
    }
    await _db.database.transaction((txn) async {
      final offers = await txn.query('job_offers',
          where: 'id = ? AND state = ?', whereArgs: [id, 'pending'], limit: 1);
      if (offers.isEmpty) throw StateError('This offer is no longer pending.');
      final offer = JobOffer.fromMap(offers.single);
      if (state == 'accepted') {
        if (!offer.expiresAt.isAfter(DateTime.now())) {
          throw StateError('This offer has expired.');
        }
        final parcelRows = await txn.query('parcels',
            where: 'tracking_no = ?', whereArgs: [offer.parcelId], limit: 1);
        if (parcelRows.isEmpty) {
          throw StateError('The parcel for this offer was not found.');
        }
        final parcel = Parcel.fromMap(parcelRows.single);
        if (!canTransition(parcel.status, ParcelStatus.assigned)) {
          throw StateError('The offered parcel is no longer ready for pickup.');
        }
        final now = DateTime.now();
        await txn.update(
          'parcels',
          {
            'status': ParcelStatus.assigned.value,
            'assigned_at': now.toIso8601String(),
            'updated_at': now.toIso8601String(),
            'synced': 0,
          },
          where: 'id = ?',
          whereArgs: [parcel.id],
        );
        await txn.insert(
          'parcel_status_logs',
          ParcelStatusLog(
            parcelId: parcel.id!,
            fromStatus: parcel.status.value,
            toStatus: ParcelStatus.assigned.value,
            createdAt: now,
          ).toMap(),
        );
        await _db.enqueue(txn,
            entity: 'parcel',
            entityId: offer.parcelId,
            action: 'status_change',
            payload: {
              'from_status': parcel.status.value,
              'to_status': ParcelStatus.assigned.value,
            });
      }
      await txn.update('job_offers', {'state': state},
          where: 'id = ?', whereArgs: [id]);
      await _db.enqueue(txn,
          entity: 'job_offer',
          entityId: '$id',
          action: state,
          payload: {'state': state});
    });
    await _parcels.refresh();
    await refresh();
    await _outbox?.refresh();
  }
}

class LocalCodRemittanceRepository extends ChangeNotifier
    implements CodRemittanceRepository {
  LocalCodRemittanceRepository(this._db);
  final AppDatabase _db;
  List<CodRemittance> _items = const [];
  @override
  List<CodRemittance> get remittances => List.unmodifiable(_items);

  @override
  Future<void> refresh() async {
    final rows =
        await _db.database.query('cod_remittances', orderBy: 'created_at DESC');
    _items = rows.map(CodRemittance.fromMap).toList(growable: false);
    notifyListeners();
  }
}

class LocalNotificationRepository extends ChangeNotifier
    implements NotificationRepository {
  LocalNotificationRepository(this._db, [this._outbox]);
  final AppDatabase _db;
  final LocalOutboxRepository? _outbox;
  List<AppNotification> _items = const [];
  @override
  List<AppNotification> get notifications => List.unmodifiable(_items);

  @override
  Future<void> refresh() async {
    final rows =
        await _db.database.query('notifications', orderBy: 'created_at DESC');
    _items = rows.map(AppNotification.fromMap).toList(growable: false);
    notifyListeners();
  }

  @override
  Future<void> markAllRead() async {
    final readAt = DateTime.now().toIso8601String();
    await _db.database.transaction((txn) async {
      final changed = await txn.update(
        'notifications',
        {'read_at': readAt},
        where: 'read_at IS NULL',
      );
      if (changed > 0) {
        await _db.enqueue(
          txn,
          entity: 'notification',
          entityId: 'all',
          action: 'mark_all_read',
          payload: {'read_at': readAt},
        );
      }
    });
    await refresh();
    await _outbox?.refresh();
  }
}

class LocalConversationRepository extends ChangeNotifier
    implements ConversationRepository {
  LocalConversationRepository(this._db, [this._outbox]);
  final AppDatabase _db;
  final LocalOutboxRepository? _outbox;
  List<Conversation> _conversations = const [];
  List<Message> _messages = const [];
  @override
  List<Conversation> get conversations => List.unmodifiable(_conversations);
  @override
  List<Message> messagesFor(int conversationId) => _messages
      .where((message) => message.conversationId == conversationId)
      .toList(growable: false);

  @override
  Future<void> refresh() async {
    final conversations = await _db.database
        .query('conversations', orderBy: 'last_message_at DESC');
    final messages =
        await _db.database.query('messages', orderBy: 'created_at');
    _conversations =
        conversations.map(Conversation.fromMap).toList(growable: false);
    _messages = messages.map(Message.fromMap).toList(growable: false);
    notifyListeners();
  }

  @override
  Future<void> send(int conversationId, String body) async {
    final text = body.trim();
    if (text.isEmpty) return;
    await _db.database.transaction((txn) async {
      final now = DateTime.now();
      final id = await txn.insert('messages', {
        'conversation_id': conversationId,
        'sender': 'rider',
        'body': text,
        'created_at': now.toIso8601String(),
      });
      await txn.update(
          'conversations', {'last_message_at': now.toIso8601String()},
          where: 'id = ?', whereArgs: [conversationId]);
      await _db.enqueue(txn,
          entity: 'message',
          entityId: '$id',
          action: 'send',
          payload: {'conversation_id': conversationId, 'body': text});
    });
    await refresh();
    await _outbox?.refresh();
  }
}

class LocalEmergencyContactRepository extends ChangeNotifier
    implements EmergencyContactRepository {
  LocalEmergencyContactRepository(this._db, [this._outbox]);
  final AppDatabase _db;
  final LocalOutboxRepository? _outbox;
  List<EmergencyContact> _contacts = const [];
  @override
  List<EmergencyContact> get contacts => List.unmodifiable(_contacts);

  @override
  Future<void> refresh() async {
    final rows = await _db.database.query('emergency_contacts', orderBy: 'id');
    _contacts = rows.map(EmergencyContact.fromMap).toList(growable: false);
    notifyListeners();
  }

  @override
  Future<void> saveContact(EmergencyContact contact) async {
    await _db.database.transaction((txn) async {
      final count = Sqflite.firstIntValue(
              await txn.rawQuery('SELECT COUNT(*) FROM emergency_contacts')) ??
          0;
      if (contact.id == null && count >= 2) {
        throw StateError('At most two emergency contacts are allowed.');
      }
      final id = contact.id == null
          ? await txn.insert('emergency_contacts', contact.toMap())
          : contact.id!;
      if (contact.id != null) {
        await txn.update('emergency_contacts', contact.toMap(),
            where: 'id = ?', whereArgs: [contact.id]);
      }
      await _db.enqueue(txn,
          entity: 'emergency_contact',
          entityId: '$id',
          action: contact.id == null ? 'create' : 'update',
          payload: contact.toMap());
    });
    await refresh();
    await _outbox?.refresh();
  }

  @override
  Future<void> delete(int id) async {
    await _db.database.transaction((txn) async {
      await txn.delete('emergency_contacts', where: 'id = ?', whereArgs: [id]);
      await _db.enqueue(txn,
          entity: 'emergency_contact',
          entityId: '$id',
          action: 'delete',
          payload: {'id': id});
    });
    await refresh();
    await _outbox?.refresh();
  }
}

class LocalOutboxRepository extends ChangeNotifier implements OutboxRepository {
  LocalOutboxRepository(this._db);
  final AppDatabase _db;
  List<OutboxEntry> _entries = const [];
  @override
  int get count => _entries.length;
  @override
  List<OutboxEntry> get entries => List.unmodifiable(_entries);

  @override
  Future<void> refresh() async {
    final rows = await _db.database.query('outbox', orderBy: 'created_at');
    _entries = rows.map(OutboxEntry.fromMap).toList(growable: false);
    notifyListeners();
  }
}

class AppRepositories implements RepositoryBundle {
  AppRepositories._(this.database) : outbox = LocalOutboxRepository(database) {
    parcels = LocalParcelRepository(database, outbox);
    riderProfile = LocalRiderProfileRepository(database, outbox);
    offers = LocalJobOfferRepository(database, parcels, outbox);
    remittances = LocalCodRemittanceRepository(database);
    notifications = LocalNotificationRepository(database, outbox);
    conversations = LocalConversationRepository(database, outbox);
    emergencyContacts = LocalEmergencyContactRepository(database, outbox);
  }

  final AppDatabase database;
  @override
  late final LocalParcelRepository parcels;
  @override
  late final LocalRiderProfileRepository riderProfile;
  @override
  late final LocalJobOfferRepository offers;
  @override
  late final LocalCodRemittanceRepository remittances;
  @override
  late final LocalNotificationRepository notifications;
  @override
  late final LocalConversationRepository conversations;
  @override
  late final LocalEmergencyContactRepository emergencyContacts;
  @override
  final LocalOutboxRepository outbox;

  static Future<AppRepositories> open({AppDatabase? database}) async {
    final db = database ?? AppDatabase();
    await db.open();
    final repositories = AppRepositories._(db);
    await Future.wait([
      repositories.parcels.refresh(),
      repositories.riderProfile.refresh(),
      repositories.offers.refresh(),
      repositories.remittances.refresh(),
      repositories.notifications.refresh(),
      repositories.conversations.refresh(),
      repositories.emergencyContacts.refresh(),
      repositories.outbox.refresh(),
    ]);
    return repositories;
  }

  @override
  Future<void> signIn(String email, String password) async {
    final rows = await database.database.query(
      'rider_accounts',
      where: 'email = ?',
      whereArgs: [email.trim().toLowerCase()],
      limit: 1,
    );
    if (rows.isEmpty) {
      throw Exception('No account found for that email.');
    }
    final stored = rows.first['password_hash'] as String;
    final given = hashPassword(password);
    if (given != stored) {
      throw Exception('Email or password is incorrect.');
    }
    // Refresh all repositories after a successful sign-in.
    await Future.wait([
      parcels.refresh(),
      riderProfile.refresh(),
      offers.refresh(),
      remittances.refresh(),
      notifications.refresh(),
      conversations.refresh(),
      emergencyContacts.refresh(),
      outbox.refresh(),
    ]);
  }

  @override
  Future<void> signOut() async {}

  @override
  Future<void> resetLocalData() async {
    await database.resetLocalData();
    await Future.wait([
      parcels.refresh(),
      riderProfile.refresh(),
      offers.refresh(),
      remittances.refresh(),
      notifications.refresh(),
      conversations.refresh(),
      emergencyContacts.refresh(),
      outbox.refresh(),
    ]);
  }

  @override
  Future<void> close() async => database.close();

  /// Save a support report to local storage.
  Future<void> saveIssueReport({
    required String category,
    required String description,
    String? screenshotPath,
  }) async {
    await database.database.insert('issue_reports', {
      'category': category,
      'description': description,
      'screenshot_path': screenshotPath,
      'created_at': DateTime.now().toIso8601String(),
    });
  }
}
