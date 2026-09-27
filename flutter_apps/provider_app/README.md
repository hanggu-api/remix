# ProServiços - App do Prestador (Flutter)

Aplicativo móvel desenvolvido em **Flutter** para profissionais e prestadores de serviço autônomos/MEI.

Conectado ao backend de ultra-baixa latência no **Cloudflare Workers** com banco relacional de borda **Cloudflare D1**.

## Recursos do App do Prestador:
- **Radar de Chamados em Tempo Real**: Ouvinte conectado ao Cloudflare D1 trazendo novos chamados criados pelos clientes no App do Cliente.
- **Envio Rápido de Orçamentos**: Envio de proposta detalhada (mão de obra, materiais, tempo estimado de chegada e mensagem).
- **Gestão de Ordem de Serviço**: Controle de status estilo Uber ("A caminho" ➔ "No local" ➔ "Em execução" ➔ "Concluído").
- **Carteira PIX & Liberação de Custódia**: Acompanhamento de valores retidos em garantia e saque PIX instantâneo para a conta do prestador.
- **Laudo Técnico Antes / Depois**: Upload e documentação fotográfica com garantia legal de 90 dias.

## Como Executar o App do Prestador:
```bash
cd flutter_apps/provider_app
flutter pub get
flutter run
```
*Para rodar no navegador para testes rápidos:*
```bash
flutter run -d chrome
```
*Para apontar para seu Cloudflare Worker de produção:*
```bash
flutter run --dart-define=CLOUDFLARE_API_URL=https://proservicos-backend.<seu-subdominio>.workers.dev
```
