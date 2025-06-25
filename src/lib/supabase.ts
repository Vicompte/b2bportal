import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://epwncluftgwotsxvkfnl.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwd25jbHVmdGd3b3RzeHZrZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDQzNDgsImV4cCI6MjA2NjM4MDM0OH0.7u3wf-yXMgC0F8ghqUVMCwFVRb5m8UWUVsVKrkMUFpU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// ✅ Fonction de création d'utilisateur ROBUSTE
export const createClientUser = async (email: string, password: string, metadata: any) => {
  try {
    console.log('🔄 Création utilisateur Supabase:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: undefined
      }
    })

    if (error) {
      console.error('❌ Erreur création:', error.message)
      
      // Si l'utilisateur existe déjà, essayer de récupérer son ID
      if (error.message.includes('already registered')) {
        console.log('🔍 Utilisateur existe, tentative de récupération...')
        
        // Essayer de se connecter pour récupérer l'ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (signInData.user) {
          console.log('✅ Utilisateur récupéré:', signInData.user.id)
          await supabase.auth.signOut() // Déconnexion immédiate
          return { data: { user: signInData.user }, error: null }
        }
      }
      
      throw error
    }

    if (data.user) {
      console.log('✅ Nouvel utilisateur créé:', data.user.id)
      return { data, error: null }
    }

    throw new Error('Aucun utilisateur retourné')
  } catch (err) {
    console.error('❌ Erreur fatale création:', err)
    return { data: null, error: err }
  }
}

// ✅ Fonction d'upload PDF BULLETPROOF
export const uploadFacturePDF = async (userId: string, factureId: string, file: File) => {
  try {
    if (!userId || userId.startsWith('temp-')) {
      throw new Error('ID utilisateur Supabase invalide')
    }

    console.log(`🔄 Upload PDF: ${userId}/${factureId}`)
    
    const fileName = 'facture.pdf'
    const filePath = `${userId}/${factureId}/${fileName}`
    
    // Vérifier que le bucket existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    if (bucketsError) throw bucketsError
    
    const facturesBucket = buckets.find(b => b.id === 'factures')
    if (!facturesBucket) {
      throw new Error('Bucket "factures" non trouvé - Créez-le dans Supabase Dashboard')
    }

    // Upload avec remplacement
    const { data, error } = await supabase.storage
      .from('factures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    // Générer URL publique
    const { data: publicData } = supabase.storage
      .from('factures')
      .getPublicUrl(filePath)

    console.log('✅ Upload réussi:', publicData.publicUrl)

    return { 
      data, 
      error: null, 
      publicUrl: publicData.publicUrl 
    }
  } catch (error) {
    console.error('❌ Erreur upload:', error)
    return { data: null, error }
  }
}

// ✅ URL publique fiable
export const getFacturePublicUrl = (userId: string, factureId: string): string => {
  const filePath = `${userId}/${factureId}/facture.pdf`
  const { data } = supabase.storage
    .from('factures')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

// ✅ Vérification existence PDF
export const checkFacturePDFExists = async (userId: string, factureId: string): Promise<boolean> => {
  try {
    if (!userId || userId.startsWith('temp-')) return false
    
    const filePath = `${userId}/${factureId}/facture.pdf`
    const { data, error } = await supabase.storage
      .from('factures')
      .download(filePath)
    
    return !error && !!data
  } catch {
    return false
  }
}

// ✅ Liste des factures utilisateur
export const listUserFactureFiles = async (userId: string) => {
  try {
    if (!userId || userId.startsWith('temp-')) {
      return { data: [], error: null }
    }
    
    const { data, error } = await supabase.storage
      .from('factures')
      .list(userId, { limit: 100 })

    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}