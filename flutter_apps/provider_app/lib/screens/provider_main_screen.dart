import 'package:flutter/material.dart';
import 'provider_radar_screen.dart';
import 'provider_active_job_screen.dart';
import 'provider_finance_screen.dart';

class ProviderMainScreen extends StatefulWidget {
  const ProviderMainScreen({super.key});

  @override
  State<ProviderMainScreen> createState() => _ProviderMainScreenState();
}

class _ProviderMainScreenState extends State<ProviderMainScreen> {
  int _currentIndex = 0;
  bool _isOnline = true;

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      ProviderRadarScreen(
        isOnline: _isOnline,
        onToggleOnline: (val) => setState(() => _isOnline = val),
        onGoToJob: () => setState(() => _currentIndex = 1),
      ),
      const ProviderActiveJobScreen(),
      const ProviderFinanceScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        indicatorColor: const Color(0xFFE2E8F0),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.radar_outlined),
            selectedIcon: Icon(Icons.radar, color: Color(0xFF0284C7)),
            label: 'Radar Chamados',
          ),
          NavigationDestination(
            icon: Icon(Icons.navigation_outlined),
            selectedIcon: Icon(Icons.navigation, color: Color(0xFF0284C7)),
            label: 'Serviço Ativo',
          ),
          NavigationDestination(
            icon: Icon(Icons.account_balance_wallet_outlined),
            selectedIcon: Icon(Icons.account_balance_wallet, color: Color(0xFF0284C7)),
            label: 'Carteira PIX',
          ),
        ],
      ),
    );
  }
}
