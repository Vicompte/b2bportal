import { createClient } from '@supabase/supabase-js';

// Variables d'environnement avec fallback pour le développement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://epwncluftgwotsxvkfnl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwd25jbHVmdGd3b3RzeHZrZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDQzNDgsImV4cCI6MjA2NjM4MDM0OH0.7u3wf-yXMgC0F8ghqUVMCwFVRb5m8UWUVsVKrkMUFpU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction utilitaire pour uploader un fichier PDF dans le bucket factures organisé par user_id
export const uploadFacturePDF = async (userId: string, factureId: string, file: File): Promise<{ data: any; error: any; publicUrl?: string }> => {
  try {
    const fileName = 'facture.pdf'; // Nom standardisé
    const filePath = `${userId}/${factureId}/${fileName}`;
    
    // Upload du fichier (upsert: true pour remplacer si existe)
    const { data, error } = await supabase.storage
      .from('factures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Permet de remplacer le fichier existant
      });

    if (error) {
      console.error('Erreur upload:', error);
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
    console.error('Erreur dans uploadFacturePDF:', err);
    return { 
      data: null, 
      error: err 
    };
  }
};

// Fonction pour récupérer l'URL publique d'un fichier existant
export const getFacturePublicUrl = (userId: string, factureId: string): string => {
  const filePath = `${userId}/${factureId}/facture.pdf`;
  const { data } = supabase.storage
    .from('factures')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Fonction pour vérifier si un PDF existe pour une facture
export const checkFacturePDFExists = async (userId: string, factureId: string): Promise<boolean> => {
  try {
    const filePath = `${userId}/${factureId}/facture.pdf`;
    const { data, error } = await supabase.storage
      .from('factures')
      .list(`${userId}/${factureId}`, {
        limit: 1
      });

    if (error) {
      console.error('Erreur checkFacturePDFExists:', error);
      return false;
    }
    return data && data.length > 0 && data.some(file => file.name === 'facture.pdf');
  } catch (err) {
    console.error('Erreur dans checkFacturePDFExists:', err);
    return false;
  }
};

// Fonction pour lister tous les fichiers d'un utilisateur
export const listUserFactureFiles = async (userId: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('factures')
      .list(userId, {
        limit: 100,
        offset: 0
      });

    if (error) {
      console.error('Erreur listUserFactureFiles:', error);
    }

    return { data, error };
  } catch (err) {
    console.error('Erreur dans listUserFactureFiles:', err);
    return { data: null, error: err };
  }
};

// Fonction pour lister les fichiers d'une facture spécifique
export const listFactureFiles = async (userId: string, factureId: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('factures')
      .list(`${userId}/${factureId}`, {
        limit: 100,
        offset: 0
      });

    return { data, error };
  } catch (err) {
    console.error('Erreur dans listFactureFiles:', err);
    return { data: null, error: err };
  }
};

// Fonction pour supprimer un fichier
export const deleteFactureFile = async (userId: string, factureId: string) => {
  const filePath = `${userId}/${factureId}/facture.pdf`;
  
  try {
    const { data, error } = await supabase.storage
      .from('factures')
      .remove([filePath]);

    return { data, error };
  } catch (err) {
    console.error('Erreur dans deleteFactureFile:', err);
    return { data: null, error: err };
  }
};

// Fonction pour créer un utilisateur client dans Supabase Auth
export const createClientUser = async (email: string, password: string, metadata: { name: string; company: string }) => {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata
    });

    return { data, error };
  } catch (err) {
    console.error('Erreur dans createClientUser:', err);
    return { data: null, error: err };
  }
};