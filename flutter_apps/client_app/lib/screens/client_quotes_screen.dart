import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/cloudflare_api_service.dart';

class ClientQuotesScreen extends StatefulWidget {
  final String requestId;
  final VoidCallback onHired;

  const ClientQuotesScreen({
    super.key,
    required this.requestId,
    required this.onHired,
  });

  @override
  State<ClientQuotesScreen> createState() => _ClientQuotesScreenState();
}

class _ClientQuotesScreenState extends State<ClientQuotesScreen> {
  final CloudflareApiService _apiService = CloudflareApiService();
  List<ProviderQuote> _quotes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadQuotes();
  }

  Future<void> _loadQuotes() async {
    setState(() => _isLoading = true);
    final results = await _apiService.getQuotesForRequest(widget.requestId);
    if (mounted) {
      setState(() {
        _quotes = results;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Orçamentos no Radar (Cloudflare)',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadQuotes,
            tooltip: 'Atualizar via Cloudflare',
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _quotes.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.radar, size: 64, color: Color(0xFF0284C7)),
                      const SizedBox(height: 16),
                      const Text(
                        'Radar ativo no Cloudflare Edge...',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Aguardando prestadores enviarem propostas.',
                        style: TextStyle(color: Colors.black54),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadQuotes,
                        child: const Text('Verificar novamente'),
                      )
                    ],
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _quotes.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    final quote = _quotes[index];
                    return _buildQuoteCard(context, quote);
                  },
                ),
    );
  }

  Widget _buildQuoteCard(BuildContext context, ProviderQuote quote) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 10,
            offset: Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Avatar, Nome, Badges de Verificação
          Row(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundImage: quote.providerAvatar != null
                    ? NetworkImage(quote.providerAvatar!)
                    : null,
                child: quote.providerAvatar == null
                    ? const Icon(Icons.person)
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            quote.providerName,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (quote.facialVerified) ...[
                          const SizedBox(width: 4),
                          const Icon(Icons.verified, size: 16, color: Color(0xFF0284C7)),
                        ],
                      ],
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 14, color: Color(0xFFF59E0B)),
                        const SizedBox(width: 3),
                        Text(
                          quote.providerRating.toStringAsFixed(1),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '(${quote.providerJobsCount} serviços)',
                          style: const TextStyle(color: Colors.black54, fontSize: 12),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Badge de Chegada Estimada
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.directions_car, size: 16, color: Color(0xFF0F172A)),
                    Text(
                      '${quote.etaMinutes} min',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Mensagem da proposta
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Text(
              quote.message,
              style: const TextStyle(fontSize: 13, color: Color(0xFF334155)),
            ),
          ),

          const SizedBox(height: 16),

          // Valores e Ação de Contratação com Custódia PIX
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Valor Total (Custódia PIX)',
                    style: TextStyle(fontSize: 11, color: Colors.black54),
                  ),
                  Text(
                    'R\$ ${quote.totalPrice.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 20,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () async {
                  final ok = await _apiService.acceptQuoteWithEscrow(
                    requestId: widget.requestId,
                    quote: quote,
                    clientId: 'client-1',
                  );
                  if (mounted && ok) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        backgroundColor: Color(0xFF10B981),
                        content: Text('Contratado com sucesso via Cloudflare! Valor retido com garantia 90D.'),
                      ),
                    );
                    widget.onHired();
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0284C7),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                icon: const Icon(Icons.lock_clock, size: 16),
                label: const Text(
                  'Contratar PIX',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
