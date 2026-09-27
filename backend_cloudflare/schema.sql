-- Schema SQL para Cloudflare D1 (SQLite na Borda)
-- ProServiços: Backend unificado para App do Cliente e App do Prestador

-- 1. Usuários (Clientes e Prestadores)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK(role IN ('client', 'provider', 'admin')),
    category TEXT,
    avatar_url TEXT,
    rating REAL DEFAULT 5.0,
    jobs_count INTEGER DEFAULT 0,
    facial_verified INTEGER DEFAULT 0,
    document_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Pedidos de Serviço (Acionamento pelo Cliente / Radar dos Prestadores)
CREATE TABLE IF NOT EXISTS service_requests (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'quotes_received', 'in_progress', 'completed', 'cancelled')),
    client_address TEXT,
    lat REAL,
    lng REAL,
    selected_quote_id TEXT,
    selected_provider_id TEXT,
    selected_provider_name TEXT,
    agreed_price REAL,
    escrow_status TEXT DEFAULT 'none' CHECK(escrow_status IN ('none', 'held_pix', 'released', 'refunded')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id)
);

-- 3. Cotações / Orçamentos Enviados pelos Prestadores
CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    provider_avatar TEXT,
    provider_phone TEXT,
    provider_rating REAL DEFAULT 5.0,
    provider_jobs_count INTEGER DEFAULT 0,
    facial_verified INTEGER DEFAULT 0,
    doc_verified INTEGER DEFAULT 0,
    price_labor REAL NOT NULL,
    price_materials REAL DEFAULT 0.0,
    eta_minutes INTEGER DEFAULT 15,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES service_requests(id),
    FOREIGN KEY (provider_id) REFERENCES users(id)
);

-- 4. Transações de Custódia PIX (Escrow de Proteção ao Consumidor e Prestador)
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    amount_labor REAL NOT NULL,
    amount_materials REAL DEFAULT 0.0,
    total_amount REAL NOT NULL,
    pix_end_to_end_id TEXT,
    status TEXT NOT NULL DEFAULT 'held_in_custody' CHECK(status IN ('held_in_custody', 'released_to_provider', 'refunded_to_client')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    released_at DATETIME,
    FOREIGN KEY (request_id) REFERENCES service_requests(id)
);

-- 5. Mensagens do Chat em Tempo Real
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL CHECK(sender_role IN ('client', 'provider')),
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES service_requests(id)
);

-- Índices para alta performance nas buscas do radar e chat
CREATE INDEX IF NOT EXISTS idx_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_category ON service_requests(category);
CREATE INDEX IF NOT EXISTS idx_quotes_request ON quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_chat_request ON chat_messages(request_id);

-- Dados Iniciais para Demonstração Imediata
INSERT OR IGNORE INTO users (id, name, email, phone, role, category, avatar_url, rating, jobs_count, facial_verified, document_verified)
VALUES 
('client-1', 'Ana Clara Souza', 'ana.souza@exemplo.com', '(11) 98765-4321', 'client', NULL, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 5.0, 4, 1, 1),
('prov-1', 'Carlos Mendes', 'carlos.mendes@exemplo.com', '(11) 97123-4567', 'provider', 'Eletricista', 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150', 4.95, 142, 1, 1),
('prov-2', 'Marcos Silva', 'marcos.silva@exemplo.com', '(11) 98877-6655', 'provider', 'Eletricista', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 4.88, 88, 1, 1);

INSERT OR IGNORE INTO service_requests (id, client_id, client_name, client_phone, title, description, category, status, client_address, lat, lng, agreed_price, escrow_status)
VALUES 
('req-1', 'client-1', 'Ana Clara Souza', '(11) 98765-4321', 'Instalação de Tomada 20A e Chuveiro', 'Troca de fiação no banheiro suíte e instalação de disjuntor bipolar.', 'Eletricista', 'open', 'Rua Fradique Coutinho, 1240 - Pinheiros, São Paulo - SP', -23.5617, -46.6865, 140.0, 'none');

INSERT OR IGNORE INTO quotes (id, request_id, provider_id, provider_name, provider_avatar, provider_phone, provider_rating, provider_jobs_count, facial_verified, doc_verified, price_labor, price_materials, eta_minutes, message)
VALUES
('quote-1', 'req-1', 'prov-1', 'Carlos Mendes', 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150', '(11) 97123-4567', 4.95, 142, 1, 1, 95.0, 45.0, 12, 'Estou a 2km com peças e multímetro na van. Posso chegar em 12 minutos.'),
('quote-2', 'req-1', 'prov-2', 'Marcos Silva', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '(11) 98877-6655', 4.88, 88, 1, 1, 110.0, 0.0, 20, 'Disponível imediatamente. Garantia total por 90 dias.');
