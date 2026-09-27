import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/models.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Stream de pedidos do cliente logado
  Stream<List<ServiceRequest>> getClientRequests(String clientId) {
    return _db
        .collection('requests')
        .where('clientId', isEqualTo: clientId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ServiceRequest.fromFirestore(doc.data(), doc.id))
            .toList());
  }

  // Stream de um pedido específico
  Stream<ServiceRequest?> getRequestById(String requestId) {
    return _db
        .collection('requests')
        .doc(requestId)
        .snapshots()
        .map((doc) => doc.exists && doc.data() != null
            ? ServiceRequest.fromFirestore(doc.data()!, doc.id)
            : null);
  }

  // Criar novo pedido de serviço (ativa o radar dos prestadores)
  Future<String> createServiceRequest({
    required String clientId,
    required String clientName,
    required String clientPhone,
    required String title,
    required String description,
    required String category,
  }) async {
    final docRef = _db.collection('requests').doc();
    final request = ServiceRequest(
      id: docRef.id,
      clientId: clientId,
      clientName: clientName,
      clientPhone: clientPhone,
      title: title,
      description: description,
      category: category,
      status: 'open',
      createdAt: DateTime.now(),
    );

    await docRef.set(request.toMap());
    return docRef.id;
  }

  // Stream das cotações recebidas para um pedido em tempo real
  Stream<List<ProviderQuote>> getQuotesForRequest(String requestId) {
    return _db
        .collection('requests')
        .doc(requestId)
        .collection('quotes')
        .orderBy('createdAt', descending: false)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ProviderQuote.fromFirestore(doc.data(), doc.id))
            .toList());
  }

  // Cliente contrata prestador com retenção em Custódia PIX
  Future<void> acceptQuoteWithEscrow({
    required String requestId,
    required ProviderQuote quote,
    required String pixEndToEndId,
  }) async {
    // 1. Atualiza pedido
    await _db.collection('requests').doc(requestId).update({
      'status': 'in_progress',
      'selectedQuoteId': quote.id,
      'selectedProviderName': quote.providerName,
      'agreedPrice': quote.price + (quote.materialsTotal ?? 0),
      'escrowStatus': 'held_pix',
    });

    // 2. Registra a transação de custódia
    final escrowRef = _db.collection('escrow_transactions').doc();
    await escrowRef.set({
      'transactionId': escrowRef.id,
      'requestId': requestId,
      'providerId': quote.providerId,
      'providerName': quote.providerName,
      'laborAmount': quote.price,
      'materialsAmount': quote.materialsTotal ?? 0.0,
      'totalAmount': quote.price + (quote.materialsTotal ?? 0.0),
      'pixEndToEndId': pixEndToEndId,
      'status': 'held_in_custody',
      'createdAt': FieldValue.serverTimestamp(),
    });
  }

  // Mensagens do Chat em Tempo Real
  Stream<List<ChatMessage>> getChatMessages(String requestId) {
    return _db
        .collection('requests')
        .doc(requestId)
        .collection('messages')
        .orderBy('timestamp', descending: false)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ChatMessage.fromFirestore(doc.data(), doc.id))
            .toList());
  }

  // Enviar mensagem no Chat
  Future<void> sendChatMessage({
    required String requestId,
    required String senderId,
    required String senderName,
    required String senderRole,
    required String text,
  }) async {
    final msgRef = _db
        .collection('requests')
        .doc(requestId)
        .collection('messages')
        .doc();

    await msgRef.set({
      'requestId': requestId,
      'senderId': senderId,
      'senderName': senderName,
      'senderRole': senderRole,
      'text': text,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }
}
