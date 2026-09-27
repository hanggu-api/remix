class ApiConfig {
  static const String cloudflareBaseUrl =
      String.fromEnvironment('CLOUDFLARE_API_URL', defaultValue: 'https://proservicos-backend.workers.dev');

  static String get baseUrl => cloudflareBaseUrl;
}
