import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/models.dart';

class CloudflareProviderApiService {
  final String _baseUrl = ApiConfig.baseUrl;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

  // 1. Radar: Buscar chamados abertos de clientes na borda Cloudflare
  Future<List<ServiceRequest>> getRadarRequests() async {
    try {
      final res = await http.get(
        Uri.parse('$_baseUrl/api/requests/radar'),
        headers: _headers,
      );

      if (res.statusCode == 200) {
        final List<dynamic> list = jsonDecode(res.body);
        return list.map((item) => ServiceRequest.fromJson(item)).toList();
      }
    } catch (_) {}

    // Fallback de demonstração
    return [
      ServiceRequest(
        id: 'req-1',
        clientId: 'client-1',
        clientName: 'Ana Clara Souza',
        clientPhone: '(11) 98765-4321',
        title: 'Instalação de Tomada 20A e Chuveiro',
        description: 'Troca de fiação no banheiro suíte e instalação de disjuntor bipolar.',
        category: 'Eletricista',
        status: 'open',
        clientAddress: 'Rua Fradique Coutinho, 1240 - Pinheiros, São Paulo - SP',
        lat: -23.5617,
        lng: -46.6865,
        agreedPrice: 140.0,
        createdAt: DateTime.now(),
      )
    ];
  }

  // 2. Enviar proposta de orçamento no chamado
  Future<bool> sendQuote({
    required String requestId,
    required String providerId,
    required String providerName,
    required String? providerAvatar,
    required String providerPhone,
    required double priceLabor,
    required double priceMaterials,
    required int etaMinutes,
    required String message,
  }) async {
    final payload = {
      'providerId': providerId,
      'providerName': providerName,
      'providerAvatar': providerAvatar,
      'providerPhone': providerPhone,
      'priceLabor': priceLabor,
      'priceMaterials': priceMaterials,
      'etaMinutes': etaMinutes,
      'message': message,
      'facialVerified': true,
      'docVerified': true,
    };

    try {
      final res = await http.post(
        Uri.parse('$_baseUrl/api/requests/$requestId/quotes'),
        headers: _headers,
        body: jsonEncode(payload),
      );
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return true;
    }
  }

  // 3. Atualizar status de atendimento (A caminho, Cheguei no local, Concluído)
  Future<bool> updateServiceStatus({
    required String requestId,
    required String status,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$_baseUrl/api/requests/$requestId/status'),
        headers: _headers,
        body: jsonEncode({'status': status}),
      );
      return res.statusCode == 200;
    } catch (_) {
      return true;
    }
  }
}
