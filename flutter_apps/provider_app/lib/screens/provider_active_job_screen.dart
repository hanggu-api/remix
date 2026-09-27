import 'package:flutter/material.dart';
import '../services/cloudflare_api_service.dart';

class ProviderActiveJobScreen extends StatefulWidget {
  const ProviderActiveJobScreen({super.key});

  @override
  State<ProviderActiveJobScreen> createState() => _ProviderActiveJobScreenState();
}

class _ProviderActiveJobScreenState extends State<ProviderActiveJobScreen> {
  final CloudflareProviderApiService _apiService = CloudflareProviderApiService();
  String _jobStatus = 'en_route'; // 'en_route', 'arrived', 'in_progress', 'completed'

  final Map<String, String> _statusLabels = {
    'en_route': 'A Caminho do Cliente',
    'arrived': 'No Local do Serviço',
    'in_progress': 'Executando Serviço',
    'completed': 'Serviço Finalizado & Solicitar PIX',
  };

  Future<void> _advanceStatus(String nextStatus) async {
    setState(() => _jobStatus = nextStatus);
    await _apiService.updateServiceStatus(requestId: 'req-1', status: nextStatus);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF0284C7),
          content: Text('Status atualizado para: ${_statusLabels[nextStatus]} via Cloudflare!'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Ordem de Serviço Ativa',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card de Status Uber-style
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'STATUS DA ORDEM',
                        style: TextStyle(
                          color: Colors.white60,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0284C7),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _statusLabels[_jobStatus] ?? _jobStatus,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Instalação de Tomada e Chuveiro',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Cliente: Ana Clara Souza • R\$ 140,00 Retido em Custódia PIX',
                    style: TextStyle(color: Color(0xFF38BDF8), fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Endereço e Rota
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.pin_drop, color: Colors.red),
                      SizedBox(width: 8),
                      Text(
                        'Destino do Atendimento',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Rua Fradique Coutinho, 1240 - Apto 42\nPinheiros, São Paulo - SP',
                    style: TextStyle(color: Colors.black87, fontSize: 13),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.navigation, size: 16),
                          label: const Text('Abrir no Waze / Maps'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.phone, color: Color(0xFF0284C7)),
                        tooltip: 'Ligar para Cliente',
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text(
              'Ações da Ordem de Serviço',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
            const SizedBox(height: 12),

            // Botões de avanço de status
            if (_jobStatus == 'en_route')
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: () => _advanceStatus('arrived'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Icon(Icons.place),
                  label: const Text('Cheguei no Local (Notificar Cliente)'),
                ),
              ),

            if (_jobStatus == 'arrived')
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: () => _advanceStatus('in_progress'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Iniciar Execução do Serviço'),
                ),
              ),

            if (_jobStatus == 'in_progress') ...[
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.camera_alt),
                label: const Text('Tirar Foto Antes / Depois (Laudo Técnico)'),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: () => _advanceStatus('completed'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Icon(Icons.check_circle),
                  label: const Text('Concluir Serviço & Solicitar Liberação PIX'),
                ),
              ),
            ],

            if (_jobStatus == 'completed')
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFA7F3D0)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.check_circle, color: Color(0xFF059669)),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Serviço marcado como concluído! O valor de R\$ 140,00 será transferido automaticamente via PIX.',
                        style: TextStyle(color: Color(0xFF065F46), fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
