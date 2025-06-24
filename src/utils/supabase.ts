import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://epwncluftgwotsxvkfnl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwd25jbHVmdGd3b3RzeHZrZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDQzNDgsImV4cCI6MjA2NjM4MDM0OH0.7u3wf-yXMgC0F8ghqUVMCwFVRb5m8UWUVsVKrkMUFpU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction utilitaire pour uploader un fichier PDF dans le bucket factures
export const uploadFacturePDF = async (factureId: string, file: File): Promise<{ data: any; error: any; publicUrl?: string }> => {
  try {
    const fileName = file.name;
    const filePath = `factures/${factureId}/${fileName}`;
    
    // Upload du fichier
    const { data, error } = await supabase.storage
      .from('factures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return { data: null, error };
    }

    // Récupérer l'URL publique
    const { data: publicUrlData } = supabase.storage
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

// Fonction pour récupérer l'URL publique d'un fichier existant
export const getFacturePublicUrl = (factureId: string, fileName: string): string => {
  const filePath = `factures/${factureId}/${fileName}`;
  const { data } = supabase.storage
    .from('factures')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Fonction pour lister tous les fichiers d'une facture
export const listFactureFiles = async (factureId: string) => {
  const { data, error } = await supabase.storage
    .from('factures')
    .list(`factures/${factureId}`, {
      limit: 100,
      offset: 0
    });

  return { data, error };
};

// Fonction pour supprimer un fichier
export const deleteFactureFile = async (factureId: string, fileName: string) => {
  const filePath = `factures/${factureId}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('factures')
    .remove([filePath]);

  return { data, error };
};