import { createClient } from '@supabase/supabase-js';

// Version utilisant les variables d'environnement (recommandée pour la production)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes');
}

export const supabaseEnv = createClient(supabaseUrl, supabaseAnonKey);

// Fonctions utilitaires identiques à supabase.ts mais utilisant les variables d'environnement
export const uploadFacturePDFEnv = async (factureId: string, file: File): Promise<{ data: any; error: any; publicUrl?: string }> => {
  try {
    const fileName = file.name;
    const filePath = `factures/${factureId}/${fileName}`;
    
    const { data, error } = await supabaseEnv.storage
      .from('factures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return { data: null, error };
    }

    const { data: publicUrlData } = supabaseEnv.storage
      .from('factures')
      .getPublicUrl(filePath);

    return { 
      data, 
      error: null, 
      publicUrl: publicUrlData.publicUrl 
    };
  } catch (err) {
    return { 
      data: null, 
      error: err 
    };
  }
};