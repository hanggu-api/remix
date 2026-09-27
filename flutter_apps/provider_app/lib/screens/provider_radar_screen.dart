import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/cloudflare_api_service.dart';

class ProviderRadarScreen extends StatefulWidget {
  final bool isOnline;
  final ValueChanged<bool> onToggleOnline;
  final VoidCallback onGoToJob;

  const ProviderRadarScreen({
    super.key,
    required this.isOnline,
    required this.onToggleOnline,
    required this.onGoToJob,
  });

  @override
  State<ProviderRadarScreen> createState() => _ProviderRadarScreenState();
}

class _ProviderRadarScreenState extends State<ProviderRadarScreen> {
  final CloudflareProviderApiService _apiService = CloudflareProviderApiService();
  List<ServiceRequest> _requests = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRadar();
  }

  Future<void> _loadRadar() async {
    setState(() => _isLoading = true);
    final results = await _apiService.getRadarRequests();
    if (mounted) {
      setState(() {
        _requests = results;
        _isLoading = false;
      });
    }
  }

  void _showQuoteDialog(ServiceRequest request) {
    final laborController = TextEditingController(text: '95');
    final materialsController = TextEditingController(text: '40');
    final etaController = TextEditingController(text: '12');
    final messageController = TextEditingController(
        text: 'Estou com van equipada e peças novas. Posso atender com garantia 90 dias.');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Enviar Proposta ao Cliente',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(ctx),
                  )
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Chamado: ${request.title} (${request.category})',
                style: const TextStyle(color: Colors.black54, fontSize: 13),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: laborController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Mão de Obra (R\$)',
                        prefixText: 'R\$ ',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: materialsController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Materiais (R\$)',
                        prefixText: 'R\$ ',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: etaController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Tempo de Chegada (minutos)',
                  suffixText: 'min',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: messageController,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Mensagem ao Cliente',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    Navigator.pop(ctx);
                    final ok = await _apiService.sendQuote(
                      requestId: request.id,
                      providerId: 'prov-1',
                      providerName: 'Carlos Mendes',
                      providerAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
                      providerPhone: '(11) 97123-4567',
                      priceLabor: double.tryParse(laborController.text) ?? 95,
                      priceMaterials: double.tryParse(materialsController.text) ?? 0,
                      etaMinutes: int.tryParse(etaController.text) ?? 15,
                      message: messageController.text.trim(),
                    );
                    if (mounted && ok) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          backgroundColor: Color(0xFF10B981),
                          content: Text('⚡ Orçamento enviado via Cloudflare Workers! O cliente já pode contratar.'),
                        ),
                      );
                      widget.onGoToJob();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  icon: const Icon(Icons.send),
                  label: const Text(
                    'Disparar Orçamento via Cloudflare',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              )
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Radar do Prestador (Cloudflare)',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
        ),
        actions: [
          Row(
            children: [
              Text(
                widget.isOnline ? 'ONLINE' : 'OFFLINE',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: widget.isOnline ? const Color(0xFF10B981) : Colors.grey,
                ),
              ),
              Switch(
                value: widget.isOnline,
                activeColor: const Color(0xFF10B981),
                onChanged: widget.onToggleOnline,
              ),
              const SizedBox(width: 8),
            ],
          )
        ],
      ),
      body: !widget.isOnline
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.cloud_off, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text(
                    'Você está offline',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text('Ative o radar acima para receber novos chamados no Cloudflare D1.'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => widget.onToggleOnline(true),
                    child: const Text('Ficar Online'),
                  )
                ],
              ),
            )
          : _isLoading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: _loadRadar,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _requests.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 14),
                    itemBuilder: (context, index) {
                      final req = _requests[index];
                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFE0F2FE),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    req.category,
                                    style: const TextStyle(
                                      color: Color(0xFF0369A1),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                                const Row(
                                  children: [
                                    Icon(Icons.location_on, size: 14, color: Colors.red),
                                    SizedBox(width: 2),
                                    Text(
                                      '1.8 km de você',
                                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              req.title,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              req.description,
                              style: const TextStyle(color: Colors.black54, fontSize: 13),
                            ),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                const Icon(Icons.person_pin, size: 16, color: Colors.black54),
                                const SizedBox(width: 4),
                                Text(
                                  'Cliente: ${req.clientName}',
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              height: 46,
                              child: ElevatedButton.icon(
                                onPressed: () => _showQuoteDialog(req),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF0F172A),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                icon: const Icon(Icons.request_quote, size: 18),
                                label: const Text('Enviar Orçamento Imediato'),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
