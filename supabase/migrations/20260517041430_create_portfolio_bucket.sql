-- Buat bucket storage bernama 'portfolio'
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Aktifkan RLS di storage.objects jika belum aktif (biasanya sudah default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Publik bisa melihat/membaca gambar di bucket 'portfolio'
CREATE POLICY "Public can view portfolio images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'portfolio');

-- Policy 2: Hanya Admin yang bisa upload gambar ke bucket 'portfolio'
CREATE POLICY "Admins can upload portfolio images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'portfolio' AND 
  public.has_role(auth.uid(), 'admin')
);

-- Policy 3: Hanya Admin yang bisa mengupdate gambar di bucket 'portfolio'
CREATE POLICY "Admins can update portfolio images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'portfolio' AND 
  public.has_role(auth.uid(), 'admin')
);

-- Policy 4: Hanya Admin yang bisa menghapus gambar di bucket 'portfolio'
CREATE POLICY "Admins can delete portfolio images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'portfolio' AND 
  public.has_role(auth.uid(), 'admin')
);
