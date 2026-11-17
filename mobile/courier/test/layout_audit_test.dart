import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mimoo_courier/pages/account/account_tab.dart';
import 'package:mimoo_courier/pages/account/change_password_page.dart';
import 'package:mimoo_courier/pages/account/company_settings_page.dart';
import 'package:mimoo_courier/pages/auth/login_page.dart';
import 'package:mimoo_courier/pages/branch_assign/branch_assign_page.dart';
import 'package:mimoo_courier/pages/dashboard/recent_activity_page.dart';
import 'package:mimoo_courier/pages/messages/messages_page.dart';
import 'package:mimoo_courier/pages/notifications/notifications_page.dart';
import 'package:mimoo_courier/pages/cod/cod_remittance_page.dart';
import 'package:mimoo_courier/pages/dashboard/dashboard_tab.dart';
import 'package:mimoo_courier/pages/delivery/delivery_management_page.dart';
import 'package:mimoo_courier/pages/facilities/facilities_page.dart';
import 'package:mimoo_courier/pages/riders/rider_management_page.dart';
import 'package:mimoo_courier/pages/shipments/shipments_tab.dart';
import 'package:mimoo_courier/pages/shipments/waybill_page.dart';
import 'package:mimoo_courier/pages/support/support_page.dart';
import 'package:mimoo_courier/pages/transfers/transfers_page.dart';
import 'package:mimoo_courier/services/api_service.dart';
import 'package:mimoo_courier/theme/mimoo_theme.dart';

/// Layout audit: every courier screen is pumped with POPULATED data (long names, long addresses,
/// big amounts) on small phones (320 / 360 dp wide) and at 1.0x / 1.5x / 2.0x font scale. Any
/// RenderFlex / overflow exception fails the test, so a regression shows up here, not on a device.

const _long = 'Unit 12B Bldg. Santa Catalina Residences, Barangay San Antonio, City of Santa Rosa, Laguna 4026';

http.Response _json(Object body) => http.Response(jsonEncode(body), 200, headers: {'content-type': 'application/json'});

http.Response _api(http.Request req) {
  final p = req.url.path;
  if (p.endsWith('/dashboard')) {
    return _json({'data': {'incoming_shipments': 4, 'pending_pickups': 2, 'scheduled_today': 1, 'picked_up_today': 3, 'failed': 1, 'expiring_soon': 1, 'new_pickups_unassigned': 2, 'deliveries_waiting': 5, 'online_riders': 3}});
  }
  if (p.endsWith('/courier-app/shipments')) {
    return _json({
      'data': [
        for (var i = 1; i <= 3; i++)
          {'id': i, 'waybill_number': 'MIMOO-WAYBILL-2026-000$i', 'order_number': 'MIM-0000000$i', 'seller_name': 'The Very Long Seller Business Name Trading Co. $i', 'destination': _long, 'assignment_status': i == 1 ? 'pending' : 'accepted', 'pickup_status': 'pending_pickup', 'assigned_at': 'Nov 17, 2026 10:30 AM', 'is_overdue': i == 1, 'is_expiring_soon': false},
      ],
      'meta': {'current_page': 1, 'last_page': 1, 'total': 3},
    });
  }
  if (p.endsWith('/delivery-orders')) {
    return _json({
      'data': [
        for (var i = 1; i <= 3; i++)
          {'id': i, 'order_number': 'MIM-0000000$i', 'waybill_number': 'MIMOO-WAYBILL-2026-000$i', 'status': 'in_transit', 'shipping_name': 'Maria Clara de la Cruz-Santos', 'shipping_address': _long, 'payment_method': 'cod', 'cod_amount': 12345.5, 'picked_up': true, 'assignable': i != 2, 'pickup_status': 'picked_up', 'job': i == 2 ? {'status': 'assigned', 'rider_name': 'Juan Dela Cruz'} : null},
      ],
    });
  }
  if (p.endsWith('/delivery-riders')) {
    return _json({'data': [{'personnel_id': 1, 'name': 'Juan Dela Cruz Jr. the Third', 'contact_number': '09171234567', 'vehicle_type': 'Motorcycle', 'plate_number': 'ABC 1234', 'active_jobs': 2}]});
  }
  if (p.endsWith('/courier-app/riders')) {
    return _json({
      'data': [
        {'personnel_id': 1, 'name': 'Juan Dela Cruz Jr. the Third of Santa Rosa', 'status': 'active', 'approved': true, 'is_online': true, 'active_delivery_jobs': 3, 'contact_number': '09171234567', 'vehicle_type': 'Motorcycle', 'plate_number': 'ABC 1234'},
      ],
      'meta': {'online': 1},
    });
  }
  if (p.endsWith('/cod-remittances')) {
    return _json({
      'data': [
        {'id': 1, 'reference': 'RMT-2026-000001-LONGREF', 'rider_name': 'Juan Dela Cruz Jr. the Third', 'amount': 123456.78, 'parcels_count': 12, 'status': 'submitted', 'remitted_at': '2026-11-17T10:00:00Z', 'confirmed_at': null, 'notes': null},
        {'id': 2, 'reference': 'RMT-2026-000002', 'rider_name': 'Ana', 'amount': 500, 'parcels_count': 1, 'status': 'confirmed', 'remitted_at': '2026-11-16T10:00:00Z', 'confirmed_at': '2026-11-16T11:00:00Z', 'notes': null},
      ],
      'meta': {'awaiting_amount': 123456.78, 'awaiting_count': 1},
    });
  }
  if (p.endsWith('/transfers-data')) {
    return _json({
      'facilities': [
        {'id': 1, 'facility_name': 'Santa Rosa Main Distribution Hub and Sorting Center', 'facility_type': 'Main Hub', 'status': 'Active', 'city': 'Santa Rosa'},
        {'id': 2, 'facility_name': 'Biñan Branch', 'facility_type': 'Branch', 'status': 'Active', 'city': 'Biñan'},
      ],
      'parcels': [
        {'order_id': 1, 'waybill': 'MIMOO-WAYBILL-2026-0001', 'facility_id': 1, 'destination': 'City of Santa Rosa, Laguna', 'status': 'Parcel scanned at Santa Rosa Main Distribution Hub', 'since': null},
      ],
      'recent': [
        {'waybill': 'MIMOO-WAYBILL-2026-0009', 'to': 'Santa Rosa Main Distribution Hub and Sorting Center', 'by': 'Kirsteine', 'notes': 'Transferred from Biñan Branch', 'at': null},
      ],
    });
  }
  if (p.endsWith('/facilities')) {
    return _json({
      'data': [
        {'id': 1, 'facility_name': 'Santa Rosa Main Distribution Hub and Sorting Center', 'facility_code': 'HUB-001', 'facility_type': 'Main Hub', 'parent_facility': null, 'parent_facility_id': null, 'status': 'Active', 'region': 'IV-A', 'province': 'Laguna', 'city': 'Santa Rosa', 'address': _long, 'manager': 'Maria Clara de la Cruz-Santos', 'contact': '09171234567', 'coverage_cities': ['Santa Rosa', 'Biñan']},
      ],
    });
  }
  if (p.endsWith('/company-settings')) {
    return _json({'data': {'company_name': 'The Very Long Courier Company Philippines Incorporated', 'trade_name': 'FastLane Express', 'business_email': 'operations.department@fastlane-express-courier.example.com', 'company_contact_number': '09171234567', 'company_website': null, 'business_address': _long, 'service_areas': ['Habay', 'San Antonio'], 'cities_served': ['Bacoor'], 'provinces_served': ['Cavite'], 'pickup_available': 'yes', 'estimated_delivery_time': '2-3 days', 'status': 'approved', 'sec_registration_no': 'CS2026-123456'}});
  }
  if (p.endsWith('/staff-support/feed')) {
    return _json({
      'data': [
        {'id': 7, 'user_name': 'Maria Clara de la Cruz-Santos', 'user_role': 'buyer', 'category_label': 'Logistics issue (delivery, rider, parcel)', 'order_number': 'MIM-00000012', 'subject': 'The rider never arrived and the parcel is marked delivered already', 'message': 'long message here', 'status': 'open', 'updated_at': null},
      ],
      'counts': {'open': 1, 'in_progress': 0, 'resolved': 0, 'closed': 0},
    });
  }
  if (p.endsWith('/notifications')) {
    return _json({
      'data': [
        {'id': 1, 'category': 'shipment', 'type': 'shipment_assigned', 'title': 'A new shipment was assigned to your company and is waiting for your decision', 'body': 'Order MIM-00000012 from The Very Long Seller Business Name Trading Co. needs a response before the deadline.', 'is_read': false, 'created_at': '2026-11-17T10:00:00Z', 'time_ago': '5 minutes ago'},
      ],
      'meta': {'current_page': 1, 'last_page': 1, 'total': 1},
    });
  }
  if (p.endsWith('/shipments/1')) {
    return _json({
      'data': {'id': 1, 'waybill_number': 'MIMOO-WAYBILL-2026-0001', 'order_number': 'MIM-00000001', 'assignment_status': 'pending', 'pickup_status': 'pending_pickup', 'assigned_at': 'Nov 17, 2026 10:30 AM', 'acceptance_deadline': 'Nov 18, 2026 10:30 AM', 'total_amount': 12345.5, 'payment_method': 'cod', 'items_count': 3, 'shipping_address': _long, 'history': [], 'is_overdue': true, 'seller': {'name': 'The Very Long Seller Business Name Trading Co.', 'address': _long}},
    });
  }
  if (p.endsWith('/support/tickets')) {
    return _json({'data': [], 'meta': {'categories': {'technical': 'Technical problem', 'other': 'Other'}}});
  }
  return _json({'data': <Object>[]});
}

const _sizes = [Size(320, 640), Size(360, 740)];
const _scales = [1.0, 1.5, 2.0];

Future<void> _audit(WidgetTester tester, String name, Widget Function() page) async {
  for (final size in _sizes) {
    for (final scale in _scales) {
      tester.view.physicalSize = size;
      tester.view.devicePixelRatio = 1.0;
      await tester.pumpWidget(MaterialApp(
        theme: mimooTheme(),
        builder: (c, child) => MediaQuery(data: MediaQuery.of(c).copyWith(textScaler: TextScaler.linear(scale)), child: child!),
        home: Scaffold(body: page()),
      ));
      for (var i = 0; i < 6; i++) {
        await tester.pump(const Duration(milliseconds: 150));
      }
      final ex = tester.takeException();
      expect(ex, isNull, reason: '$name overflowed/crashed at ${size.width.toInt()}dp, ${scale}x font: $ex');
    }
  }
  addTearDown(tester.view.reset);
}

void main() {
  setUp(() => ApiService.httpClient = MockClient((r) async => _api(r)));

  final pages = <String, Widget Function()>{
    'Dashboard': () => DashboardTab(onOpenTab: (_) {}, onOpenPage: (_) {}),
    'Shipments': () => const ShipmentsTab(),
    'Delivery Management': () => const DeliveryManagementPage(),
    'Rider Management': () => const RiderManagementPage(),
    'COD & Remittance': () => const CodRemittancePage(),
    'Sorting & Transfers': () => const TransfersPage(),
    'Branches & Facilities': () => const FacilitiesPage(),
    'Company Settings': () => const CompanySettingsPage(),
    'Support': () => const SupportPage(),
    'Login': () => const LoginPage(),
    'Change password': () => const ChangePasswordPage(),
    'Notifications': () => const NotificationsPage(),
    'Messages': () => const MessagesPage(),
    'Branch Assign': () => const BranchAssignPage(),
    'Recent activity': () => const RecentActivityPage(),
    'Account': () => const AccountTab(),
    'Shipment detail': () => const ShipmentDetailPage(id: 1),
    'Waybill': () => const WaybillPage(
          waybillNumber: 'MIMOO-WAYBILL-2026-000123456789',
          orderNumber: 'MIM-00000123',
          sellerName: 'The Very Long Seller Business Name Trading Co.',
          destination: _long,
          weight: '12.5 kg',
          paymentMethod: 'cod',
          totalAmount: '₱12,345.50',
        ),
  };

  pages.forEach((name, build) {
    testWidgets('no overflow: $name (320/360dp, 1x-2x font)', (tester) async {
      await _audit(tester, name, build);
    });
  });
}
