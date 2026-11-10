import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../utils/animations.dart';

/// Empty state: soft icon disc, title, short message, optional action.
/// Fades/slides in once.
class EmptyStateView extends StatelessWidget {
  const EmptyStateView({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String title;
  final String? message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return StaggeredItem(
      index: 0,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxxl, vertical: AppSpacing.xxxl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 84,
              height: 84,
              decoration: const BoxDecoration(color: AppColors.chip, shape: BoxShape.circle),
              child: Icon(icon, size: 38, color: AppColors.accent),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(title, textAlign: TextAlign.center, style: AppText.title),
            if (message != null) ...[
              const SizedBox(height: AppSpacing.xs + 2),
              Text(message!,
                  textAlign: TextAlign.center,
                  style: AppText.style(size: 13, color: AppColors.textMuted, height: 1.45)),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: AppSpacing.lg),
              FilledButton(onPressed: onAction, child: Text(actionLabel!)),
            ],
          ],
        ),
      ),
    );
  }
}

/// Error state with a Retry button.
class ErrorStateView extends StatelessWidget {
  const ErrorStateView({
    super.key,
    required this.message,
    required this.onRetry,
    this.title = 'Something went wrong',
  });

  final String title;
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return StaggeredItem(
      index: 0,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxxl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 84,
              height: 84,
              decoration: const BoxDecoration(color: AppColors.errorContainer, shape: BoxShape.circle),
              child: const Icon(Icons.cloud_off_outlined, size: 36, color: AppColors.error),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(title, textAlign: TextAlign.center, style: AppText.title),
            const SizedBox(height: AppSpacing.xs + 2),
            Text(message,
                textAlign: TextAlign.center,
                style: AppText.style(size: 13, color: AppColors.textMuted, height: 1.45)),
            const SizedBox(height: AppSpacing.lg),
            OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Try again'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Shimmering list-row skeleton (avatar + two lines), for list loading.
class SkeletonList extends StatelessWidget {
  const SkeletonList({super.key, this.count = 6});
  final int count;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      physics: const NeverScrollableScrollPhysics(),
      itemCount: count,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (_, __) => Container(
        color: AppColors.card,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        child: const Row(
          children: [
            ShimmerBox(width: 44, height: 44, radius: 22),
            SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ShimmerBox(width: 140, height: 12),
                  SizedBox(height: 8),
                  ShimmerBox(width: double.infinity, height: 10),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
