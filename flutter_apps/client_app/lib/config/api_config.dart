class ApiConfig {
  // URL do Cloudflare Worker deployed ou em ambiente local
  static const String cloudflareBaseUrl =
      String.fromEnvironment('CLOUDFLARE_API_URL', defaultValue: 'https://proservicos-backend.workers.dev');

  // Rota local para testes
  static const String localFallbackUrl = 'http://localhost:3000/api/cloudflare';

  static String get baseUrl => cloudflareBaseUrl;
}
