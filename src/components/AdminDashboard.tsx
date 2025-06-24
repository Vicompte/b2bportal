import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Video, 
  Key, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  ArrowLeft,
  Eye,
  UserPlus,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User,
  getAllClients,
  updateClientData,
  addClient,
  deleteClient
} from '../utils/authManager';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeDataTab, setActiveDataTab] = useState('factures');
  
  const { currentUser, logout } = useAuth();

  // Charger les clients
  useEffect(() => {
    setClients(getAllClients());
  }, []);

  // Recharger les clients après modification
  const refreshClients = () => {
    setClients(getAllClients());
    if (selectedClient) {
      const updatedClient = getAllClients().find(c => c.id === selectedClient.id);
      setSelectedClient(updatedClient || null);
    }
  };

  // Fonctions utilitaires
  const getNextId = (items: any[]): number => {
    return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  };

  // Gestion des clients
  const handleAddClient = (clientData: any) => {
    addClient(clientData);
    refreshClients();
    setShowAddClientForm(false);
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      deleteClient(clientId);
      refreshClients();
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
    }
  };

  // Gestion des données client
  const updateClientDataAndRefresh = (clientId: string, newData: any) => {
    updateClientData(clientId, newData);
    refreshClients();
  };

  // CRUD pour les factures
  const addFacture = (facture: any) => {
    if (!selectedClient) return;
    
    const newFacture = {
      ...facture,
      id: getNextId(selectedClient.data?.factures || [])
    };
    
    const updatedData = {
      ...selectedClient.data,
      factures: [...(selectedClient.data?.factures || []), newFacture]
    };
    
    updateClientDataAndRefresh(selectedClient.id, updatedData);
    setShowAddForm(false);
  };

  const updateFacture = (id: number, updatedFacture: any) => {
    if (!selectedClient) return;
    
    const updatedData = {
      ...selectedClient.data,
      factures: selectedClient.data?.factures?.map(f => 
        f.id === id ? { ...f, ...updatedFacture } : f
      ) || []
    };
    
    updateClientDataAndRefresh(selectedClient.id, updatedData);
    setEditingItem(null);
  };

  const deleteFacture = (id: number) => {
    if (!selectedClient || !confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;
    
    const updatedData = {
      ...selectedClient.data,
      factures: selectedClient.data?.factures?.filter(f => f.id !== id) || []
    };
    
    updateClientDataAndRefresh(selectedClient.id, updatedData);
  };

  // CRUD pour les contenus
  const addContenu = (contenu: any) => {
    if (!selectedClient) return;
    
    const newContenu = {
      ...contenu,
      id: getNextId(selectedClient.data?.contenus || [])
    };
    
    const updatedData = {
      ...selectedClient.data,
      contenus: [...(selectedClient.data?.contenus || []), newContenu]
    };
    
    updateClientDataAndRefresh(selectedClient.id, updatedData);
    setShowAddForm(false);
  };

  const updateContenu = (id: number, updatedContenu: any) => {
    if (!selectedClient) return;
    
    const updatedData = {
      ...selectedClient.data,
      contenus: selectedClient.data?.contenus?.map(c => 
        c.id === id ? { ...c, ...updatedContenu } : c
      ) || []
    };
    
    updateClientDataAndRefresh(selectedClient.id, updatedData);
    setEditingItem(null);
  };

  const deleteContenu = (id: number) => {
    if (!selectedClient || !confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return;
    
    const updatedData = {
      ...selectedClient.data,
      contenus: selectedClient.data?.contenus?.filter(c => c.id !== id) || []
    };
    
    updateClientDataAndRefresh(selectedClient.id, updatedData);
  };

  // CRUD pour les credentials
  const addCredential = (credential: any) => {
    if (!selectedClient) return;
    
    const newCredential = {
      ...credential,
      id: getNextId(selectedClient.data?.credentials || [])
    };
    
    const updatedData = {
      ...selectedClient.data,
      credentials: [...(selectedClient.data?.credentials || []), newCredential]
    };
    
    updateClientDataAndRefresh(selectedClient.id, updatedData);
    setShowAddForm(false);
  };

  const updateCredential = (id: number, updatedCredential: any) => {
    if (!selectedClient) return;
    
    const updatedData = {
      ...selectedClient.data,
      credentials: selectedClient.data?.credentials?.map(c => 
        c.id === id ? { ...c, ...updatedCredential } : c
      ) || []
    };
    
    updateClientDataAndRefresh(selectedClient.id, updatedData);
    setEditingItem(null);
  };

  const deleteCredential = (id: number) => {
    if (!selectedClient || !confirm('Êtes-vous sûr de vouloir supprimer cet identifiant ?')) return;
    
    const updatedData = {
      ...selectedClient.data,
      credentials: selectedClient.data?.credentials?.filter(c => c.id !== id) || []
    };
    
    updateClientDataAndRefresh(selectedClient.id, updatedData);
  };

  // CRUD pour les rapports
  const addRapport = (rapport: any) => {
    if (!selectedClient) return;
    
    const newRapport = {
      ...rapport,
      id: getNextId(selectedClient.data?.rapports || [])
    };
    
    const updatedData = {
      ...selectedClient.data,
      rapports: [...(selectedClient.data?.rapports || []), newRapport]
    };
    
    updateClientDataAndRefresh(selectedClient.id, updatedData);
    setShowAddForm(false);
  };

  const updateRapport = (id: number, updatedRapport: any) => {
    if (!selectedClient) return;
    
    const updatedData = {
      ...selectedClient.data,
      rapports: selectedClient.data?.rapports?.map(r => 
        r.id === id ? { ...r, ...updatedRapport } : r
      ) || []
    };
    
    updateClientDataAndRefresh(selectedClient.id, updatedData);
    setEditingItem(null);
  };

  const deleteRapport = (id: number) => {
    if (!selectedClient || !confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;
    
    const updatedData = {
      ...selectedClient.data,
      rapports: selectedClient.data?.rapports?.filter(r => r.id !== id) || []
    };
    
    updateClientDataAndRefresh(selectedClient.id, updatedData);
  };

  // Formulaires
  const ClientForm = ({ onSave, onCancel }: any) => {
    const [formData, setFormData] = useState({
      username: '',
      password: '',
      name: '',
      company: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold mb-4">Ajouter un nouveau client</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Créer le client
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4 inline mr-2" />
            Annuler
          </button>
        </div>
      </form>
    );
  };

  const FactureForm = ({ facture, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState(facture || {
      numero: '',
      date: new Date().toISOString().split('T')[0],
      montant: 0,
      statut: 'en_attente',
      description: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
            <input
              type="text"
              value={formData.numero}
              onChange={(e) => setFormData({...formData, numero: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
            <input
              type="number"
              value={formData.montant}
              onChange={(e) => setFormData({...formData, montant: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({...formData, statut: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="en_attente">En attente</option>
              <option value="payee">Payée</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            required
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Sauvegarder
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4 inline mr-2" />
            Annuler
          </button>
        </div>
      </form>
    );
  };

  const ContenuForm = ({ contenu, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState(contenu || {
      nom: '',
      lien: '',
      date: new Date().toISOString().split('T')[0],
      type: 'video'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="video">Vidéo</option>
              <option value="photo">Photo</option>
              <option value="design">Design</option>
              <option value="branding">Branding</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lien Google Drive</label>
          <input
            type="url"
            value={formData.lien}
            onChange={(e) => setFormData({...formData, lien: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Sauvegarder
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4 inline mr-2" />
            Annuler
          </button>
        </div>
      </form>
    );
  };

  const CredentialForm = ({ credential, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState(credential || {
      service: '',
      username: '',
      password: '',
      url: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <input
              type="text"
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Sauvegarder
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4 inline mr-2" />
            Annuler
          </button>
        </div>
      </form>
    );
  };

  const RapportForm = ({ rapport, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState(rapport || {
      nom: '',
      lien: '',
      date: new Date().toISOString().split('T')[0],
      type: 'seo'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="seo">SEO</option>
              <option value="performance">Performance</option>
              <option value="ads">Publicité</option>
              <option value="security">Sécurité</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lien du rapport</label>
          <input
            type="url"
            value={formData.lien}
            onChange={(e) => setFormData({...formData, lien: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Sauvegarder
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4 inline mr-2" />
            Annuler
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Dashboard Admin</h1>
                <p className="text-purple-200 text-sm">Bienvenue {currentUser?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedClient ? (
          // Vue liste des clients
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Clients</h2>
              <button
                onClick={() => setShowAddClientForm(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Nouveau Client
              </button>
            </div>

            {showAddClientForm && (
              <div className="mb-6">
                <ClientForm
                  onSave={handleAddClient}
                  onCancel={() => setShowAddClientForm(false)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">{client.company}</p>
                      <p className="text-xs text-gray-400">{client.username}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{client.data?.factures?.length || 0}</p>
                      <p className="text-gray-500">Factures</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{client.data?.contenus?.length || 0}</p>
                      <p className="text-gray-500">Contenus</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Gérer
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Vue gestion d'un client spécifique
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h2>
                  <p className="text-gray-600">{selectedClient.company}</p>
                </div>
              </div>
            </div>

            {/* Navigation tabs pour les données du client */}
            <nav className="flex flex-wrap gap-1 mb-6">
              {[
                { id: 'factures', label: 'Factures', icon: FileText },
                { id: 'contenus', label: 'Contenus', icon: Video },
                { id: 'credentials', label: 'Identifiants', icon: Key },
                { id: 'rapports', label: 'Rapports', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveDataTab(tab.id);
                      setShowAddForm(false);
                      setEditingItem(null);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeDataTab === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Contenu basé sur l'onglet actif */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeDataTab === 'factures' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Factures</h3>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </button>
                  </div>

                  {showAddForm && (
                    <div className="mb-6">
                      <FactureForm
                        onSave={addFacture}
                        onCancel={() => setShowAddForm(false)}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {selectedClient.data?.factures?.map((facture: any) => (
                      <div key={facture.id} className="border border-gray-200 rounded-lg p-4">
                        {editingItem?.id === facture.id ? (
                          <FactureForm
                            facture={facture}
                            onSave={(updatedFacture: any) => updateFacture(facture.id, updatedFacture)}
                            onCancel={() => setEditingItem(null)}
                          />
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Numéro</p>
                                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{facture.numero}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Date</p>
                                  <p>{formatDate(facture.date)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Montant</p>
                                  <p className="font-semibold">{formatMontant(facture.montant)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Statut</p>
                                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                    facture.statut === 'payee' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-orange-100 text-orange-800'
                                  }`}>
                                    {facture.statut === 'payee' ? 'Payée' : 'En attente'}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="text-sm">{facture.description}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => setEditingItem(facture)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteFacture(facture.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )) || []}
                    
                    {(!selectedClient.data?.factures || selectedClient.data.factures.length === 0) && !showAddForm && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Aucune facture pour ce client</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeDataTab === 'contenus' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Contenus</h3>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </button>
                  </div>

                  {showAddForm && (
                    <div className="mb-6">
                      <ContenuForm
                        onSave={addContenu}
                        onCancel={() => setShowAddForm(false)}
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    {selectedClient.data?.contenus?.map((contenu: any) => (
                      <div key={contenu.id} className="border border-gray-200 rounded-lg p-4">
                        {editingItem?.id === contenu.id ? (
                          <ContenuForm
                            contenu={contenu}
                            onSave={(updatedContenu: any) => updateContenu(contenu.id, updatedContenu)}
                            onCancel={() => setEditingItem(null)}
                          />
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Nom</p>
                                  <p className="font-medium">{contenu.nom}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Type</p>
                                  <p className="capitalize">{contenu.type}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Date</p>
                                  <p>{formatDate(contenu.date)}</p>
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">Lien</p>
                                <a 
                                  href={contenu.lien} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm break-all"
                                >
                                  {contenu.lien}
                                </a>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => setEditingItem(contenu)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteContenu(contenu.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )) || []}

                    {(!selectedClient.data?.contenus || selectedClient.data.contenus.length === 0) && !showAddForm && (
                      <div className="text-center py-8 text-gray-500">
                        <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Aucun contenu pour ce client</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeDataTab === 'credentials' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Identifiants</h3>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </button>
                  </div>

                  {showAddForm && (
                    <div className="mb-6">
                      <CredentialForm
                        onSave={addCredential}
                        onCancel={() => setShowAddForm(false)}
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    {selectedClient.data?.credentials?.map((credential: any) => (
                      <div key={credential.id} className="border border-gray-200 rounded-lg p-4">
                        {editingItem?.id === credential.id ? (
                          <CredentialForm
                            credential={credential}
                            onSave={(updatedCredential: any) => updateCredential(credential.id, updatedCredential)}
                            onCancel={() => setEditingItem(null)}
                          />
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Service</p>
                                  <p className="font-medium">{credential.service}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Nom d'utilisateur</p>
                                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{credential.username}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Mot de passe</p>
                                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{credential.password}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">URL</p>
                                  <a 
                                    href={credential.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm break-all"
                                  >
                                    {credential.url}
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => setEditingItem(credential)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteCredential(credential.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )) || []}

                    {(!selectedClient.data?.credentials || selectedClient.data.credentials.length === 0) && !showAddForm && (
                      <div className="text-center py-8 text-gray-500">
                        <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Aucun identifiant pour ce client</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeDataTab === 'rapports' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Rapports</h3>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </button>
                  </div>

                  {showAddForm && (
                    <div className="mb-6">
                      <RapportForm
                        onSave={addRapport}
                        onCancel={() => setShowAddForm(false)}
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    {selectedClient.data?.rapports?.map((rapport: any) => (
                      <div key={rapport.id} className="border border-gray-200 rounded-lg p-4">
                        {editingItem?.id === rapport.id ? (
                          <RapportForm
                            rapport={rapport}
                            onSave={(updatedRapport: any) => updateRapport(rapport.id, updatedRapport)}
                            onCancel={() => setEditingItem(null)}
                          />
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Nom</p>
                                  <p className="font-medium">{rapport.nom}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Type</p>
                                  <p className="capitalize">{rapport.type}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Date</p>
                                  <p>{formatDate(rapport.date)}</p>
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">Lien</p>
                                <a 
                                  href={rapport.lien} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm break-all"
                                >
                                  {rapport.lien}
                                </a>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => setEditingItem(rapport)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteRapport(rapport.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )) || []}

                    {(!selectedClient.data?.rapports || selectedClient.data.rapports.length === 0) && !showAddForm && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Aucun rapport pour ce client</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;