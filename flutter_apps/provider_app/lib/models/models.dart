class UserProfile {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role;
  final String? category;
  final String? avatarUrl;
  final double rating;
  final int jobsCount;
  final bool facialVerified;
  final bool documentVerified;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.category,
    this.avatarUrl,
    this.rating = 5.0,
    this.jobsCount = 0,
    this.facialVerified = false,
    this.documentVerified = false,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? 'Prestador',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'provider',
      category: json['category'],
      avatarUrl: json['avatar_url'] ?? json['avatarUrl'] ?? json['avatar'],
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      jobsCount: (json['jobs_count'] as num?)?.toInt() ?? 0,
      facialVerified: json['facial_verified'] == 1 || json['facialVerified'] == true,
      documentVerified: json['document_verified'] == 1 || json['documentVerified'] == true,
    );
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
  final String status;
  final String? clientAddress;
  final double? lat;
  final double? lng;
  final double? agreedPrice;
  final String escrowStatus;
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
      agreedPrice: (json['agreed_price'] as num?)?.toDouble() ?? (json['agreedPrice'] as num?)?.toDouble(),
      escrowStatus: json['escrow_status'] ?? json['escrowStatus'] ?? 'none',
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}

class ProviderQuote {
  final String id;
  final String requestId;
  final String providerId;
  final String providerName;
  final double priceLabor;
  final double priceMaterials;
  final int etaMinutes;
  final String message;

  ProviderQuote({
    required this.id,
    required this.requestId,
    required this.providerId,
    required this.providerName,
    required this.priceLabor,
    this.priceMaterials = 0.0,
    required this.etaMinutes,
    required this.message,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'requestId': requestId,
      'providerId': providerId,
      'providerName': providerName,
      'priceLabor': priceLabor,
      'priceMaterials': priceMaterials,
      'etaMinutes': etaMinutes,
      'message': message,
    };
  }
}
