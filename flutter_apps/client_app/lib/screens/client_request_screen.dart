import 'package:flutter/material.dart';
import '../services/cloudflare_api_service.dart';

class ClientRequestScreen extends StatefulWidget {
  final Function(String requestId) onCreatedRequest;

  const ClientRequestScreen({super.key, required this.onCreatedRequest});

  @override
  State<ClientRequestScreen> createState() => _ClientRequestScreenState();
}

class _ClientRequestScreenState extends State<ClientRequestScreen> {
  final CloudflareApiService _apiService = CloudflareApiService();
  final TextEditingController _titleController =
      TextEditingController(text: 'Instalação de Tomada e Chuveiro');
  final TextEditingController _descController = TextEditingController(
      text: 'Preciso trocar disjuntor de 30A e instalar chuveiro elétrico na suíte.');

  String _selectedCategory = 'Eletricista';
  bool _isLoading = false;

  final List<Map<String, dynamic>> _categories = [
    {'title': 'Eletricista', 'icon': Icons.bolt, 'color': Color(0xFFF59E0B)},
    {'title': 'Encanador', 'icon': Icons.water_drop, 'color': Color(0xFF0284C7)},
    {'title': 'Pintor', 'icon': Icons.format_paint, 'color': Color(0xFF8B5CF6)},
    {'title': 'Ar-condicionado', 'icon': Icons.ac_unit, 'color': Color(0xFF06B6D4)},
    {'title': 'Chaveiro', 'icon': Icons.key, 'color': Color(0xFF10B981)},
    {'title': 'Montador', 'icon': Icons.build, 'color': Color(0xFF64748B)},
  ];

  Future<void> _handleBroadcastRequest() async {
    setState(() => _isLoading = true);
    try {
      final req = await _apiService.createServiceRequest(
        clientId: 'client-1',
        clientName: 'Ana Clara Souza',
        clientPhone: '(11) 98765-4321',
        title: _titleController.text.trim(),
        description: _descController.text.trim(),
        category: _selectedCategory,
        address: 'Rua Fradique Coutinho, 1240 - Pinheiros, São Paulo - SP',
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF0284C7),
            content: Text('⚡ Chamado enviado para a borda Cloudflare D1! Radar dos prestadores acionado.'),
          ),
        );
        widget.onCreatedRequest(req.id);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao enviar pedido ao Cloudflare: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.cloud_outlined, color: Color(0xFFF38020), size: 22),
            SizedBox(width: 8),
            Text(
              'ProServiços Cliente',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFE0F2FE),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              children: [
                Icon(Icons.shield, size: 14, color: Color(0xFF0369A1)),
                SizedBox(width: 4),
                Text(
                  'Cloudflare Edge & D1',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0369A1),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner de Garantia & Custódia
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Color(0xFFF38020),
                    radius: 20,
                    child: Icon(Icons.bolt, color: Colors.white, size: 20),
                  ),
                  SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Radar Inteligente com Cloudflare D1',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Transações e chamados sincronizados na borda global com custódia PIX segura.',
                          style: TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'Qual profissional você precisa hoje?',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),

            // Grid de Categorias
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _categories.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 1.1,
              ),
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = cat['title'] == _selectedCategory;
                return InkWell(
                  onTap: () => setState(() => _selectedCategory = cat['title']),
                  borderRadius: BorderRadius.circular(16),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFFE0F2FE) : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? const Color(0xFF0284C7)
                            : const Color(0xFFE2E8F0),
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(cat['icon'], color: cat['color'], size: 28),
                        const SizedBox(height: 6),
                        Text(
                          cat['title'],
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected ? const Color(0xFF0369A1) : Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),

            const SizedBox(height: 24),
            const Text(
              'Descreva o serviço para o prestador',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 8),

            TextField(
              controller: _titleController,
              decoration: InputDecoration(
                labelText: 'Título do chamado',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
            ),
            const SizedBox(height: 12),

            TextField(
              controller: _descController,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'Detalhes (peças necessárias, defeito observado)',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Botão Principal
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _isLoading ? null : _handleBroadcastRequest,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0284C7),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                icon: _isLoading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.radar),
                label: Text(
                  _isLoading ? 'Acionando Cloudflare D1...' : 'Disparar Radar de Prestadores',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
