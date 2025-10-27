/*
  # Add Airport Maps and Premium Lounge Features

  1. New Tables
    - `airport_maps`
      - `id` (uuid, primary key)
      - `airport_id` (uuid, foreign key to airports)
      - `terminal_id` (uuid, nullable, foreign key to terminals)
      - `floor_level` (text) - e.g., "Ground Floor", "Level 2", etc.
      - `map_url` (text) - URL to the map image
      - `map_type` (text) - e.g., "terminal", "full_airport", "parking"
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `airport_lounges`
      - `id` (uuid, primary key)
      - `airport_id` (uuid, foreign key to airports)
      - `terminal_id` (uuid, nullable, foreign key to terminals)
      - `name` (text)
      - `airline` (text, nullable) - airline-specific lounge
      - `location` (text) - description of location
      - `amenities` (jsonb) - array of amenities
      - `operating_hours` (jsonb) - opening and closing times
      - `access_requirements` (text) - Premium, Business Class, etc.
      - `is_premium` (boolean) - whether this requires premium subscription
      - `rating` (numeric, nullable)
      - `image_url` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `advertisements`
      - `id` (uuid, primary key)
      - `airport_id` (uuid, nullable, foreign key to airports)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `link_url` (text)
      - `ad_type` (text) - e.g., "banner", "sponsored", "promotion"
      - `placement` (text) - where ad should appear
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `subscription_tiers`
      - `id` (uuid, primary key)
      - `name` (text) - e.g., "Free", "Pro", "Business"
      - `price_monthly` (numeric)
      - `price_yearly` (numeric)
      - `features` (jsonb) - array of features
      - `stripe_price_id_monthly` (text, nullable)
      - `stripe_price_id_yearly` (text, nullable)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `tier_id` (uuid, foreign key to subscription_tiers)
      - `stripe_customer_id` (text, nullable)
      - `stripe_subscription_id` (text, nullable)
      - `status` (text, default 'active') - active, cancelled, expired
      - `current_period_start` (timestamptz)
      - `current_period_end` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for public read access to maps and lounges
    - Premium lounges require authenticated users with active subscriptions
    - Advertisements are publicly readable
    - Subscriptions are only viewable by the owning user
*/

-- Create airport_maps table
CREATE TABLE IF NOT EXISTS airport_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id uuid NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  terminal_id uuid REFERENCES terminals(id) ON DELETE CASCADE,
  floor_level text NOT NULL,
  map_url text NOT NULL,
  map_type text NOT NULL DEFAULT 'terminal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE airport_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view airport maps"
  ON airport_maps FOR SELECT
  TO public
  USING (true);

-- Create airport_lounges table
CREATE TABLE IF NOT EXISTS airport_lounges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id uuid NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  terminal_id uuid REFERENCES terminals(id) ON DELETE CASCADE,
  name text NOT NULL,
  airline text,
  location text NOT NULL,
  amenities jsonb DEFAULT '[]'::jsonb,
  operating_hours jsonb DEFAULT '{}'::jsonb,
  access_requirements text NOT NULL,
  is_premium boolean DEFAULT false,
  rating numeric(3,2),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE airport_lounges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view free lounge info"
  ON airport_lounges FOR SELECT
  TO public
  USING (is_premium = false);

CREATE POLICY "Authenticated users can view premium lounges"
  ON airport_lounges FOR SELECT
  TO authenticated
  USING (is_premium = true);

-- Create advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id uuid REFERENCES airports(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  link_url text NOT NULL,
  ad_type text NOT NULL DEFAULT 'banner',
  placement text NOT NULL,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active advertisements"
  ON advertisements FOR SELECT
  TO public
  USING (is_active = true AND now() BETWEEN start_date AND end_date);

-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  price_yearly numeric(10,2) NOT NULL DEFAULT 0,
  features jsonb DEFAULT '[]'::jsonb,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subscription tiers"
  ON subscription_tiers FOR SELECT
  TO public
  USING (is_active = true);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id uuid NOT NULL REFERENCES subscription_tiers(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT now() + INTERVAL '1 month',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tier_id)
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (name, price_monthly, price_yearly, features) VALUES
('Free', 0, 0, '["Basic airport search", "Flight tracking (up to 3)", "Terminal information"]'::jsonb),
('Pro', 9.99, 99.99, '["Everything in Free", "Unlimited flight tracking", "Premium lounge access", "Real-time gate change alerts", "Ad-free experience", "Priority support"]'::jsonb),
('Business', 29.99, 299.99, '["Everything in Pro", "Team management (up to 10 users)", "API access", "Custom reports", "Dedicated account manager", "White-label options"]'::jsonb)
ON CONFLICT (name) DO NOTHING;
