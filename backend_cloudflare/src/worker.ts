import { Env, ServiceRequest, Quote, ChatMessage, EscrowTransaction, User, ExecutionContext } from './types';

// In-memory fallback para dev / simulador quando o D1 local não estiver conectado
const mockDb = {
  users: [
    {
      id: 'client-1',
      name: 'Ana Clara Souza',
      email: 'ana.souza@exemplo.com',
      phone: '(11) 98765-4321',
      role: 'client' as const,
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      rating: 5.0,
      jobs_count: 4,
      facial_verified: 1,
      document_verified: 1
    },
    {
      id: 'prov-1',
      name: 'Carlos Mendes',
      email: 'carlos.mendes@exemplo.com',
      phone: '(11) 97123-4567',
      role: 'provider' as const,
      category: 'Eletricista',
      avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
      rating: 4.95,
      jobs_count: 142,
      facial_verified: 1,
      document_verified: 1
    },
    {
      id: 'prov-2',
      name: 'Marcos Silva',
      email: 'marcos.silva@exemplo.com',
      phone: '(11) 98877-6655',
      role: 'provider' as const,
      category: 'Eletricista',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 4.88,
      jobs_count: 88,
      facial_verified: 1,
      document_verified: 1
    }
  ] as User[],
  requests: [
    {
      id: 'req-1',
      client_id: 'client-1',
      client_name: 'Ana Clara Souza',
      client_phone: '(11) 98765-4321',
      title: 'Instalação de Tomada 20A e Chuveiro',
      description: 'Troca de fiação no banheiro suíte e instalação de disjuntor bipolar.',
      category: 'Eletricista',
      status: 'open' as const,
      client_address: 'Rua Fradique Coutinho, 1240 - Pinheiros, São Paulo - SP',
      lat: -23.5617,
      lng: -46.6865,
      agreed_price: 140.0,
      escrow_status: 'none' as const,
      created_at: new Date().toISOString()
    }
  ] as ServiceRequest[],
  quotes: [
    {
      id: 'quote-1',
      request_id: 'req-1',
      provider_id: 'prov-1',
      provider_name: 'Carlos Mendes',
      provider_avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
      provider_phone: '(11) 97123-4567',
      provider_rating: 4.95,
      provider_jobs_count: 142,
      facial_verified: 1,
      doc_verified: 1,
      price_labor: 95.0,
      price_materials: 45.0,
      eta_minutes: 12,
      message: 'Estou a 2km com peças e multímetro na van. Posso chegar em 12 minutos.',
      status: 'pending' as const,
      created_at: new Date().toISOString()
    },
    {
      id: 'quote-2',
      request_id: 'req-1',
      provider_id: 'prov-2',
      provider_name: 'Marcos Silva',
      provider_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      provider_phone: '(11) 98877-6655',
      provider_rating: 4.88,
      provider_jobs_count: 88,
      facial_verified: 1,
      doc_verified: 1,
      price_labor: 110.0,
      price_materials: 0.0,
      eta_minutes: 20,
      message: 'Disponível imediatamente. Garantia total por 90 dias.',
      status: 'pending' as const,
      created_at: new Date().toISOString()
    }
  ] as Quote[],
  messages: [] as ChatMessage[],
  escrows: [] as EscrowTransaction[]
};

function corsHeaders(env: Env) {
  return {
    'Access-Control-Allow-Origin': env.CORS_ALLOW_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const headers = corsHeaders(env);

    // Tratamento de CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    try {
      const path = url.pathname;

      // 1. Healthcheck
      if (path === '/api/health') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            backend: 'Cloudflare Workers',
            database: env.DB ? 'Cloudflare D1 (Connected)' : 'Cloudflare Worker Memory (Local/Dev)',
            region: (request as any).cf?.colo || 'SAO (São Paulo Edge)',
            timestamp: new Date().toISOString()
          }),
          { status: 200, headers }
        );
      }

      // 2. Pedidos - Buscar pedidos abertos no Radar dos Prestadores (App Prestador)
      if (path === '/api/requests/radar' && request.method === 'GET') {
        if (env.DB) {
          const { results } = await env.DB.prepare(
            `SELECT * FROM service_requests WHERE status IN ('open', 'quotes_received') ORDER BY created_at DESC LIMIT 20`
          ).all();
          return new Response(JSON.stringify(results), { status: 200, headers });
        }
        return new Response(JSON.stringify(mockDb.requests), { status: 200, headers });
      }

      // 3. Criar Novo Pedido (App Cliente)
      if (path === '/api/requests' && request.method === 'POST') {
        const body: any = await request.json();
        const id = `req-${Date.now()}`;
        const newReq: ServiceRequest = {
          id,
          client_id: body.clientId || 'client-1',
          client_name: body.clientName || 'Cliente',
          client_phone: body.clientPhone || '',
          title: body.title,
          description: body.description || '',
          category: body.category || 'Geral',
          status: 'open',
          client_address: body.address || 'São Paulo - SP',
          lat: body.lat || -23.5617,
          lng: body.lng || -46.6865,
          agreed_price: body.price || 0,
          escrow_status: 'none',
          created_at: new Date().toISOString()
        };

        if (env.DB) {
          await env.DB.prepare(
            `INSERT INTO service_requests (id, client_id, client_name, client_phone, title, description, category, status, client_address, lat, lng, agreed_price, escrow_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
            .bind(
              newReq.id,
              newReq.client_id,
              newReq.client_name,
              newReq.client_phone,
              newReq.title,
              newReq.description,
              newReq.category,
              newReq.status,
              newReq.client_address,
              newReq.lat,
              newReq.lng,
              newReq.agreed_price,
              newReq.escrow_status
            )
            .run();
        } else {
          mockDb.requests.unshift(newReq);
        }

        return new Response(JSON.stringify({ success: true, request: newReq }), {
          status: 201,
          headers
        });
      }

      // 4. Buscar detalhes de um pedido
      const requestMatch = path.match(/^\/api\/requests\/([a-zA-Z0-9_-]+)$/);
      if (requestMatch && request.method === 'GET') {
        const reqId = requestMatch[1];
        if (env.DB) {
          const req = await env.DB.prepare('SELECT * FROM service_requests WHERE id = ?')
            .bind(reqId)
            .first();
          if (!req) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
          return new Response(JSON.stringify(req), { status: 200, headers });
        }
        const req = mockDb.requests.find((r) => r.id === reqId) || mockDb.requests[0];
        return new Response(JSON.stringify(req), { status: 200, headers });
      }

      // 5. Cotações - Listar cotações de um pedido (App Cliente)
      const quotesMatch = path.match(/^\/api\/requests\/([a-zA-Z0-9_-]+)\/quotes$/);
      if (quotesMatch && request.method === 'GET') {
        const reqId = quotesMatch[1];
        if (env.DB) {
          const { results } = await env.DB.prepare(
            'SELECT * FROM quotes WHERE request_id = ? ORDER BY price_labor ASC'
          )
            .bind(reqId)
            .all();
          return new Response(JSON.stringify(results), { status: 200, headers });
        }
        const qList = mockDb.quotes.filter((q) => q.request_id === reqId);
        return new Response(JSON.stringify(qList.length > 0 ? qList : mockDb.quotes), {
          status: 200,
          headers
        });
      }

      // 6. Cotações - Enviar nova cotação (App Prestador)
      if (quotesMatch && request.method === 'POST') {
        const reqId = quotesMatch[1];
        const body: any = await request.json();
        const quoteId = `quote-${Date.now()}`;
        const newQuote: Quote = {
          id: quoteId,
          request_id: reqId,
          provider_id: body.providerId || 'prov-1',
          provider_name: body.providerName || 'Prestador',
          provider_avatar: body.providerAvatar,
          provider_phone: body.providerPhone || '',
          provider_rating: body.providerRating || 5.0,
          provider_jobs_count: body.providerJobsCount || 50,
          facial_verified: body.facialVerified ? 1 : 0,
          doc_verified: body.docVerified ? 1 : 0,
          price_labor: body.priceLabor || body.price || 80.0,
          price_materials: body.priceMaterials || 0.0,
          eta_minutes: body.etaMinutes || 15,
          message: body.message || 'Pronto para atender!',
          status: 'pending',
          created_at: new Date().toISOString()
        };

        if (env.DB) {
          await env.DB.prepare(
            `INSERT INTO quotes (id, request_id, provider_id, provider_name, provider_avatar, provider_phone, provider_rating, provider_jobs_count, facial_verified, doc_verified, price_labor, price_materials, eta_minutes, message, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
            .bind(
              newQuote.id,
              newQuote.request_id,
              newQuote.provider_id,
              newQuote.provider_name,
              newQuote.provider_avatar,
              newQuote.provider_phone,
              newQuote.provider_rating,
              newQuote.provider_jobs_count,
              newQuote.facial_verified,
              newQuote.doc_verified,
              newQuote.price_labor,
              newQuote.price_materials,
              newQuote.eta_minutes,
              newQuote.message,
              newQuote.status
            )
            .run();
        } else {
          mockDb.quotes.unshift(newQuote);
        }

        return new Response(JSON.stringify({ success: true, quote: newQuote }), {
          status: 201,
          headers
        });
      }

      // 7. Custódia PIX - Fechar contratação com valor retido (App Cliente)
      const escrowMatch = path.match(/^\/api\/requests\/([a-zA-Z0-9_-]+)\/escrow$/);
      if (escrowMatch && request.method === 'POST') {
        const reqId = escrowMatch[1];
        const body: any = await request.json();
        const escrowId = `escrow-${Date.now()}`;
        const newEscrow: EscrowTransaction = {
          id: escrowId,
          request_id: reqId,
          client_id: body.clientId || 'client-1',
          provider_id: body.providerId || 'prov-1',
          amount_labor: body.amountLabor || 95.0,
          amount_materials: body.amountMaterials || 0.0,
          total_amount: (body.amountLabor || 95.0) + (body.amountMaterials || 0.0),
          pix_end_to_end_id: body.pixEndToEndId || `E0041699${Date.now()}`,
          status: 'held_in_custody',
          created_at: new Date().toISOString()
        };

        if (env.DB) {
          await env.DB.prepare(
            `INSERT INTO escrow_transactions (id, request_id, client_id, provider_id, amount_labor, amount_materials, total_amount, pix_end_to_end_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
            .bind(
              newEscrow.id,
              newEscrow.request_id,
              newEscrow.client_id,
              newEscrow.provider_id,
              newEscrow.amount_labor,
              newEscrow.amount_materials,
              newEscrow.total_amount,
              newEscrow.pix_end_to_end_id,
              newEscrow.status
            )
            .run();

          await env.DB.prepare(
            `UPDATE service_requests SET status = 'in_progress', escrow_status = 'held_pix', selected_quote_id = ? WHERE id = ?`
          )
            .bind(body.quoteId || '', reqId)
            .run();
        } else {
          mockDb.escrows.unshift(newEscrow);
          const req = mockDb.requests.find((r) => r.id === reqId);
          if (req) {
            req.status = 'in_progress';
            req.escrow_status = 'held_pix';
          }
        }

        return new Response(JSON.stringify({ success: true, escrow: newEscrow }), {
          status: 201,
          headers
        });
      }

      // 8. Atualizar Status do Serviço (A caminho, Cheguei, Em andamento, Concluído)
      const statusMatch = path.match(/^\/api\/requests\/([a-zA-Z0-9_-]+)\/status$/);
      if (statusMatch && request.method === 'POST') {
        const reqId = statusMatch[1];
        const body: any = await request.json();
        const newStatus = body.status;

        if (env.DB) {
          await env.DB.prepare('UPDATE service_requests SET status = ? WHERE id = ?')
            .bind(newStatus, reqId)
            .run();
        } else {
          const req = mockDb.requests.find((r) => r.id === reqId);
          if (req) req.status = newStatus;
        }

        return new Response(JSON.stringify({ success: true, status: newStatus }), {
          status: 200,
          headers
        });
      }

      // 9. Liberação de Custódia PIX após aprovação do Cliente
      const releaseMatch = path.match(/^\/api\/requests\/([a-zA-Z0-9_-]+)\/release$/);
      if (releaseMatch && request.method === 'POST') {
        const reqId = releaseMatch[1];
        if (env.DB) {
          await env.DB.prepare(
            `UPDATE escrow_transactions SET status = 'released_to_provider', released_at = CURRENT_TIMESTAMP WHERE request_id = ?`
          )
            .bind(reqId)
            .run();
          await env.DB.prepare(
            `UPDATE service_requests SET status = 'completed', escrow_status = 'released' WHERE id = ?`
          )
            .bind(reqId)
            .run();
        } else {
          const esc = mockDb.escrows.find((e) => e.request_id === reqId);
          if (esc) {
            esc.status = 'released_to_provider';
            esc.released_at = new Date().toISOString();
          }
          const req = mockDb.requests.find((r) => r.id === reqId);
          if (req) {
            req.status = 'completed';
            req.escrow_status = 'released';
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Custódia PIX liberada com sucesso para o prestador!'
          }),
          { status: 200, headers }
        );
      }

      // 10. Chat do Serviço
      const chatMatch = path.match(/^\/api\/requests\/([a-zA-Z0-9_-]+)\/messages$/);
      if (chatMatch) {
        const reqId = chatMatch[1];
        if (request.method === 'GET') {
          if (env.DB) {
            const { results } = await env.DB.prepare(
              'SELECT * FROM chat_messages WHERE request_id = ? ORDER BY created_at ASC'
            )
              .bind(reqId)
              .all();
            return new Response(JSON.stringify(results), { status: 200, headers });
          }
          const msgs = mockDb.messages.filter((m) => m.request_id === reqId);
          return new Response(JSON.stringify(msgs), { status: 200, headers });
        }

        if (request.method === 'POST') {
          const body: any = await request.json();
          const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            request_id: reqId,
            sender_id: body.senderId || 'user-1',
            sender_name: body.senderName || 'Usuário',
            sender_role: body.senderRole || 'client',
            text: body.text,
            created_at: new Date().toISOString()
          };

          if (env.DB) {
            await env.DB.prepare(
              `INSERT INTO chat_messages (id, request_id, sender_id, sender_name, sender_role, text) VALUES (?, ?, ?, ?, ?, ?)`
            )
              .bind(
                newMsg.id,
                newMsg.request_id,
                newMsg.sender_id,
                newMsg.sender_name,
                newMsg.sender_role,
                newMsg.text
              )
              .run();
          } else {
            mockDb.messages.push(newMsg);
          }

          return new Response(JSON.stringify({ success: true, message: newMsg }), {
            status: 201,
            headers
          });
        }
      }

      // Rota não encontrada
      return new Response(
        JSON.stringify({ error: 'Endpoint não encontrado', path }),
        { status: 404, headers }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message || 'Internal Worker Error' }),
        { status: 500, headers }
      );
    }
  }
};
