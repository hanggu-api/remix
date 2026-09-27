import 'package:flutter/material.dart';
import 'screens/client_main_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProServicosClientApp());
}

class ProServicosClientApp extends StatelessWidget {
  const ProServicosClientApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ProServiços - Cliente (Cloudflare Edge)',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0284C7),
          primary: const Color(0xFF0284C7),
          surface: Colors.white,
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          scrolledUnderElevation: 1,
          iconTheme: IconThemeData(color: Color(0xFF0F172A)),
        ),
      ),
      home: const ClientMainScreen(),
    );
  }
}
