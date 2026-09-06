// Basic smoke test — confirms the app boots into the WebView screen without
// throwing. It doesn't assert on loaded page content since that would
// require real network access to health.phicsart.com during `flutter test`.

import 'package:flutter_test/flutter_test.dart';

import 'package:ibnocare/main.dart';

void main() {
  testWidgets('IbnocareApp boots into the WebView screen', (WidgetTester tester) async {
    await tester.pumpWidget(const IbnocareApp());
    await tester.pump();

    expect(find.byType(WebViewScreen), findsOneWidget);
  });
}
