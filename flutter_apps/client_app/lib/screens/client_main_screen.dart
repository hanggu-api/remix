import 'package:flutter/material.dart';
import 'client_request_screen.dart';
import 'client_quotes_screen.dart';
import 'client_tracking_screen.dart';

class ClientMainScreen extends StatefulWidget {
  const ClientMainScreen({super.key});

  @override
  State<ClientMainScreen> createState() => _ClientMainScreenState();
}

class _ClientMainScreenState extends State<ClientMainScreen> {
  int _currentIndex = 0;
  String? _activeRequestId = 'req-demo-1';

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      ClientRequestScreen(
        onCreatedRequest: (id) {
          setState(() {
            _activeRequestId = id;
            _currentIndex = 1; // Leva para aba de cotações
          });
        },
      ),
      ClientQuotesScreen(
        requestId: _activeRequestId ?? 'req-demo-1',
        onHired: () {
          setState(() {
            _currentIndex = 2; // Leva para acompanhamento em tempo real
          });
        },
      ),
      ClientTrackingScreen(
        requestId: _activeRequestId ?? 'req-demo-1',
      ),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        indicatorColor: const Color(0xFFE0F2FE),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.flash_on_outlined),
            selectedIcon: Icon(Icons.flash_on, color: Color(0xFF0284C7)),
            label: 'Pedir Serviço',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long, color: Color(0xFF0284C7)),
            label: 'Cotações',
          ),
          NavigationDestination(
            icon: Icon(Icons.map_outlined),
            selectedIcon: Icon(Icons.map, color: Color(0xFF0284C7)),
            label: 'Rastreamento',
          ),
        ],
      ),
    );
  }
}
