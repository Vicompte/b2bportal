// ✅ GESTIONNAIRE AUTH HYBRIDE - LocalStorage + Supabase
import { createClientUser } from '../lib/supabase'

export interface User {
  id: string;
  role: 'admin' | 'client';
  username: string;
  password: string;
  name?: string;
  company?: string;
  supabaseUserId?: string; // ID Supabase pour les clients
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
  hasPDF?: boolean;
}

// ✅ SEUL ADMIN PAR DÉFAUT - Clients créés dynamiquement
const defaultUsers: User[] = [
  {
    id: "admin",
    role: "admin",
    username: "contact@infinityagency.be",
    password: "InfinityAgency1812**",
    name: "Administrateur",
    company: "Infinity Agency"
  }
]

const STORAGE_KEY = 'authData'

// ✅ Fonction de réinitialisation complète
export const resetAuthData = (): void => {
  console.log('🔄 Réinitialisation complète des données auth')
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem('currentUser')
}

// ✅ Chargement des données avec validation
export const loadAuthData = (): AuthState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && parsed.users && Array.isArray(parsed.users)) {
        // Vérifier si l'admin existe avec les bons identifiants
        const adminExists = parsed.users.find(u => 
          u.role === 'admin' && 
          u.username === 'contact@infinityagency.be' && 
          u.password === 'InfinityAgency1812**'
        )
        
        if (!adminExists) {
          console.log('⚠️ Admin avec nouveaux identifiants non trouvé, réinitialisation...')
          resetAuthData()
          return {
            isAuthenticated: false,
            currentUser: null,
            users: defaultUsers
          }
        }
        
        return {
          isAuthenticated: false,
          currentUser: null,
          users: parsed.users
        }
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des données auth:', error)
    resetAuthData()
  }
  
  return {
    isAuthenticated: false,
    currentUser: null,
    users: defaultUsers
  }
}

// ✅ Sauvegarde sécurisée
export const saveAuthData = (authState: AuthState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      users: authState.users
    }))
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde des données auth:', error)
  }
}

// ✅ Authentification utilisateur
export const authenticateUser = (username: string, password: string): User | null => {
  const authData = loadAuthData()
  const user = authData.users.find(u => u.username === username && u.password === password)
  return user || null
}

// ✅ Obtenir tous les clients
export const getAllClients = (): User[] => {
  const authData = loadAuthData()
  return authData.users.filter(u => u.role === 'client')
}

// ✅ Mettre à jour les données d'un client
export const updateClientData = (clientId: string, newData: any): void => {
  const authData = loadAuthData()
  const clientIndex = authData.users.findIndex(u => u.id === clientId)
  
  if (clientIndex !== -1) {
    authData.users[clientIndex].data = newData
    saveAuthData(authData)
  }
}

// ✅ FONCTION CORRIGÉE - Ajouter un nouveau client (SYNCHRONE)
export const addClient = (clientData: Omit<User, 'id' | 'role'> & { supabaseUserId?: string }): User => {
  const authData = loadAuthData()
  const newId = `client${Date.now()}`
  
  const newClient: User = {
    ...clientData,
    id: newId,
    role: 'client',
    supabaseUserId: clientData.supabaseUserId || `temp-${newId}`,
    data: {
      factures: [],
      contenus: [],
      credentials: [],
      rapports: []
    }
  }
  
  authData.users.push(newClient)
  saveAuthData(authData)
  return newClient
}

// ✅ Supprimer un client
export const deleteClient = (clientId: string): void => {
  const authData = loadAuthData()
  authData.users = authData.users.filter(u => u.id !== clientId)
  saveAuthData(authData)
}

// ✅ Fonction pour récupérer un client par son Supabase ID
export const getClientBySupabaseId = (supabaseUserId: string): User | null => {
  const authData = loadAuthData()
  return authData.users.find(u => u.supabaseUserId === supabaseUserId && u.role === 'client') || null
}

// ✅ Mettre à jour le Supabase User ID d'un client
export const updateClientSupabaseId = (clientId: string, supabaseUserId: string): void => {
  const authData = loadAuthData()
  const clientIndex = authData.users.findIndex(u => u.id === clientId)
  
  if (clientIndex !== -1) {
    authData.users[clientIndex].supabaseUserId = supabaseUserId
    saveAuthData(authData)
    console.log(`✅ Supabase ID mis à jour pour client ${clientId}: ${supabaseUserId}`)
  }
}

// ✅ Fonction de migration pour les clients existants sans Supabase ID
export const migrateExistingClients = async (): Promise<void> => {
  const authData = loadAuthData()
  const clientsWithoutSupabaseId = authData.users.filter(u => 
    u.role === 'client' && (!u.supabaseUserId || u.supabaseUserId.startsWith('temp-'))
  )
  
  if (clientsWithoutSupabaseId.length === 0) {
    console.log('✅ Tous les clients ont déjà un Supabase ID')
    return
  }
  
  console.log(`🔄 Migration de ${clientsWithoutSupabaseId.length} clients vers Supabase...`)
  
  for (const client of clientsWithoutSupabaseId) {
    try {
      const { data, error } = await createClientUser(
        client.username,
        client.password,
        {
          name: client.name,
          company: client.company,
          role: 'client'
        }
      )
      
      if (data?.user) {
        updateClientSupabaseId(client.id, data.user.id)
        console.log(`✅ Client ${client.username} migré: ${data.user.id}`)
      } else {
        console.error(`❌ Erreur migration ${client.username}:`, error)
      }
    } catch (err) {
      console.error(`❌ Erreur fatale migration ${client.username}:`, err)
    }
  }
  
  console.log('✅ Migration terminée')
}