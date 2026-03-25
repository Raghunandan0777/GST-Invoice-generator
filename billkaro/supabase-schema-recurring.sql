-- Add to your Supabase SQL Editor (run after initial schema)

CREATE TABLE public.recurring_invoices (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- Template data (same structure as invoices)
  seller_name text,
  seller_gstin text,
  seller_address text,
  seller_phone text,
  seller_email text,
  buyer_name text,
  buyer_gstin text,
  buyer_address text,
  buyer_phone text,
  buyer_email text,
  items jsonb DEFAULT '[]',
  gst_type text DEFAULT 'cgst',
  gst_rate numeric DEFAULT 18,
  place_of_supply text,
  bank_name text,
  bank_account text,
  bank_ifsc text,
  bank_holder text,
  notes text,
  -- Recurrence settings
  frequency text DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  start_date date NOT NULL,
  next_run_date date NOT NULL,
  end_date date,
  is_active boolean DEFAULT true,
  auto_send boolean DEFAULT false,
  prefix text DEFAULT 'INV',
  -- Stats
  total_generated integer DEFAULT 0,
  last_generated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.recurring_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own recurring invoices"
  ON public.recurring_invoices FOR ALL
  USING (auth.uid() = user_id);
