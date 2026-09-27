# ProServiços - App do Cliente (Flutter)

Aplicativo móvel desenvolvido em **Flutter** para clientes contratarem serviços residenciais com segurança e garantia.

Conectado ao backend de ultra-baixa latência no **Cloudflare Workers** com banco relacional de borda **Cloudflare D1**.

## Recursos do App do Cliente:
- **Disparo de Chamados com Radar**: Solicitação de eletricista, encanador, pintor, etc., acionando instantaneamente o radar de prestadores no Cloudflare.
- **Comparador de Cotações com Selos de Verificação**: Análise de propostas com avaliação, quantidade de serviços, e selos de validação facial e documental.
- **Contratação com Custódia PIX**: O valor fica seguro no Cloudflare D1 em custódia até a conclusão aprovada pelo cliente.
- **Rastreamento de Deslocamento estilo Uber**: Acompanhamento do prestador a caminho em tempo real.
- **Chat Integrado**: Comunicação direta e instantânea com o prestador contratado.

## Como Executar o App do Cliente:
```bash
cd flutter_apps/client_app
flutter pub get
flutter run
```
*Para rodar no navegador:*
```bash
flutter run -d chrome
```
*Para apontar para seu Cloudflare Worker de produção:*
```bash
flutter run --dart-define=CLOUDFLARE_API_URL=https://proservicos-backend.<seu-subdominio>.workers.dev
```
