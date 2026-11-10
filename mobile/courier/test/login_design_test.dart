import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mimoo_courier/pages/auth/login_page.dart';
import 'package:mimoo_courier/theme/mimoo_theme.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    final fonts = FontLoader('Poppins')
      ..addFont(rootBundle.load('assets/fonts/Poppins-Light.ttf'))
      ..addFont(rootBundle.load('assets/fonts/Poppins-Regular.ttf'))
      ..addFont(rootBundle.load('assets/fonts/Poppins-Medium.ttf'))
      ..addFont(rootBundle.load('assets/fonts/Poppins-SemiBold.ttf'));
    await fonts.load();
  });

  void expectTextWidth(
    WidgetTester tester,
    String text,
    double expectedWidth,
  ) {
    final style = tester.widget<Text>(find.text(text)).style!;
    final painter = TextPainter(
      text: TextSpan(text: text, style: style),
      textDirection: TextDirection.ltr,
      maxLines: 1,
    )..layout();
    expect(painter.width, closeTo(expectedWidth, 3), reason: text);
  }

  testWidgets('login matches the 393 by 852 design frame', (tester) async {
    tester.view.physicalSize = const Size(393, 852);
    tester.view.devicePixelRatio = 1;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(MaterialApp(
      theme: mimooTheme(),
      home: const LoginPage(),
    ));
    await tester.pumpAndSettle();

    expect(
      tester.getTopLeft(find.byKey(const ValueKey('login-header'))).dy,
      0,
    );
    expect(
      tester.getSize(find.byKey(const ValueKey('login-header'))).height,
      296,
    );
    expect(
      tester.getTopLeft(find.byKey(const ValueKey('login-logo'))),
      const Offset(104.5, 57),
    );
    expect(
      tester.getSize(find.byKey(const ValueKey('login-logo'))),
      const Size(184, 164),
    );
    expect(find.text('Welcome back, Courier'), findsOneWidget);
    expect(find.text('Sign in to your courier account'), findsOneWidget);
    expect(find.text('Show Password'), findsOneWidget);
    expect(find.byTooltip('Show password'), findsNothing);
    expect(find.byIcon(Icons.visibility), findsNothing);
    expect(find.byIcon(Icons.visibility_outlined), findsNothing);
    expect(find.byIcon(Icons.visibility_off_outlined), findsNothing);

    final signIn = tester.widget<ElevatedButton>(
      find.widgetWithText(ElevatedButton, 'Sign In'),
    );
    expect(
      signIn.style!.backgroundColor!.resolve({}),
      const Color(0xFF34175B),
    );
    expect(
      tester.getTopLeft(find.widgetWithText(ElevatedButton, 'Sign In')).dy,
      closeTo(599, 1),
    );

    for (final key in const [
      ValueKey('email-field-box'),
      ValueKey('password-field-box'),
    ]) {
      final box = tester.widget<Container>(find.byKey(key));
      final decoration = box.decoration! as BoxDecoration;
      expect(decoration.color, const Color(0xFFF5F4FC));
      expect(tester.getSize(find.byKey(key)).height, 44);
    }
    expect(
      tester.getTopLeft(find.byKey(const ValueKey('email-field-box'))).dy,
      closeTo(426, 1),
    );
    expect(
      tester.getTopLeft(find.byKey(const ValueKey('password-field-box'))).dy,
      closeTo(511, 1),
    );

    final fields =
        tester.widgetList<TextField>(find.byType(TextField)).toList();
    expect(fields, hasLength(2));
    const fieldKeys = [
      ValueKey('email-field-box'),
      ValueKey('password-field-box'),
    ];
    const hints = ['name@email.com', 'Your password'];
    for (var index = 0; index < fields.length; index++) {
      final field = fields[index];
      expect(field.textAlignVertical, TextAlignVertical.center);
      expect(field.style!.color, const Color(0xFF000000));
      expect(field.strutStyle!.forceStrutHeight, isTrue);
      expect(field.strutStyle!.height, 1);
      expect(field.decoration!.filled, isFalse);
      expect(field.decoration!.isDense, isTrue);
      expect(field.decoration!.isCollapsed, isTrue);
      expect(field.decoration!.contentPadding, EdgeInsets.zero);
      expect(field.decoration!.border, InputBorder.none);
      expect(field.decoration!.enabledBorder, InputBorder.none);
      expect(field.decoration!.focusedBorder, InputBorder.none);
      expect(field.decoration!.errorBorder, InputBorder.none);
      expect(field.decoration!.disabledBorder, InputBorder.none);

      final hint = hints[index];
      expect(find.text(hint), findsOneWidget);
      final fieldCenter =
          tester.getRect(find.byKey(fieldKeys[index])).center.dy;
      // The text layer carries a measured -1.5 px offset for Poppins' tall
      // ascent so the glyph centre (not just the line box) sits on the icon.
      expect(
        tester.getRect(find.text(hint)).center.dy,
        closeTo(fieldCenter - 1.5, 1),
      );
    }

    // Both icons are always visible — empty and before any tap.
    final emailIcon = find.byIcon(Icons.mail_outline_rounded);
    final lockIcon = find.byIcon(Icons.lock_outline_rounded);
    expect(emailIcon, findsOneWidget);
    expect(lockIcon, findsOneWidget);

    const iconFields = [
      (ValueKey('email-field-box'), Icons.mail_outline_rounded),
      (ValueKey('password-field-box'), Icons.lock_outline_rounded),
    ];
    for (final (key, iconData) in iconFields) {
      final boxRect = tester.getRect(find.byKey(key));
      final iconFinder = find.byIcon(iconData);
      final iconRect = tester.getRect(iconFinder);
      final icon = tester.widget<Icon>(iconFinder);
      expect(icon.size, 18);
      expect(icon.color, const Color(0xFF655A93));
      expect(iconRect.left, closeTo(boxRect.left + 14, 1));
      expect(iconRect.center.dy, closeTo(boxRect.center.dy, 1.5));
      // Icon centre and the text-field centre share one horizontal line.
      final textField = find.descendant(
        of: find.byKey(key),
        matching: find.byType(TextField),
      );
      expect(
          iconRect.center.dy, closeTo(tester.getRect(textField).center.dy, 2));
      // Text starts at 39 px from the box left edge (14 + 18 + 7).
      final hint = key == iconFields.first.$1
          ? find.text('name@email.com')
          : find.text('Your password');
      expect(tester.getRect(hint).left, closeTo(boxRect.left + 39, 1));
      expect(
        tester.getRect(hint).center.dy,
        closeTo(iconRect.center.dy, 2),
      );
    }
    // The icon must never shift when a field gains focus.
    final emailHintLeft = tester.getRect(find.text('name@email.com')).left;

    await tester.tap(find.byKey(const ValueKey('email-field-box')));
    await tester.pumpAndSettle();
    expect(tester.getRect(find.text('name@email.com')).left, emailHintLeft);
    expect(
      tester.getRect(find.byIcon(Icons.mail_outline_rounded)).left,
      closeTo(38, 1),
    );

    await tester.tap(find.byKey(const ValueKey('password-field-box')));
    await tester.pumpAndSettle();
    expect(
      tester.getRect(find.byIcon(Icons.lock_outline_rounded)).left,
      closeTo(38, 1),
    );

    final accessCard = find.byKey(const ValueKey('need-access-card'));
    final accessDecoration =
        tester.widget<Container>(accessCard).decoration! as BoxDecoration;
    expect(accessDecoration.color, const Color(0xFFEFE9FD));
    expect(tester.getTopLeft(accessCard).dy, closeTo(659, 1));
    expect(
      find.text(
        'Ask your logistics company to provision your rider account',
      ),
      findsOneWidget,
    );
    expect(
      find.text(
        'Mimoo Logistics Grid v3.4.2 | Protected by SafeRide Dispatch',
      ),
      findsOneWidget,
    );
    expectTextWidth(tester, 'Welcome back, Courier', 236);
    expectTextWidth(tester, 'Sign in to your courier account', 181);
    expectTextWidth(tester, 'Email Address', 85);
    expectTextWidth(tester, 'Password', 58);
    expectTextWidth(tester, 'Show Password', 93);
    expectTextWidth(
      tester,
      'A Little Bit of Everything, Just a Moo Away',
      199,
    );
    expectTextWidth(
      tester,
      'Mimoo Logistics Grid v3.4.2 | Protected by SafeRide Dispatch',
      293,
    );

    await tester.enterText(
      find.descendant(
        of: find.byKey(const ValueKey('email-field-box')),
        matching: find.byType(TextField),
      ),
      'courier@example.com',
    );
    await tester.pump();
    final emailField = find.descendant(
      of: find.byKey(const ValueKey('email-field-box')),
      matching: find.byType(TextField),
    );
    final editable = find.descendant(
      of: emailField,
      matching: find.byType(EditableText),
    );
    expect(
      tester.getRect(editable).center.dy,
      closeTo(tester.getRect(emailField).center.dy, 1),
    );
    expect(tester.takeException(), isNull);
  });

  testWidgets('login remains scrollable on a small, scaled screen',
      (tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1;
    tester.platformDispatcher.textScaleFactorTestValue = 1.6;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
      tester.platformDispatcher.clearTextScaleFactorTestValue();
    });

    await tester.pumpWidget(MaterialApp(
      theme: mimooTheme(),
      home: const LoginPage(),
    ));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Sign In'));
    await tester.pumpAndSettle();

    expect(tester.getRect(find.text('Sign In')).bottom, lessThanOrEqualTo(640));
    expect(tester.takeException(), isNull);
  });
}
