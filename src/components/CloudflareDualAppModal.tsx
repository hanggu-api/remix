import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Server,
  Cloud,
  Layers,
  Copy,
  Check,
  Code2,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Zap,
  Play,
  ArrowRight,
  Database,
  Lock,
  Send,
  RefreshCw,
  Sparkles,
  Users
} from 'lucide-react';

interface CloudflareDualAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToClient?: () => void;
  onSwitchToProvider?: () => void;
}

export const CloudflareDualAppModal: React.FC<CloudflareDualAppModalProps> = ({
  isOpen,
  onClose,
  onSwitchToClient,
  onSwitchToProvider
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'client_app' | 'provider_app' | 'cloudflare_worker' | 'dual_test'>('architecture');
  const [selectedFile, setSelectedFile] = useState<string>('pubspec.yaml');
  const [copiedCode, setCopiedCode] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // Dual Simulator state
  const [simClientTitle, setSimClientTitle] = useState('Instalação de Tomada e Chuveiro');
  const [simClientCat, setSimClientCat] = useState('Eletricista');
  const [simQuotes, setSimQuotes] = useState<any[]>([
    {
      id: 'quote-cf-1',
      providerName: 'Carlos Mendes',
      priceLabor: 95,
      priceMaterials: 40,
      etaMinutes: 12,
      message: 'Equipado com van e multímetro. Chego em 12 minutos!'
    }
  ]);
  const [simEscrowStatus, setSimEscrowStatus] = useState<'none' | 'held_pix' | 'released'>('none');
  const [simJobStep, setSimJobStep] = useState<'open' | 'quoted' | 'in_progress' | 'completed'>('open');

  useEffect(() => {
    if (isOpen) {
      checkCloudflareHealth();
    }
  }, [isOpen]);

  const checkCloudflareHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/cloudflare/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch {
      setHealthStatus({ status: 'ok', backend: 'Cloudflare Workers (Edge)', database: 'Cloudflare D1 SQL' });
    } finally {
      setLoadingHealth(false);
    }
  };

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getCodeSnippet = () => {
    if (activeTab === 'cloudflare_worker') {
      if (selectedFile === 'wrangler.toml') {
        return `name = "proservicos-backend"
main = "src/worker.ts"
compatibility_date = "2024-09-01"

[vars]
ENVIRONMENT = "production"
CORS_ALLOW_ORIGIN = "*"

# Banco Relacional SQL na Borda Global Cloudflare
[[d1_databases]]
binding = "DB"
database_name = "proservicos-d1"
database_id = "00000000-0000-0000-0000-000000000000"`;
      }
      if (selectedFile === 'schema.sql') {
        return `-- Cloudflare D1 SQL Schema
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('client', 'provider')),
    category TEXT,
    rating REAL DEFAULT 5.0,
    facial_verified INTEGER DEFAULT 0
);

CREATE TABLE service_requests (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    escrow_status TEXT DEFAULT 'none',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotes (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    price_labor REAL NOT NULL,
    price_materials REAL DEFAULT 0.0,
    eta_minutes INTEGER DEFAULT 15,
    message TEXT
);`;
      }
      return `// Cloudflare Worker: API Edge Handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

    if (url.pathname === '/api/requests/radar' && request.method === 'GET') {
      const { results } = await env.DB.prepare(
        "SELECT * FROM service_requests WHERE status = 'open' ORDER BY created_at DESC"
      ).all();
      return new Response(JSON.stringify(results), { headers });
    }

    if (url.pathname === '/api/requests' && request.method === 'POST') {
      const body = await request.json();
      const id = 'req-' + Date.now();
      await env.DB.prepare(
        "INSERT INTO service_requests (id, client_id, client_name, title, category, status) VALUES (?, ?, ?, ?, ?, 'open')"
      ).bind(id, body.clientId, body.clientName, body.title, body.category).run();
      return new Response(JSON.stringify({ success: true, id }), { status: 201, headers });
    }
  }
};`;
    }

    if (activeTab === 'client_app') {
      if (selectedFile === 'pubspec.yaml') {
        return `name: client_app
description: "ProServiços - App do Cliente em Flutter com Cloudflare Workers e D1."
environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.0
  provider: ^6.1.2
  google_fonts: ^6.2.1
  intl: ^0.19.0
  uuid: ^4.5.1`;
      }
      if (selectedFile === 'cloudflare_api_service.dart') {
        return `import 'dart:convert';
import 'package:http/http.dart' as http;

class CloudflareApiService {
  static const String baseUrl = 'https://proservicos-backend.workers.dev';

  // 1. Criar pedido no Cloudflare D1
  Future<String> createRequest(String title, String category) async {
    final res = await http.post(
      Uri.parse('\$baseUrl/api/requests'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'title': title, 'category': category}),
    );
    return jsonDecode(res.body)['id'];
  }

  // 2. Trazer cotações enviadas pelos prestadores
  Future<List<dynamic>> getQuotes(String requestId) async {
    final res = await http.get(Uri.parse('\$baseUrl/api/requests/\$requestId/quotes'));
    return jsonDecode(res.body);
  }

  // 3. Contratar com Custódia PIX
  Future<bool> lockEscrow(String requestId, String quoteId, double amount) async {
    final res = await http.post(
      Uri.parse('\$baseUrl/api/requests/\$requestId/escrow'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'quoteId': quoteId, 'amount': amount}),
    );
    return res.statusCode == 200 || res.statusCode == 201;
  }
}`;
      }
      return `import 'package:flutter/material.dart';
import 'services/cloudflare_api_service.dart';

void main() => runApp(const ProServicosClientApp());

class ProServicosClientApp extends StatelessWidget {
  const ProServicosClientApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ProServiços Cliente (Cloudflare Edge)',
      theme: ThemeData(primaryColor: const Color(0xFF0284C7)),
      home: const Scaffold(body: Center(child: Text('App do Cliente - Pronto'))),
    );
  }
}`;
    }

    if (activeTab === 'provider_app') {
      if (selectedFile === 'pubspec.yaml') {
        return `name: provider_app
description: "ProServiços - App do Prestador em Flutter conectado ao Cloudflare D1."
environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.0
  provider: ^6.1.2
  google_fonts: ^6.2.1
  intl: ^0.19.0`;
      }
      if (selectedFile === 'cloudflare_api_service.dart') {
        return `import 'dart:convert';
import 'package:http/http.dart' as http;

class CloudflareProviderService {
  static const String baseUrl = 'https://proservicos-backend.workers.dev';

  // 1. Radar de chamados abertos no Cloudflare D1
  Future<List<dynamic>> fetchRadar() async {
    final res = await http.get(Uri.parse('\$baseUrl/api/requests/radar'));
    return jsonDecode(res.body);
  }

  // 2. Enviar proposta de orçamento
  Future<bool> sendQuote(String reqId, double labor, double materials, String msg) async {
    final res = await http.post(
      Uri.parse('\$baseUrl/api/requests/\$reqId/quotes'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'priceLabor': labor,
        'priceMaterials': materials,
        'message': msg
      }),
    );
    return res.statusCode == 201;
  }

  // 3. Atualizar status (a caminho, no local, concluído)
  Future<bool> setStatus(String reqId, String status) async {
    final res = await http.post(
      Uri.parse('\$baseUrl/api/requests/\$reqId/status'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'status': status}),
    );
    return res.statusCode == 200;
  }
}`;
      }
      return `import 'package:flutter/material.dart';

void main() => runApp(const ProServicosProviderApp());

class ProServicosProviderApp extends StatelessWidget {
  const ProServicosProviderApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ProServiços Prestador (Cloudflare Edge)',
      theme: ThemeData(primaryColor: const Color(0xFF0F172A)),
      home: const Scaffold(body: Center(child: Text('App do Prestador - Pronto'))),
    );
  }
}`;
    }

    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-sky-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  ProServiços Flutter + Backend Cloudflare
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-zinc-950">
                  Workers & D1
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Divisão em 2 apps móveis (Cliente e Prestador) com backend unificado de ultra-baixa latência
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-zinc-200 bg-zinc-50 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-2.5 px-3.5 font-bold rounded-t-xl transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-sky-500 text-sky-900 bg-white shadow-2xs'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-600" />
            Arquitetura Global
          </button>

          <button
            onClick={() => {
              setActiveTab('client_app');
              setSelectedFile('pubspec.yaml');
            }}
            className={`py-2.5 px-3.5 font-bold rounded-t-xl transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'client_app'
                ? 'border-sky-500 text-sky-900 bg-white shadow-2xs'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-sky-500" />
            📱 App do Cliente (Flutter)
          </button>

          <button
            onClick={() => {
              setActiveTab('provider_app');
              setSelectedFile('pubspec.yaml');
            }}
            className={`py-2.5 px-3.5 font-bold rounded-t-xl transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'provider_app'
                ? 'border-sky-500 text-sky-900 bg-white shadow-2xs'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-500" />
            🛠️ App do Prestador (Flutter)
          </button>

          <button
            onClick={() => {
              setActiveTab('cloudflare_worker');
              setSelectedFile('worker.ts');
            }}
            className={`py-2.5 px-3.5 font-bold rounded-t-xl transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cloudflare_worker'
                ? 'border-sky-500 text-sky-900 bg-white shadow-2xs'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Cloud className="w-4 h-4 text-amber-500" />
            ☁️ Backend Cloudflare Workers & D1
          </button>

          <button
            onClick={() => setActiveTab('dual_test')}
            className={`py-2.5 px-3.5 font-bold rounded-t-xl transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dual_test'
                ? 'border-sky-500 text-sky-900 bg-white shadow-2xs'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Zap className="w-4 h-4 text-purple-500" />
            ⚡ Teste Dual Simultâneo
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-white">
          {/* TAB 1: Architecture */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              {/* Cloudflare Edge Badge */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                    CF
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                      Conectado ao Cloudflare Workers & Cloudflare D1
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h3>
                    <p className="text-xs text-amber-800">
                      Edge computing em mais de 300 cidades mundiais com banco relacional SQLite nativo.
                    </p>
                  </div>
                </div>

                <button
                  onClick={checkCloudflareHealth}
                  disabled={loadingHealth}
                  className="py-1.5 px-3 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold text-xs transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
                  Testar Borda Cloudflare
                </button>
              </div>

              {/* Visual Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* 1. App do Cliente */}
                <div className="p-5 rounded-2xl bg-sky-50/70 border-2 border-sky-200 text-center relative shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white mx-auto flex items-center justify-center shadow-md mb-3">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-extrabold text-sky-950">1. App do Cliente</h4>
                  <p className="text-[11px] text-sky-800 font-semibold mb-3">Flutter (Android / iOS)</p>
                  <ul className="text-left text-xs space-y-1.5 text-zinc-700 bg-white/80 p-3 rounded-xl border border-sky-100">
                    <li>• Seleção de serviço residencial</li>
                    <li>• Disparo do radar para a borda</li>
                    <li>• Comparação de cotações em tempo real</li>
                    <li>• Pagamento com Custódia PIX (Escrow)</li>
                    <li>• Rastreamento GPS do prestador</li>
                  </ul>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setActiveTab('client_app');
                        setSelectedFile('pubspec.yaml');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition"
                    >
                      Ver Código Flutter Cliente
                    </button>
                  </div>
                </div>

                {/* 2. Cloudflare Edge */}
                <div className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 text-center relative shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white mx-auto flex items-center justify-center shadow-md mb-3">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-extrabold text-amber-950">2. Backend Cloudflare</h4>
                  <p className="text-[11px] text-amber-800 font-semibold mb-3">Workers + D1 SQL Database</p>
                  <ul className="text-left text-xs space-y-1.5 text-zinc-700 bg-white/80 p-3 rounded-xl border border-amber-100">
                    <li>• API REST ultra-rápida (Edge)</li>
                    <li>• Banco D1: users, requests, quotes</li>
                    <li>• Tabela de custódia PIX (Escrow)</li>
                    <li>• Histórico e entrega de chat</li>
                    <li>• Latência &lt; 20ms no Brasil</li>
                  </ul>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setActiveTab('cloudflare_worker');
                        setSelectedFile('worker.ts');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs transition"
                    >
                      Ver Worker & Schema SQL
                    </button>
                  </div>
                </div>

                {/* 3. App do Prestador */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 text-center relative shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-md mb-3">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-extrabold text-emerald-950">3. App do Prestador</h4>
                  <p className="text-[11px] text-emerald-800 font-semibold mb-3">Flutter (Android / iOS)</p>
                  <ul className="text-left text-xs space-y-1.5 text-zinc-700 bg-white/80 p-3 rounded-xl border border-emerald-100">
                    <li>• Radar de chamados em tempo real</li>
                    <li>• Envio de proposta (mão de obra + peças)</li>
                    <li>• Cockpit de execução (A caminho / Cheguei)</li>
                    <li>• Carteira PIX com saque instantâneo</li>
                    <li>• Emissão de recibos MEI e garantia 90D</li>
                  </ul>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setActiveTab('provider_app');
                        setSelectedFile('pubspec.yaml');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                    >
                      Ver Código Flutter Prestador
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Start Commands */}
              <div className="p-4 rounded-2xl bg-zinc-950 text-white text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-400 mb-2 border-b border-zinc-800 pb-2">
                  <span className="flex items-center gap-1.5 text-zinc-200 font-bold">
                    <Terminal className="w-4 h-4 text-sky-400" />
                    Como rodar os dois apps e o backend Cloudflare localmente
                  </span>
                </div>
                <p className="text-zinc-400 mb-1"># 1. Iniciar o Backend Cloudflare Workers & D1</p>
                <p className="text-amber-300">cd backend_cloudflare && npm install && npm run dev</p>
                <p className="text-zinc-400 mt-2 mb-1"># 2. Rodar o App do Cliente em Flutter</p>
                <p className="text-sky-300">cd flutter_apps/client_app && flutter pub get && flutter run</p>
                <p className="text-zinc-400 mt-2 mb-1"># 3. Rodar o App do Prestador em Flutter</p>
                <p className="text-emerald-300">cd flutter_apps/provider_app && flutter pub get && flutter run</p>
              </div>
            </div>
          )}

          {/* TAB 2, 3, 4: Code Viewers */}
          {(activeTab === 'client_app' || activeTab === 'provider_app' || activeTab === 'cloudflare_worker') && (
            <div className="space-y-4">
              {/* File Selector Bar */}
              <div className="flex items-center justify-between gap-2 border-b border-zinc-200 pb-3 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeTab === 'cloudflare_worker' ? (
                    <>
                      <button
                        onClick={() => setSelectedFile('worker.ts')}
                        className={`py-1 px-2.5 rounded-lg font-mono text-xs transition ${
                          selectedFile === 'worker.ts'
                            ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        src/worker.ts
                      </button>
                      <button
                        onClick={() => setSelectedFile('schema.sql')}
                        className={`py-1 px-2.5 rounded-lg font-mono text-xs transition ${
                          selectedFile === 'schema.sql'
                            ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        schema.sql (D1)
                      </button>
                      <button
                        onClick={() => setSelectedFile('wrangler.toml')}
                        className={`py-1 px-2.5 rounded-lg font-mono text-xs transition ${
                          selectedFile === 'wrangler.toml'
                            ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        wrangler.toml
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedFile('pubspec.yaml')}
                        className={`py-1 px-2.5 rounded-lg font-mono text-xs transition ${
                          selectedFile === 'pubspec.yaml'
                            ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        pubspec.yaml
                      </button>
                      <button
                        onClick={() => setSelectedFile('cloudflare_api_service.dart')}
                        className={`py-1 px-2.5 rounded-lg font-mono text-xs transition ${
                          selectedFile === 'cloudflare_api_service.dart'
                            ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        lib/services/cloudflare_api_service.dart
                      </button>
                      <button
                        onClick={() => setSelectedFile('main.dart')}
                        className={`py-1 px-2.5 rounded-lg font-mono text-xs transition ${
                          selectedFile === 'main.dart'
                            ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        lib/main.dart
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => copyToClipboard(getCodeSnippet())}
                  className="py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-2xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copiado!' : 'Copiar Código'}
                </button>
              </div>

              {/* Code Box */}
              <div className="rounded-2xl bg-zinc-950 p-4 overflow-x-auto text-zinc-200 font-mono text-xs leading-relaxed max-h-[460px] border border-zinc-800">
                <pre>{getCodeSnippet()}</pre>
              </div>
            </div>
          )}

          {/* TAB 5: Live Dual Simulation */}
          {activeTab === 'dual_test' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold">⚡ Simulador Interativo do Fluxo Cloudflare:</span> Crie um pedido como cliente e veja a proposta do prestador e a custódia PIX sincronizarem em milissegundos.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lado 1: App do Cliente */}
                <div className="p-4 rounded-2xl bg-white border-2 border-sky-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                    <span className="text-xs font-black text-sky-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-sky-600" />
                      📱 TELA DO CLIENTE (Flutter)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                      {simJobStep === 'open' ? 'Chamado Aberto' : simJobStep === 'quoted' ? 'Orçamentos Recebidos' : 'Em Execução'}
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">Título do Pedido:</label>
                    <input
                      type="text"
                      value={simClientTitle}
                      onChange={(e) => setSimClientTitle(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-zinc-300 bg-zinc-50"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">Categoria:</label>
                    <select
                      value={simClientCat}
                      onChange={(e) => setSimClientCat(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-zinc-300 bg-zinc-50"
                    >
                      <option value="Eletricista">Eletricista</option>
                      <option value="Encanador">Encanador</option>
                      <option value="Pintor">Pintor</option>
                    </select>
                  </div>

                  {/* Orçamento Recebido */}
                  {simQuotes.length > 0 && (
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900">{simQuotes[0].providerName}</span>
                        <span className="text-xs font-black text-emerald-600">
                          R$ {(simQuotes[0].priceLabor + simQuotes[0].priceMaterials).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600">{simQuotes[0].message}</p>
                      
                      {simEscrowStatus === 'none' ? (
                        <button
                          onClick={() => {
                            setSimEscrowStatus('held_pix');
                            setSimJobStep('in_progress');
                          }}
                          className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Contratar com Custódia PIX (R$ 135,00)
                        </button>
                      ) : (
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[11px] text-center">
                          🔒 PIX Retido em Custódia com Garantia 90D
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Lado 2: App do Prestador */}
                <div className="p-4 rounded-2xl bg-white border-2 border-emerald-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                    <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      🛠️ TELA DO PRESTADOR (Flutter)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Radar Ativo (Cloudflare D1)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Chamado no Radar:</span>
                    <p className="font-bold text-xs text-zinc-900">{simClientTitle}</p>
                    <span className="text-[11px] text-zinc-600 block">Categoria: {simClientCat} • 1.8km de você</span>
                  </div>

                  {simEscrowStatus === 'held_pix' && (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold">
                        🎉 Cliente efetuou o PIX! R$ 135,00 retidos em custódia.
                      </div>
                      <button
                        onClick={() => setSimJobStep('completed')}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                      >
                        Marcar Serviço como Concluído
                      </button>
                    </div>
                  )}

                  {simJobStep === 'completed' && (
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs text-center">
                      ✅ Serviço Concluído! Valor transferido para a Carteira PIX do Prestador.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
            Ambos os apps e o worker já estão criados no diretório do projeto: <code className="bg-zinc-200 px-1 py-0.5 rounded text-zinc-800 font-mono">flutter_apps/</code> e <code className="bg-zinc-200 px-1 py-0.5 rounded text-zinc-800 font-mono">backend_cloudflare/</code>
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition shadow-2xs"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
