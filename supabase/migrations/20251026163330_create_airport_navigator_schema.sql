/*
  # Airport Navigator Database Schema

  ## Overview
  Creates the complete database schema for the Airport Navigator application with tables for airports,
  terminals, gates, flights, and user-related data.

  ## New Tables

  ### 1. `airports`
  Stores airport information
  - `id` (uuid, primary key) - Unique airport identifier
  - `code` (text, unique) - IATA airport code (e.g., 'JFK', 'LAX')
  - `name` (text) - Full airport name
  - `city` (text) - City where airport is located
  - `country` (text) - Country where airport is located
  - `timezone` (text) - Airport timezone
  - `latitude` (numeric) - GPS latitude coordinate
  - `longitude` (numeric) - GPS longitude coordinate
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 2. `terminals`
  Stores terminal information within airports
  - `id` (uuid, primary key) - Unique terminal identifier
  - `airport_id` (uuid, foreign key) - Reference to airports table
  - `name` (text) - Terminal name/number (e.g., 'Terminal 1', 'Terminal A')
  - `description` (text) - Terminal description
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 3. `gates`
  Stores gate information within terminals
  - `id` (uuid, primary key) - Unique gate identifier
  - `terminal_id` (uuid, foreign key) - Reference to terminals table
  - `gate_number` (text) - Gate number (e.g., 'A12', 'B5')
  - `status` (text) - Gate status (open, closed, maintenance)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 4. `flights`
  Stores flight information
  - `id` (uuid, primary key) - Unique flight identifier
  - `flight_number` (text) - Flight number (e.g., 'AA123')
  - `airline` (text) - Airline name
  - `airport_id` (uuid, foreign key) - Reference to airports table
  - `gate_id` (uuid, foreign key, nullable) - Reference to gates table
  - `departure_time` (timestamptz) - Scheduled departure time
  - `arrival_time` (timestamptz) - Scheduled arrival time
  - `status` (text) - Flight status (on-time, delayed, cancelled, boarding, departed)
  - `origin` (text) - Origin airport code
  - `destination` (text) - Destination airport code
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 5. `user_profiles`
  Extended user profile information
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `phone` (text) - User's phone number
  - `preferences` (jsonb) - User preferences (notifications, favorite airports, etc.)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 6. `user_flights`
  Tracks flights users are monitoring
  - `id` (uuid, primary key) - Unique record identifier
  - `user_id` (uuid, foreign key) - Reference to user_profiles
  - `flight_id` (uuid, foreign key) - Reference to flights table
  - `notifications_enabled` (boolean) - Whether user wants notifications for this flight
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security

  - Enables Row Level Security (RLS) on all tables
  - Public read access for airports, terminals, gates, and flights (read-only data)
  - Authenticated users can read/write their own profile data
  - Authenticated users can manage their own tracked flights

  ## Indexes

  - Creates indexes on frequently queried columns for optimal performance
*/

-- Create airports table
CREATE TABLE IF NOT EXISTS airports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create terminals table
CREATE TABLE IF NOT EXISTS terminals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id uuid NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gates table
CREATE TABLE IF NOT EXISTS gates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id uuid NOT NULL REFERENCES terminals(id) ON DELETE CASCADE,
  gate_number text NOT NULL,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create flights table
CREATE TABLE IF NOT EXISTS flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number text NOT NULL,
  airline text NOT NULL,
  airport_id uuid NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  gate_id uuid REFERENCES gates(id) ON DELETE SET NULL,
  departure_time timestamptz,
  arrival_time timestamptz,
  status text DEFAULT 'on-time',
  origin text NOT NULL,
  destination text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_flights table
CREATE TABLE IF NOT EXISTS user_flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  flight_id uuid NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, flight_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_airports_code ON airports(code);
CREATE INDEX IF NOT EXISTS idx_airports_city ON airports(city);
CREATE INDEX IF NOT EXISTS idx_terminals_airport_id ON terminals(airport_id);
CREATE INDEX IF NOT EXISTS idx_gates_terminal_id ON gates(terminal_id);
CREATE INDEX IF NOT EXISTS idx_flights_airport_id ON flights(airport_id);
CREATE INDEX IF NOT EXISTS idx_flights_flight_number ON flights(flight_number);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
CREATE INDEX IF NOT EXISTS idx_flights_departure_time ON flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_user_flights_user_id ON user_flights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_flights_flight_id ON user_flights(flight_id);

-- Enable Row Level Security
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for airports (public read access)
CREATE POLICY "Anyone can view airports"
  ON airports FOR SELECT
  TO public
  USING (true);

-- RLS Policies for terminals (public read access)
CREATE POLICY "Anyone can view terminals"
  ON terminals FOR SELECT
  TO public
  USING (true);

-- RLS Policies for gates (public read access)
CREATE POLICY "Anyone can view gates"
  ON gates FOR SELECT
  TO public
  USING (true);

-- RLS Policies for flights (public read access)
CREATE POLICY "Anyone can view flights"
  ON flights FOR SELECT
  TO public
  USING (true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_flights
CREATE POLICY "Users can view own tracked flights"
  ON user_flights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add tracked flights"
  ON user_flights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracked flights"
  ON user_flights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracked flights"
  ON user_flights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
