import 'package:flutter/material.dart';

import '../state/notification_state.dart';
import '../theme/app_theme.dart';

/// Unread-count badge for the notification bell. Must be placed directly
/// inside a [Stack] (it builds a [Positioned]). Hidden when there are no
/// unread notifications.
class NotificationBadge extends StatelessWidget {
  const NotificationBadge({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: NotificationState.instance,
      builder: (context, _) {
        final n = NotificationState.instance.unreadCount;
        if (n <= 0) return const Positioned(right: 0, top: 0, child: SizedBox.shrink());
        return Positioned(
          right: 0,
          top: 0,
          child: Container(
            constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
            padding: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              color: AppColors.flash,
              borderRadius: BorderRadius.circular(9999),
              border: Border.all(color: Colors.white, width: 1.2),
            ),
            alignment: Alignment.center,
            child: Text(n > 99 ? '99+' : '$n',
                style: const TextStyle(
                    color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
          ),
        );
      },
    );
  }
}
