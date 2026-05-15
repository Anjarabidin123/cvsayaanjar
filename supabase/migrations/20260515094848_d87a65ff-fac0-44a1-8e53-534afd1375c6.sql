
-- Enum role
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles table (single profile, user_id linked)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  full_name TEXT NOT NULL DEFAULT 'Your Name',
  title TEXT NOT NULL DEFAULT 'Your Title',
  bio TEXT NOT NULL DEFAULT '',
  email TEXT,
  location TEXT,
  avatar_url TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT NOT NULL DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  technologies TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  live_url TEXT,
  repo_url TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  proficiency INT NOT NULL DEFAULT 80 CHECK (proficiency BETWEEN 0 AND 100),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Has role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto make first signed-up user admin
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Public read on portfolio data
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public can view experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Public can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public can view skills" ON public.skills FOR SELECT USING (true);

-- Admin write
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage experiences" ON public.experiences FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage skills" ON public.skills FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_roles policies
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Seed an initial profile row
INSERT INTO public.profiles (full_name, title, bio, email, location, social_links)
VALUES (
  'Nama Anda',
  'Full Stack Developer',
  'Saya seorang developer yang passionate dalam membangun produk digital yang elegan dan fungsional. Berfokus pada pengalaman pengguna dan kode yang bersih.',
  'email@example.com',
  'Jakarta, Indonesia',
  '{"linkedin":"https://linkedin.com/in/username","github":"https://github.com/username","twitter":""}'::jsonb
);

-- Seed sample projects
INSERT INTO public.projects (title, description, technologies, live_url, repo_url, display_order) VALUES
('Project Showcase', 'Platform portfolio modern dengan animasi halus dan dark mode elegan.', ARRAY['React','TypeScript','Tailwind'], 'https://example.com', 'https://github.com', 1),
('E-Commerce Dashboard', 'Dashboard analitik real-time untuk toko online dengan visualisasi data yang interaktif.', ARRAY['Next.js','Postgres','Recharts'], 'https://example.com', 'https://github.com', 2),
('AI Chat App', 'Aplikasi chat dengan integrasi AI untuk membantu produktivitas tim.', ARRAY['React','Node.js','OpenAI'], 'https://example.com', 'https://github.com', 3);

INSERT INTO public.experiences (company, role, start_date, end_date, description, display_order) VALUES
('Tech Company', 'Senior Frontend Developer', '2023-01-01', NULL, 'Memimpin pengembangan UI untuk produk SaaS dengan jutaan pengguna aktif.', 1),
('Startup Studio', 'Full Stack Developer', '2021-03-01', '2022-12-31', 'Membangun MVP untuk berbagai produk dari ide hingga produksi.', 2);

INSERT INTO public.skills (category, name, proficiency, display_order) VALUES
('Frontend', 'React / Next.js', 95, 1),
('Frontend', 'TypeScript', 90, 2),
('Frontend', 'Tailwind CSS', 95, 3),
('Backend', 'Node.js', 85, 4),
('Backend', 'PostgreSQL', 80, 5),
('Tools', 'Git & GitHub', 90, 6);
