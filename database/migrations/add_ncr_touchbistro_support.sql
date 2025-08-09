-- Migration: Add NCR Aloha and TouchBistro POS Support
-- This extends your existing POS integration tables

-- Add new POS types to existing enum (if you have one)
-- ALTER TYPE pos_type ADD VALUE 'ncr_aloha';
-- ALTER TYPE pos_type ADD VALUE 'touchbistro';

-- Or if using VARCHAR, these are the new types to support:
-- 'ncr_aloha', 'touchbistro'

-- Extend existing pos_integrations table for OAuth support (NCR Aloha)
ALTER TABLE pos_integrations 
ADD COLUMN oauth_access_token TEXT,
ADD COLUMN oauth_refresh_token TEXT,
ADD COLUMN oauth_token_expires_at TIMESTAMP,
ADD COLUMN oauth_scope VARCHAR(255),
ADD COLUMN partner_id VARCHAR(255), -- For TouchBistro
ADD COLUMN site_id VARCHAR(255), -- NCR site ID
ADD COLUMN location_id VARCHAR(255); -- TouchBistro location ID

-- Add table for OAuth token management (NCR Aloha specific)
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id SERIAL PRIMARY KEY,
    pos_integration_id INTEGER REFERENCES pos_integrations(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP NOT NULL,
    scope VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add polling management table (TouchBistro specific)
CREATE TABLE IF NOT EXISTS polling_status (
    id SERIAL PRIMARY KEY,
    pos_integration_id INTEGER REFERENCES pos_integrations(id) ON DELETE CASCADE,
    order_id VARCHAR(255) NOT NULL,
    last_poll_at TIMESTAMP DEFAULT NOW(),
    poll_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add webhook signatures table (for webhook verification)
CREATE TABLE IF NOT EXISTS webhook_signatures (
    id SERIAL PRIMARY KEY,
    pos_type VARCHAR(50) NOT NULL,
    webhook_secret VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default webhook secrets (you'll update these with real values)
INSERT INTO webhook_signatures (pos_type, webhook_secret) VALUES
('square', 'your_square_webhook_secret'),
('clover', 'your_clover_webhook_secret'),
('ncr_aloha', 'your_ncr_webhook_secret')
ON CONFLICT DO NOTHING;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_integration_id ON oauth_tokens(pos_integration_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires_at ON oauth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_polling_status_integration_id ON polling_status(pos_integration_id);
CREATE INDEX IF NOT EXISTS idx_polling_status_order_id ON polling_status(order_id);
CREATE INDEX IF NOT EXISTS idx_polling_status_active ON polling_status(is_active);

-- Add some helpful views
CREATE OR REPLACE VIEW active_pos_integrations AS
SELECT 
    pi.*,
    ot.access_token,
    ot.expires_at as token_expires_at,
    CASE 
        WHEN pi.pos_type = 'ncr_aloha' AND ot.expires_at < NOW() + INTERVAL '5 minutes' THEN true
        ELSE false
    END as needs_token_refresh
FROM pos_integrations pi
LEFT JOIN oauth_tokens ot ON pi.id = ot.pos_integration_id
WHERE pi.is_active = true;

-- Update existing orders table if needed (add columns for new POS types)
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS pos_site_id VARCHAR(255);
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS pos_location_id VARCHAR(255);