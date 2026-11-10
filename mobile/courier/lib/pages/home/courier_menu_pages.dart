import 'package:flutter/material.dart';
import '../messages/messages_page.dart';
import '../../theme/mimoo_theme.dart';
import '../../widgets/courier_shared.dart';

class CourierMenuPage extends StatelessWidget {
  const CourierMenuPage({
    super.key,
    required this.title,
    required this.icon,
    required this.message,
  });

  final String title;
  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title: Text(title, style: pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: CourierEmptyState(icon: icon, message: message),
    );
  }
}

class HelpCenterPage extends StatelessWidget {
  const HelpCenterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kSurface,
      appBar: AppBar(
        backgroundColor: kCard,
        title:
            Text('Help Center', style: pjs(size: 17, weight: FontWeight.w800)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const CourierInfoCard(
            title: 'Courier app help',
            description:
                'Quick guidance for common delivery and account tasks.',
            children: [
              _HelpItem(
                title: 'A shipment is missing',
                body:
                    'Check the shipment status filter and refresh the Shipments page. Only assignments for your courier account appear there.',
              ),
              _HelpItem(
                title: 'A pickup could not be completed',
                body:
                    'Open Pickup Management, select the pickup, and record the reason so the attempt is documented.',
              ),
              _HelpItem(
                title: 'Account or document issue',
                body:
                    'Review your account and uploaded documents. Contact your logistics administrator if you need an account change.',
              ),
              _HelpItem(
                title: 'COD or remittance question',
                body:
                    'Coordinate with your logistics administrator for COD collection and remittance instructions.',
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const MessagesPage()),
              ),
              icon: const Icon(Icons.chat_bubble_outline),
              label: Text(
                'Open Messages',
                style: pjs(size: 13, weight: FontWeight.w700),
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: kPrimary,
                side: const BorderSide(color: kBorder),
                padding: const EdgeInsets.symmetric(vertical: 13),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HelpItem extends StatelessWidget {
  const _HelpItem({required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      tilePadding: EdgeInsets.zero,
      childrenPadding: const EdgeInsets.only(bottom: 12),
      title: Text(title, style: pjs(size: 12, weight: FontWeight.w700)),
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child:
              Text(body, style: pjs(size: 12, color: kSubtext, height: 1.45)),
        ),
      ],
    );
  }
}
