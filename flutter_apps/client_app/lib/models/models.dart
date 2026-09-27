class UserProfile {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role; // 'client' or 'provider'
  final String? avatarUrl;
  final double rating;
  final bool facialVerified;
  final bool documentVerified;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.avatarUrl,
    this.rating = 5.0,
    this.facialVerified = false,
    this.documentVerified = false,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? 'Usuário',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'client',
      avatarUrl: json['avatar_url'] ?? json['avatarUrl'] ?? json['avatar'],
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      facialVerified: json['facial_verified'] == 1 || json['facialVerified'] == true,
      documentVerified: json['document_verified'] == 1 || json['documentVerified'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'avatar_url': avatarUrl,
      'rating': rating,
      'facial_verified': facialVerified ? 1 : 0,
      'document_verified': documentVerified ? 1 : 0,
    };
  }
}

class ServiceRequest {
  final String id;
  final String clientId;
  final String clientName;
  final String clientPhone;
  final String title;
  final String description;
  final String category;
  final String status; // 'open', 'quotes_received', 'in_progress', 'completed'
  final String? clientAddress;
  final double? lat;
  final double? lng;
  final String? selectedQuoteId;
  final String? selectedProviderName;
  final double? agreedPrice;
  final String escrowStatus; // 'none', 'held_pix', 'released', 'refunded'
  final DateTime createdAt;

  ServiceRequest({
    required this.id,
    required this.clientId,
    required this.clientName,
    required this.clientPhone,
    required this.title,
    required this.description,
    required this.category,
    required this.status,
    this.clientAddress,
    this.lat,
    this.lng,
    this.selectedQuoteId,
    this.selectedProviderName,
    this.agreedPrice,
    this.escrowStatus = 'none',
    required this.createdAt,
  });

  factory ServiceRequest.fromJson(Map<String, dynamic> json) {
    return ServiceRequest(
      id: json['id']?.toString() ?? '',
      clientId: json['client_id'] ?? json['clientId'] ?? '',
      clientName: json['client_name'] ?? json['clientName'] ?? 'Cliente',
      clientPhone: json['client_phone'] ?? json['clientPhone'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'Geral',
      status: json['status'] ?? 'open',
      clientAddress: json['client_address'] ?? json['address'],
      lat: (json['lat'] as num?)?.toDouble(),
      lng: (json['lng'] as num?)?.toDouble(),
      selectedQuoteId: json['selected_quote_id'] ?? json['selectedQuoteId'],
      selectedProviderName: json['selected_provider_name'] ?? json['selectedProviderName'],
      agreedPrice: (json['agreed_price'] as num?)?.toDouble() ?? (json['agreedPrice'] as num?)?.toDouble(),
      escrowStatus: json['escrow_status'] ?? json['escrowStatus'] ?? 'none',
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'clientId': clientId,
      'clientName': clientName,
      'clientPhone': clientPhone,
      'title': title,
      'description': description,
      'category': category,
      'status': status,
      'address': clientAddress,
      'lat': lat,
      'lng': lng,
      'price': agreedPrice,
      'escrowStatus': escrowStatus,
    };
  }
}

class ProviderQuote {
  final String id;
  final String requestId;
  final String providerId;
  final String providerName;
  final String? providerAvatar;
  final String providerPhone;
  final double providerRating;
  final int providerJobsCount;
  final bool facialVerified;
  final bool docVerified;
  final double priceLabor;
  final double priceMaterials;
  final int etaMinutes;
  final String message;
  final DateTime createdAt;

  ProviderQuote({
    required this.id,
    required this.requestId,
    required this.providerId,
    required this.providerName,
    this.providerAvatar,
    required this.providerPhone,
    required this.providerRating,
    required this.providerJobsCount,
    required this.facialVerified,
    required this.docVerified,
    required this.priceLabor,
    this.priceMaterials = 0.0,
    required this.etaMinutes,
    required this.message,
    required this.createdAt,
  });

  double get totalPrice => priceLabor + priceMaterials;

  factory ProviderQuote.fromJson(Map<String, dynamic> json) {
    return ProviderQuote(
      id: json['id']?.toString() ?? '',
      requestId: json['request_id'] ?? json['requestId'] ?? '',
      providerId: json['provider_id'] ?? json['providerId'] ?? '',
      providerName: json['provider_name'] ?? json['providerName'] ?? 'Prestador',
      providerAvatar: json['provider_avatar'] ?? json['providerAvatar'],
      providerPhone: json['provider_phone'] ?? json['providerPhone'] ?? '',
      providerRating: (json['provider_rating'] as num?)?.toDouble() ?? 4.9,
      providerJobsCount: (json['provider_jobs_count'] as num?)?.toInt() ?? 50,
      facialVerified: json['facial_verified'] == 1 || json['facialVerified'] == true,
      docVerified: json['doc_verified'] == 1 || json['docVerified'] == true,
      priceLabor: (json['price_labor'] as num?)?.toDouble() ?? (json['price'] as num?)?.toDouble() ?? 0.0,
      priceMaterials: (json['price_materials'] as num?)?.toDouble() ?? (json['materialsTotal'] as num?)?.toDouble() ?? 0.0,
      etaMinutes: (json['eta_minutes'] as num?)?.toInt() ?? (json['etaMinutes'] as num?)?.toInt() ?? 15,
      message: json['message'] ?? 'Orçamento pronto',
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'requestId': requestId,
      'providerId': providerId,
      'providerName': providerName,
      'providerAvatar': providerAvatar,
      'providerPhone': providerPhone,
      'providerRating': providerRating,
      'providerJobsCount': providerJobsCount,
      'facialVerified': facialVerified,
      'docVerified': docVerified,
      'priceLabor': priceLabor,
      'priceMaterials': priceMaterials,
      'etaMinutes': etaMinutes,
      'message': message,
    };
  }
}

class ChatMessage {
  final String id;
  final String requestId;
  final String senderId;
  final String senderName;
  final String senderRole;
  final String text;
  final DateTime createdAt;

  ChatMessage({
    required this.id,
    required this.requestId,
    required this.senderId,
    required this.senderName,
    required this.senderRole,
    required this.text,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id']?.toString() ?? '',
      requestId: json['request_id'] ?? json['requestId'] ?? '',
      senderId: json['sender_id'] ?? json['senderId'] ?? '',
      senderName: json['sender_name'] ?? json['senderName'] ?? '',
      senderRole: json['sender_role'] ?? json['senderRole'] ?? 'client',
      text: json['text'] ?? '',
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'requestId': requestId,
      'senderId': senderId,
      'senderName': senderName,
      'senderRole': senderRole,
      'text': text,
    };
  }
}
