// Utilitaires pour gérer les données client dans localStorage
export interface Facture {
  id: number;
  numero: string;
  date: string;
  montant: number;
  statut: 'payee' | 'en_attente';
  description: string;
}

export interface Contenu {
  id: number;
  nom: string;
  lien: string;
  date: string;
  type: string;
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
  type: string;
}

export interface ClientData {
  name: string;
  company: string;
  factures: Facture[];
  contenus: Contenu[];
  credentials: Credential[];
  rapports: Rapport[];
}

// Données par défaut
const defaultClientData: ClientData = {
  name: 'Martin Dubois',
  company: 'TechStart Innovation',
  factures: [
    {
      id: 1,
      numero: 'FAC-2025-001',
      date: '2025-01-15',
      montant: 3500,
      statut: 'payee' as const,
      description: 'Développement site web e-commerce'
    },
    {
      id: 2,
      numero: 'FAC-2025-002',
      date: '2025-02-01',
      montant: 1200,
      statut: 'en_attente' as const,
      description: 'Maintenance et SEO mensuel'
    },
    {
      id: 3,
      numero: 'FAC-2025-003',
      date: '2025-02-15',
      montant: 2800,
      statut: 'payee' as const,
      description: 'Campagne publicitaire Google Ads'
    },
    {
      id: 4,
      numero: 'FAC-2025-004',
      date: '2025-03-01',
      montant: 4200,
      statut: 'en_attente' as const,
      description: 'Refonte identité visuelle complète'
    }
  ],
  contenus: [
    {
      id: 1,
      nom: 'Vidéos Promotionnelles Q1 2025',
      lien: 'https://drive.google.com/drive/folders/1ABCDefGHijKLMnOPqrsTUVwxyz123456',
      date: '2025-01-20',
      type: 'video'
    },
    {
      id: 2,
      nom: 'Photos Produits E-commerce',
      lien: 'https://drive.google.com/drive/folders/2ABCDefGHijKLMnOPqrsTUVwxyz123456',
      date: '2025-02-05',
      type: 'photo'
    },
    {
      id: 3,
      nom: 'Bannières Publicitaires Facebook',
      lien: 'https://drive.google.com/drive/folders/3ABCDefGHijKLMnOPqrsTUVwxyz123456',
      date: '2025-02-18',
      type: 'design'
    },
    {
      id: 4,
      nom: 'Logo et Charte Graphique',
      lien: 'https://drive.google.com/drive/folders/4ABCDefGHijKLMnOPqrsTUVwxyz123456',
      date: '2025-03-02',
      type: 'branding'
    }
  ],
  credentials: [
    {
      id: 1,
      service: 'WordPress Admin',
      username: 'admin@techstart-innovation.com',
      password: 'SecureWP2025!',
      url: 'https://techstart-innovation.com/wp-admin'
    },
    {
      id: 2,
      service: 'Google Analytics',
      username: 'analytics@techstart-innovation.com',
      password: 'Analytics@2025',
      url: 'https://analytics.google.com'
    },
    {
      id: 3,
      service: 'Search Console',
      username: 'webmaster@techstart-innovation.com',
      password: 'Console#2025',
      url: 'https://search.google.com/search-console'
    },
    {
      id: 4,
      service: 'Facebook Business',
      username: 'social@techstart-innovation.com',
      password: 'Facebook$2025',
      url: 'https://business.facebook.com'
    }
  ],
  rapports: [
    {
      id: 1,
      nom: 'Rapport SEO - Janvier 2025',
      lien: 'https://drive.google.com/file/d/1ABCDefGHijKLMnOPqrsTUVwxyz123456/view',
      date: '2025-01-31',
      type: 'seo'
    },
    {
      id: 2,
      nom: 'Analyse Performance Site - Février',
      lien: 'https://drive.google.com/file/d/2ABCDefGHijKLMnOPqrsTUVwxyz123456/view',
      date: '2025-02-28',
      type: 'performance'
    },
    {
      id: 3,
      nom: 'Rapport Campagne Google Ads',
      lien: 'https://drive.google.com/file/d/3ABCDefGHijKLMnOPqrsTUVwxyz123456/view',
      date: '2025-03-05',
      type: 'ads'
    },
    {
      id: 4,
      nom: 'Audit Sécurité Complet',
      lien: 'https://drive.google.com/file/d/4ABCDefGHijKLMnOPqrsTUVwxyz123456/view',
      date: '2025-03-15',
      type: 'security'
    }
  ]
};

const STORAGE_KEY = 'clientData';

// Charger les données depuis localStorage
export const loadClientData = (): ClientData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Vérifier que les données ont la bonne structure
      if (parsed && typeof parsed === 'object' && parsed.name && parsed.company) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données client:', error);
  }
  
  // Retourner les données par défaut si rien n'est trouvé ou en cas d'erreur
  return defaultClientData;
};

// Sauvegarder les données dans localStorage
export const saveClientData = (data: ClientData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données client:', error);
  }
};

// Réinitialiser aux données par défaut
export const resetClientData = (): ClientData => {
  saveClientData(defaultClientData);
  return defaultClientData;
};