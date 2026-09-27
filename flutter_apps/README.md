# Arquitetura Multi-App Flutter com Backend Comum no Cloud Firestore

Este repositório contém a separação completa da plataforma em **dois aplicativos móveis Flutter independentes** compartilhando um **backend unificado no Google Cloud Firestore**:

```
flutter_apps/
├── client_app/             # 📱 App do Cliente (Flutter)
│   ├── lib/
│   │   ├── main.dart
│   │   ├── firebase_options.dart
│   │   ├── models/models.dart
│   │   ├── services/
│   │   │   ├── firestore_service.dart
│   │   │   └── auth_service.dart
│   │   └── screens/
│   │       ├── client_main_screen.dart
│   │       ├── client_request_screen.dart
│   │       ├── client_quotes_screen.dart
│   │       ├── client_tracking_screen.dart
│   │       └── client_chat_screen.dart
│   └── pubspec.yaml
│
├── provider_app/           # 🛠️ App do Prestador (Flutter)
│   ├── lib/
│   │   ├── main.dart
│   │   ├── firebase_options.dart
│   │   ├── models/models.dart
│   │   ├── services/
│   │   │   ├── firestore_service.dart
│   │   │   └── auth_service.dart
│   │   └── screens/
│   │       ├── provider_main_screen.dart
│   │       ├── provider_radar_screen.dart
│   │       ├── provider_active_job_screen.dart
│   │       ├── provider_finance_screen.dart
│   │       └── provider_chat_screen.dart
│   └── pubspec.yaml
│
└── shared_backend/         # ☁️ Backend Compartilhado (Cloud Firestore & Firebase Auth)
    ├── firestore_schema.json
    ├── firestore.rules
    └── README.md
```

## Como funciona a sincronização em tempo real (Cloud Firestore):
1. **Cliente cria chamado**: Salva na coleção `/requests/{requestId}` com status `open`.
2. **Radar do Prestador toca**: O App do Prestador ouve a query `/requests` onde `status == 'open'` em tempo real (`snapshots()`).
3. **Prestador envia orçamento**: Cria um documento na subcoleção `/requests/{requestId}/quotes/{quoteId}` com valor de mão de obra e materiais.
4. **Cliente compara e contrata**: O App do Cliente ouve as quotes em tempo real, visualiza badges de verificação (facial + documentos), escolhe o melhor e efetua pagamento em **Custódia PIX** (`/escrow_transactions`).
5. **Execução e GPS**: O Prestador marca "A caminho" / "Cheguei", transmitindo coordenadas GPS atualizadas. O Cliente acompanha na tela estilo Uber.
6. **Chat Unificado**: Mensagens enviadas em `/requests/{requestId}/messages` chegam instantaneamente nos dois apps.
7. **Finalização e Liberação PIX**: O Cliente confirma conclusão ou avalia o serviço, liberando o valor da custódia para a carteira do Prestador.
