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
  UserPlus
} from 'lucide-react';
import { 
  User,
  getAllClients,
  updateClientData,
  addClient,
  deleteClient
} from '../utils/authManager';

interface AdminDashboardProps {
  onBackToClient: () => void;
  onLogout: () => void;
  currentUser: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToClient, onLogout, currentUser }) => {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

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

  // Formulaire d'ajout de client
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Dashboard Admin</h1>
                <p className="text-purple-200 text-sm">Bienvenue {currentUser.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onBackToClient}
                className="flex items-center space-x-2 bg-purple-500 px-4 py-2 rounded-lg hover:bg-purple-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>
              <button
                onClick={onLogout}
                className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Déconnexion
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
                      setActiveTab(tab.id);
                      setShowAddForm(false);
                      setEditingItem(null);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
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
              {activeTab === 'factures' && (
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
                  
                  <div className="space-y-4">
                    {selectedClient.data?.factures?.map((facture: any) => (
                      <div key={facture.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Numéro</p>
                            <p className="font-mono text-sm">{facture.numero}</p>
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
                    )) || []}
                    
                    {(!selectedClient.data?.factures || selectedClient.data.factures.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Aucune facture pour ce client</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Autres sections similaires pour contenus, credentials, rapports */}
              {activeTab === 'contenus' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contenus</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Gestion des contenus - À implémenter</p>
                  </div>
                </div>
              )}

              {activeTab === 'credentials' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Identifiants</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Gestion des identifiants - À implémenter</p>
                  </div>
                </div>
              )}

              {activeTab === 'rapports' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Rapports</h3>
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Gestion des rapports - À implémenter</p>
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