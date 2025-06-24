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

// Interface pour les factures avec PDF
export interface Facture {
  id: number;
  numero: string;
  date: string;
  montant: number;
  statut: 'payee' | 'en_attente';
  description: string;
  pdfUrl?: string;
  pdfFileName?: string;
}

// Données par défaut des utilisateurs - SEUL ADMIN
const defaultUsers: User[] = [
  {
    id: "admin",
    role: "admin",
    username: "contact@infinityagency.be",
    password: "InfinityAgency1812**",
    name: "Administrateur",
    company: "Infinity Agency"
  }
  // Aucun client par défaut - tableau vide
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