// Gestionnaire d'authentification et des utilisateurs
export interface User {
  id: string;
  role: 'admin' | 'client';
  username: string;
  password: string;
  name?: string;
  company?: string;
  data?: {
    factures: any[];
    contenus: any[];
    credentials: any[];
    rapports: any[];
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
}

// Données par défaut des utilisateurs
const defaultUsers: User[] = [
  {
    id: "admin",
    role: "admin",
    username: "agence@demo.com",
    password: "motdepasse",
    name: "Administrateur",
    company: "Agence Digitale"
  },
  {
    id: "client1",
    role: "client",
    username: "client1@email.com",
    password: "simple",
    name: "Martin Dubois",
    company: "TechStart Innovation",
    data: {
      factures: [
        {
          id: 1,
          numero: 'FAC-2025-001',
          date: '2025-01-15',
          montant: 3500,
          statut: 'payee',
          description: 'Développement site web e-commerce'
        },
        {
          id: 2,
          numero: 'FAC-2025-002',
          date: '2025-02-01',
          montant: 1200,
          statut: 'en_attente',
          description: 'Maintenance et SEO mensuel'
        }
      ],
      contenus: [
        {
          id: 1,
          nom: 'Vidéos Promotionnelles Q1 2025',
          lien: 'https://drive.google.com/drive/folders/1ABCDefGHijKLMnOPqrsTUVwxyz123456',
          date: '2025-01-20',
          type: 'video'
        }
      ],
      credentials: [
        {
          id: 1,
          service: 'WordPress Admin',
          username: 'admin@techstart-innovation.com',
          password: 'SecureWP2025!',
          url: 'https://techstart-innovation.com/wp-admin'
        }
      ],
      rapports: [
        {
          id: 1,
          nom: 'Rapport SEO - Janvier 2025',
          lien: 'https://drive.google.com/file/d/1ABCDefGHijKLMnOPqrsTUVwxyz123456/view',
          date: '2025-01-31',
          type: 'seo'
        }
      ]
    }
  },
  {
    id: "client2",
    role: "client",
    username: "client2@email.com",
    password: "simple",
    name: "Sophie Laurent",
    company: "Creative Studio",
    data: {
      factures: [
        {
          id: 1,
          numero: 'FAC-2025-005',
          date: '2025-02-10',
          montant: 2500,
          statut: 'payee',
          description: 'Création identité visuelle'
        }
      ],
      contenus: [
        {
          id: 1,
          nom: 'Logo et Charte Graphique',
          lien: 'https://drive.google.com/drive/folders/2ABCDefGHijKLMnOPqrsTUVwxyz123456',
          date: '2025-02-15',
          type: 'branding'
        }
      ],
      credentials: [
        {
          id: 1,
          service: 'Instagram Business',
          username: 'creative@studio.com',
          password: 'Instagram2025!',
          url: 'https://business.instagram.com'
        }
      ],
      rapports: [
        {
          id: 1,
          nom: 'Analyse Performance Social Media',
          lien: 'https://drive.google.com/file/d/2ABCDefGHijKLMnOPqrsTUVwxyz123456/view',
          date: '2025-02-28',
          type: 'performance'
        }
      ]
    }
  }
];

const STORAGE_KEY = 'authData';

// Charger les données d'authentification
export const loadAuthData = (): AuthState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.users && Array.isArray(parsed.users)) {
        return {
          isAuthenticated: false,
          currentUser: null,
          users: parsed.users
        };
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données auth:', error);
  }
  
  // Retourner les données par défaut
  return {
    isAuthenticated: false,
    currentUser: null,
    users: defaultUsers
  };
};

// Sauvegarder les données d'authentification
export const saveAuthData = (authState: AuthState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      users: authState.users
    }));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données auth:', error);
  }
};

// Authentifier un utilisateur
export const authenticateUser = (username: string, password: string): User | null => {
  const authData = loadAuthData();
  const user = authData.users.find(u => u.username === username && u.password === password);
  return user || null;
};

// Obtenir tous les clients (pour l'admin)
export const getAllClients = (): User[] => {
  const authData = loadAuthData();
  return authData.users.filter(u => u.role === 'client');
};

// Mettre à jour les données d'un client
export const updateClientData = (clientId: string, newData: any): void => {
  const authData = loadAuthData();
  const clientIndex = authData.users.findIndex(u => u.id === clientId);
  
  if (clientIndex !== -1) {
    authData.users[clientIndex].data = newData;
    saveAuthData(authData);
  }
};

// Ajouter un nouveau client
export const addClient = (clientData: Omit<User, 'id' | 'role'>): User => {
  const authData = loadAuthData();
  const newId = `client${Date.now()}`;
  const newClient: User = {
    ...clientData,
    id: newId,
    role: 'client',
    data: {
      factures: [],
      contenus: [],
      credentials: [],
      rapports: []
    }
  };
  
  authData.users.push(newClient);
  saveAuthData(authData);
  return newClient;
};

// Supprimer un client
export const deleteClient = (clientId: string): void => {
  const authData = loadAuthData();
  authData.users = authData.users.filter(u => u.id !== clientId);
  saveAuthData(authData);
};