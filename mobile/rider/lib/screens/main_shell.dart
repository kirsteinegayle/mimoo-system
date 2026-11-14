import 'dart:async';

import 'package:flutter/material.dart';
import '../core/api_config.dart';
import '../core/rider_status_controller.dart';
import '../data/api/team_messages_service.dart';
import '../mock/rider_mock.dart';
import '../widgets/motion.dart';
import '../widgets/shell.dart';
import 'redesign/home_screen.dart';
import 'redesign/inbox_screen.dart';
import 'redesign/job_actions.dart';
import 'redesign/job_router.dart';
import 'redesign/jobs_screen.dart';
import 'redesign/profile_tab.dart';
import 'redesign/wallet_screen.dart';

/// Bottom nav: Home | Jobs | Scan (centre action) | Wallet | Profile.
/// History lives in Jobs → "Done". The drawer is no longer used.
class MainShell extends StatefulWidget {
  const MainShell({super.key});
  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> with WidgetsBindingObserver {
  int _i = 0;
  RiderStatusController? _status;
  bool _refreshedLocation = false;

  String? _shownLoadError;
  Timer? _unreadTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // Real unread messages for the header badge (every 30 s while the shell is open).
    if (!useMock) {
      unawaited(TeamMessagesService.instance.refreshUnread());
      _unreadTimer = Timer.periodic(const Duration(seconds: 30), (_) => TeamMessagesService.instance.refreshUnread());
    }
    // API mode: load jobs / wallet / notifications once the shell opens.
    RiderMock.instance.addListener(_onStoreChanged);
    if (!useMock) unawaited(RiderMock.instance.refresh());
  }

  /// Shows a load error once (e.g. server down) as a SnackBar.
  void _onStoreChanged() {
    final error = RiderMock.instance.loadError;
    if (error == null) {
      _shownLoadError = null;
      return;
    }
    if (error == _shownLoadError || !mounted) return;
    _shownLoadError = error;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(
        content: Text(error),
        action: SnackBarAction(
            label: 'Retry', onPressed: () => RiderMock.instance.refresh()),
      ));
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _status = RiderStatusScope.of(context);
    if (_refreshedLocation) return;
    _refreshedLocation = true;
    unawaited(_status!.refreshLocation());
  }

  @override
  void dispose() {
    _unreadTimer?.cancel();
    RiderMock.instance.removeListener(_onStoreChanged);
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final status = _status;
    if (state == AppLifecycleState.resumed && status != null) {
      unawaited(status.syncLocationOnResume());
    }
  }

  void _go(int tab) => setState(() => _i = tab);

  Widget _tab(int i) => switch (i) {
        0 => HomeScreen(
            onOpenJob: openJobDetail,
            onOpenJobs: () => _go(1),
            onOpenWallet: () => _go(2),
          ),
        1 => JobsScreen(
            onOpen: openJobDetail,
            onAction: (context, job) =>
                runJobAction(context, job, openJobDetail),
          ),
        2 => const WalletScreen(),
        _ => const ProfileTab(),
      };

  @override
  Widget build(BuildContext context) {
    final mock = RiderMock.instance;
    return ListenableBuilder(
      listenable: Listenable.merge([mock, TeamMessagesService.unread]),
      builder: (context, _) => Scaffold(
        appBar: MimooAppBar(
          unreadMessages: useMock ? mock.unreadMessages : TeamMessagesService.unread.value,
          unreadNotifications: mock.unreadNotifications,
          onMessages: () => openMessages(context),
          onNotifications: () => Navigator.of(context).push(
              MaterialPageRoute<void>(
                  builder: (_) => InboxScreen(onOpenJob: openJobDetail))),
        ),
        // Tab content fades + slides slightly when switching tabs.
        body: AnimatedSwitcher(
          duration: motion(context, const Duration(milliseconds: 260)),
          switchInCurve: Curves.easeOutCubic,
          switchOutCurve: Curves.easeInCubic,
          transitionBuilder: (child, animation) => FadeTransition(
            opacity: animation,
            child: SlideTransition(
              position: Tween<Offset>(
                      begin: const Offset(0, 0.02), end: Offset.zero)
                  .animate(animation),
              child: child,
            ),
          ),
          child: KeyedSubtree(key: ValueKey(_i), child: _tab(_i)),
        ),
        bottomNavigationBar: MimooBottomNav(
          index: _i,
          onTap: _go,
          onScan: () => openMockScan(context),
        ),
      ),
    );
  }
}
