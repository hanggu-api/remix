import 'package:flutter/material.dart';

class ProviderFinanceScreen extends StatelessWidget {
  const ProviderFinanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Carteira PIX & Finanças MEI',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card Principal de Saldo
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'SALDO DISPONÍVEL PARA SAQUE PIX',
                    style: TextStyle(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'R\$ 1.840,50',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0284C7).withOpacity(0.3),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF0284C7)),
                        ),
                        child: const Text(
                          '🔒 R\$ 340,00 em Custódia (2 serviços em andamento)',
                          style: TextStyle(color: Color(0xFF7DD3FC), fontSize: 11, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            backgroundColor: Color(0xFF10B981),
                            content: Text('⚡ Saque PIX instantâneo enviado para sua chave cadastrada!'),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0284C7),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      icon: const Icon(Icons.flash_on),
                      label: const Text(
                        'Transferir para Minha Conta PIX',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'Histórico de Liberações de Custódia (Cloudflare)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
            const SizedBox(height: 12),

            // Lista de transações
            _buildTransactionTile(
              title: 'Instalação de Tomada e Chuveiro',
              client: 'Ana Clara Souza',
              date: 'Hoje, 14:20',
              value: '+ R\$ 140,00',
              status: 'Retido em Custódia',
              isPending: true,
            ),
            const SizedBox(height: 10),
            _buildTransactionTile(
              title: 'Troca de Fiação 4mm',
              client: 'Roberto Gomes',
              date: 'Ontem, 16:45',
              value: '+ R\$ 280,00',
              status: 'Liberado na Carteira',
              isPending: false,
            ),
            const SizedBox(height: 10),
            _buildTransactionTile(
              title: 'Instalação de Luminárias LED',
              client: 'Mariana Duarte',
              date: '25/09/2026',
              value: '+ R\$ 195,00',
              status: 'Liberado na Carteira',
              isPending: false,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionTile({
    required String title,
    required String client,
    required String date,
    required String value,
    required String status,
    required bool isPending,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: isPending ? const Color(0xFFFEF3C7) : const Color(0xFFDCFCE7),
                radius: 20,
                child: Icon(
                  isPending ? Icons.lock_clock : Icons.check_circle,
                  color: isPending ? const Color(0xFFD97706) : const Color(0xFF16A34A),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$client • $date',
                    style: const TextStyle(color: Colors.black54, fontSize: 11),
                  ),
                ],
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                  color: isPending ? const Color(0xFFD97706) : const Color(0xFF16A34A),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                status,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: isPending ? const Color(0xFFD97706) : const Color(0xFF16A34A),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
