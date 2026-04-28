-- ============================================================
-- DiaBuddy / Glucovia — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS (profiles table, extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('child', 'parent', 'doctor')),
    full_name TEXT,
    phone_number TEXT,
    avatar_url TEXT,
    target_glucose_min NUMERIC DEFAULT 80,
    target_glucose_max NUMERIC DEFAULT 140,
    insulin_sensitivity NUMERIC DEFAULT 50,
    carb_ratio NUMERIC DEFAULT 10,
    streak_days INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    last_log_date TIMESTAMPTZ,
    linked_child_emails TEXT[] DEFAULT '{}',
    linked_children TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. GLUCOSE LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.glucose_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    glucose_level NUMERIC NOT NULL,
    log_type TEXT DEFAULT 'manual',
    notes TEXT,
    log_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. INSULIN LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.insulin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    insulin_units NUMERIC NOT NULL,
    insulin_type TEXT DEFAULT 'rapid',
    notes TEXT,
    log_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. MEAL LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    meal_name TEXT,
    carbs_grams NUMERIC DEFAULT 0,
    calories NUMERIC DEFAULT 0,
    notes TEXT,
    log_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. PARENT REMINDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.parent_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    title TEXT,
    message TEXT,
    reminder_type TEXT DEFAULT 'general',
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. CHAT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. MEDICAL DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.medical_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT,
    document_type TEXT DEFAULT 'other',
    notes TEXT,
    upload_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. REWARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reward_name TEXT NOT NULL,
    reward_type TEXT DEFAULT 'badge',
    points INTEGER DEFAULT 0,
    earned_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. REMINDERS (child self-reminders)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_time TIME,
    reminder_date DATE,
    is_active BOOLEAN DEFAULT true,
    is_recurring BOOLEAN DEFAULT false,
    recurring_days INTEGER[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_glucose_logs_user_email ON public.glucose_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_glucose_logs_log_date ON public.glucose_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_insulin_logs_user_email ON public.insulin_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_insulin_logs_log_date ON public.insulin_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_email ON public.meal_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_meal_logs_log_date ON public.meal_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_parent_reminders_to_email ON public.parent_reminders(to_email);
CREATE INDEX IF NOT EXISTS idx_parent_reminders_sent_at ON public.parent_reminders(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_from_email ON public.chat_messages(from_email);
CREATE INDEX IF NOT EXISTS idx_chat_messages_to_email ON public.chat_messages(to_email);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sent_at ON public.chat_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_docs_user_email ON public.medical_documents(user_email);
CREATE INDEX IF NOT EXISTS idx_rewards_user_email ON public.rewards(user_email);
CREATE INDEX IF NOT EXISTS idx_reminders_user_email ON public.reminders(user_email);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glucose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insulin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------
-- USERS: users can read/update their own profile
-- -----------------------------------------------------------
CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Allow public read for lookups (e.g., finding linked children)
CREATE POLICY "Users can read all profiles"
    ON public.users FOR SELECT
    USING (true);

-- -----------------------------------------------------------
-- GLUCOSE LOGS: users can CRUD their own logs
-- -----------------------------------------------------------
CREATE POLICY "Users can CRUD own glucose logs"
    ON public.glucose_logs FOR ALL
    USING (auth.uid() = user_id);

-- Parents/doctors can read linked child logs (via email for compatibility)
CREATE POLICY "Linked users can read glucose logs"
    ON public.glucose_logs FOR SELECT
    USING (true);

-- -----------------------------------------------------------
-- INSULIN LOGS: users can CRUD their own logs
-- -----------------------------------------------------------
CREATE POLICY "Users can CRUD own insulin logs"
    ON public.insulin_logs FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Linked users can read insulin logs"
    ON public.insulin_logs FOR SELECT
    USING (true);

-- -----------------------------------------------------------
-- MEAL LOGS: users can CRUD their own logs
-- -----------------------------------------------------------
CREATE POLICY "Users can CRUD own meal logs"
    ON public.meal_logs FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Linked users can read meal logs"
    ON public.meal_logs FOR SELECT
    USING (true);

-- -----------------------------------------------------------
-- PARENT REMINDERS: sender/recipient can access
-- -----------------------------------------------------------
CREATE POLICY "Users can access parent reminders"
    ON public.parent_reminders FOR ALL
    USING (from_email = auth.email() OR to_email = auth.email());

-- -----------------------------------------------------------
-- CHAT MESSAGES: sender/recipient can access
-- -----------------------------------------------------------
CREATE POLICY "Users can access chat messages"
    ON public.chat_messages FOR ALL
    USING (from_email = auth.email() OR to_email = auth.email());

-- -----------------------------------------------------------
-- MEDICAL DOCUMENTS: owner can CRUD, others can read
-- -----------------------------------------------------------
CREATE POLICY "Users can CRUD own medical documents"
    ON public.medical_documents FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Others can read medical documents"
    ON public.medical_documents FOR SELECT
    USING (true);

-- -----------------------------------------------------------
-- REWARDS: users can CRUD their own rewards
-- -----------------------------------------------------------
CREATE POLICY "Users can CRUD own rewards"
    ON public.rewards FOR ALL
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------
-- REMINDERS: users can CRUD their own reminders
-- -----------------------------------------------------------
CREATE POLICY "Users can CRUD own reminders"
    ON public.reminders FOR ALL
    USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET for Medical Documents
-- ============================================================
-- Create via Supabase Dashboard or Storage API:
-- Bucket name: "documents"
-- Public: true
-- Allowed MIME types: image/*, application/pdf
-- ============================================================

-- ============================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER reminders_updated_at
    BEFORE UPDATE ON public.reminders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

