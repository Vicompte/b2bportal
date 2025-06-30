// ✅ GESTIONNAIRE DE DONNÉES CLIENT AVEC TVA
export interface Facture {
  id: number;
  numero: string;
  date: string;
  montantHT: number;    // Nouveau : Montant Hors Taxes
  tauxTVA: 0 | 21;      // Nouveau : Taux de TVA (0% ou 21% uniquement)
  montantTVA: number;   // Nouveau : Montant de la TVA (calculé automatiquement)
  montantTTC: number;   // Nouveau : Montant Toutes Taxes Comprises (calculé automatiquement)
  statut: 'payee' | 'en_attente';
  description: string;
  // Champ legacy pour migration
  montant?: number;     // Ancien champ pour compatibilité
}

export interface Contenu {
  id: number;
  nom: string;
  lien: string;
  date: string;
  type: 'video' | 'photo' | 'design' | 'branding';
}

export interface Credential {
  id: number;
  service: string;
  username: string;
  password: string;
  url: string;
}

export interface Rapport {
  id: number;
  nom: string;
  lien: string;
  date: string;
  type: 'seo' | 'performance' | 'ads' | 'security';
}

export interface ClientData {
  name: string;
  company: string;
  factures: Facture[];
  contenus: Contenu[];
  credentials: Credential[];
  rapports: Rapport[];
}

export interface RecapitulatifTVA {
  clientId: string;
  clientName: string;
  totalFacturesHT: number;
  totalTVA0: number;      // Total TVA à 0%
  totalTVA21: number;     // Total TVA à 21%
  totalTVAGlobale: number; // Total de toutes les TVA
  totalTTC: number;
  nbFactures0: number;    // Nombre de factures à 0%
  nbFactures21: number;   // Nombre de factures à 21%
}

// ✅ Fonctions de calcul TVA
export const calculerMontantTVA = (montantHT: number, tauxTVA: 0 | 21): number => {
  return montantHT * (tauxTVA / 100);
};

export const calculerMontantTTC = (montantHT: number, montantTVA: number): number => {
  return montantHT + montantTVA;
};

export const calculerMontantHTDepuisTTC = (montantTTC: number, tauxTVA: 0 | 21): number => {
  if (tauxTVA === 0) return montantTTC;
  return montantTTC / (1 + tauxTVA / 100);
};

// ✅ Migration des factures existantes
export const migrerFacturesVersTVA = (factures: Facture[]): Facture[] => {
  return factures.map(facture => {
    // Si la facture a déjà les nouveaux champs, ne pas la migrer
    if (facture.montantHT !== undefined && facture.tauxTVA !== undefined) {
      return facture;
    }

    // Migration depuis l'ancien format
    const montantTTC = facture.montant || facture.montantTTC || 0;
    const tauxTVA: 0 | 21 = 21; // Taux par défaut
    const montantHT = calculerMontantHTDepuisTTC(montantTTC, tauxTVA);
    const montantTVA = calculerMontantTVA(montantHT, tauxTVA);

    return {
      ...facture,
      montantHT: Math.round(montantHT * 100) / 100,
      tauxTVA,
      montantTVA: Math.round(montantTVA * 100) / 100,
      montantTTC: Math.round(montantTTC * 100) / 100,
      // Supprimer l'ancien champ
      montant: undefined
    };
  });
};

// ✅ Calcul du récapitulatif TVA pour un client
export const calculerRecapitulatifTVAClient = (clientId: string, clientName: string, factures: Facture[]): RecapitulatifTVA => {
  const facturesMigrees = migrerFacturesVersTVA(factures);
  
  const facturesTVA0 = facturesMigrees.filter(f => f.tauxTVA === 0);
  const facturesTVA21 = facturesMigrees.filter(f => f.tauxTVA === 21);
  
  const totalTVA0 = facturesTVA0.reduce((sum, f) => sum + f.montantTVA, 0);
  const totalTVA21 = facturesTVA21.reduce((sum, f) => sum + f.montantTVA, 0);
  const totalFacturesHT = facturesMigrees.reduce((sum, f) => sum + f.montantHT, 0);
  const totalTTC = facturesMigrees.reduce((sum, f) => sum + f.montantTTC, 0);

  return {
    clientId,
    clientName,
    totalFacturesHT: Math.round(totalFacturesHT * 100) / 100,
    totalTVA0: Math.round(totalTVA0 * 100) / 100,
    totalTVA21: Math.round(totalTVA21 * 100) / 100,
    totalTVAGlobale: Math.round((totalTVA0 + totalTVA21) * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100,
    nbFactures0: facturesTVA0.length,
    nbFactures21: facturesTVA21.length
  };
};

// ✅ Gestion du localStorage
const STORAGE_KEY = 'clientData';

export const loadClientData = (): ClientData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Migration automatique des factures
      if (data.factures) {
        data.factures = migrerFacturesVersTVA(data.factures);
      }
      return data;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données client:', error);
  }
  
  return {
    name: 'Client Test',
    company: 'Entreprise Test',
    factures: [],
    contenus: [],
    credentials: [],
    rapports: []
  };
};

export const saveClientData = (data: ClientData): void => {
  try {
    // Migration avant sauvegarde
    const dataToSave = {
      ...data,
      factures: migrerFacturesVersTVA(data.factures)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données client:', error);
  }
};