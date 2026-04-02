-- Create usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    preferences JSONB DEFAULT '{}',
    email_3days BOOLEAN DEFAULT true,
    email_7days BOOLEAN DEFAULT true,
    email_14days BOOLEAN DEFAULT true,
    last_activity TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create historial table
CREATE TABLE IF NOT EXISTS historial (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usuario_preferencias table
CREATE TABLE IF NOT EXISTS usuario_preferencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    preferences JSONB DEFAULT '{}',
    theme VARCHAR(50) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'es',
    notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_historial_user_id ON historial(user_id);
CREATE INDEX IF NOT EXISTS idx_historial_created_at ON historial(created_at);
CREATE INDEX IF NOT EXISTS idx_historial_action ON historial(action);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_last_activity ON usuarios(last_activity);
CREATE INDEX IF NOT EXISTS idx_usuario_preferencias_user_id ON usuario_preferencias(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuario_preferencias_updated_at BEFORE UPDATE ON usuario_preferencias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update last_activity when user performs actions
CREATE OR REPLACE FUNCTION update_user_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE usuarios
    SET last_activity = NEW.created_at
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for last_activity updates
CREATE TRIGGER update_last_activity_on_history_insert
    AFTER INSERT ON historial
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_activity();

-- Enable Row Level Security (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_preferencias ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust according to your auth requirements)
-- These are basic policies - you may need to adjust them based on your authentication setup

-- Allow users to read their own data
CREATE POLICY "Users can view own profile" ON usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON usuarios
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to view their own history
CREATE POLICY "Users can view own history" ON historial
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to manage their own preferences
CREATE POLICY "Users can manage own preferences" ON usuario_preferencias
    FOR ALL USING (auth.uid() = user_id);

-- Allow service role to manage all data (for Edge Functions)
CREATE POLICY "Service role can manage all users" ON usuarios
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all history" ON historial
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all preferences" ON usuario_preferencias
    FOR ALL USING (auth.role() = 'service_role');