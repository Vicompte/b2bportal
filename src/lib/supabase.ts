import { createClient } from '@supabase/supabase-js';

// Variables d'environnement avec fallback pour le développement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://epwncluftgwotsxvkfnl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwd25jbHVmdGd3b3RzeHZrZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDQzNDgsImV4cCI6MjA2NjM4MDM0OH0.7u3wf-yXMgC0F8ghqUVMCwFVRb5m8UWUVsVKrkMUFpU';

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables d\'environnement Supabase manquantes');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key présente:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test de connexion Supabase
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('Test connexion Supabase - Session check:', { sessionExists: !!data.session, error });
    
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    console.log('Test connexion Supabase - Storage check:', { bucketsCount: buckets?.length || 0, storageError });
    
    return !error && !storageError;
  } catch (err) {
    console.error('Erreur test connexion:', err);
    return false;
  }
};

// Fonctions utilitaires pour les factures
export const uploadFacturePDF = async (userId: string, factureId: string, file: File): Promise<{ data: any; error: any; publicUrl?: string }> => {
  try {
    console.log(`Upload PDF pour user ${userId}, facture ${factureId}`);
    
    const fileName = 'facture.pdf';
    const filePath = `${userId}/${factureId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('factures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Erreur upload:', error);
      return { data: null, error };
    }

    const { data: publicUrlData } = supabase.storage
      .from('factures')
      .getPublicUrl(filePath);

    console.log('Upload réussi, URL:', publicUrlData.publicUrl);

    return { 
      data, 
      error: null, 
      publicUrl: publicUrlData.publicUrl 
    };
  } catch (err) {
    console.error('Erreur dans uploadFacturePDF:', err);
    return { 
      data: null, 
      error: err 
    };
  }
};

export const getFacturePublicUrl = (userId: string, factureId: string): string => {
  const filePath = `${userId}/${factureId}/facture.pdf`;
  const { data } = supabase.storage
    .from('factures')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

export const listUserFactureFiles = async (userId: string) => {
  try {
    console.log(`Listing files pour user: ${userId}`);
    
    const { data, error } = await supabase.storage
      .from('factures')
      .list(userId, {
        limit: 100,
        offset: 0
      });

    if (error) {
      console.error('Erreur listUserFactureFiles:', error);
    } else {
      console.log(`Trouvé ${data?.length || 0} dossiers pour ${userId}:`, data);
    }

    return { data, error };
  } catch (err) {
    console.error('Erreur dans listUserFactureFiles:', err);
    return { data: null, error: err };
  }
};