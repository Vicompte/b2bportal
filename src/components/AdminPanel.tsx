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
  ArrowLeft 
} from 'lucide-react';
import { 
  loadClientData, 
  saveClientData, 
  ClientData, 
  Facture, 
  Contenu, 
  Credential, 
  Rapport 
} from '../utils/clientDataManager';

interface AdminPanelProps {
  onBackToClient: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToClient }) => {
  const [activeTab, setActiveTab] = useState('factures');
  const [clientData, setClientData] = useState<ClientData>(() => loadClientData());
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Sauvegarder automatiquement les données quand elles changent
  useEffect(() => {
    saveClientData(clientData);
  }, [clientData]);

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

  // Gestion des factures
  const addFacture = (facture: Omit<Facture, 'id'>) => {
    const newFacture: Facture = {
      ...facture,
      id: getNextId(clientData.factures)
    };
    setClientData(prev => ({
      ...prev,
      factures: [...prev.factures, newFacture]
    }));
    setShowAddForm(false);
  };

  const updateFacture = (id: number, updatedFacture: Partial<Facture>) => {
    setClientData(prev => ({
      ...prev,
      factures: prev.factures.map(f => 
        f.id === id ? { ...f, ...updatedFacture } : f
      )
    }));
    setEditingItem(null);
  };

  const deleteFacture = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      setClientData(prev => ({
        ...prev,
        factures: prev.factures.filter(f => f.id !== id)
      }));
    }
  };

  // Gestion des contenus
  const addContenu = (contenu: Omit<Contenu, 'id'>) => {
    const newContenu: Contenu = {
      ...contenu,
      id: getNextId(clientData.contenus)
    };
    setClientData(prev => ({
      ...prev,
      contenus: [...prev.contenus, newContenu]
    }));
    setShowAddForm(false);
  };

  const updateContenu = (id: number, updatedContenu: Partial<Contenu>) => {
    setClientData(prev => ({
      ...prev,
      contenus: prev.contenus.map(c => 
        c.id === id ? { ...c, ...updatedContenu } : c
      )
    }));
    setEditingItem(null);
  };

  const deleteContenu = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
      setClientData(prev => ({
        ...prev,
        contenus: prev.contenus.filter(c => c.id !== id)
      }));
    }
  };

  // Gestion des identifiants
  const addCredential = (credential: Omit<Credential, 'id'>) => {
    const newCredential: Credential = {
      ...credential,
      id: getNextId(clientData.credentials)
    };
    setClientData(prev => ({
      ...prev,
      credentials: [...prev.credentials, newCredential]
    }));
    setShowAddForm(false);
  };

  const updateCredential = (id: number, updatedCredential: Partial<Credential>) => {
    setClientData(prev => ({
      ...prev,
      credentials: prev.credentials.map(c => 
        c.id === id ? { ...c, ...updatedCredential } : c
      )
    }));
    setEditingItem(null);
  };

  const deleteCredential = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet identifiant ?')) {
      setClientData(prev => ({
        ...prev,
        credentials: prev.credentials.filter(c => c.id !== id)
      }));
    }
  };

  // Gestion des rapports
  const addRapport = (rapport: Omit<Rapport, 'id'>) => {
    const newRapport: Rapport = {
      ...rapport,
      id: getNextId(clientData.rapports)
    };
    setClientData(prev => ({
      ...prev,
      rapports: [...prev.rapports, newRapport]
    }));
    setShowAddForm(false);
  };

  const updateRapport = (id: number, updatedRapport: Partial<Rapport>) => {
    setClientData(prev => ({
      ...prev,
      rapports: prev.rapports.map(r => 
        r.id === id ? { ...r, ...updatedRapport } : r
      )
    }));
    setEditingItem(null);
  };

  const deleteRapport = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      setClientData(prev => ({
        ...prev,
        rapports: prev.rapports.filter(r => r.id !== id)
      }));
    }
  };

  // Formulaires d'ajout/édition
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
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Panel Admin</h1>
                <p className="text-purple-200 text-sm">Gestion de {clientData.name} - {clientData.company}</p>
              </div>
            </div>
            <button
              onClick={onBackToClient}
              className="flex items-center space-x-2 bg-purple-500 px-4 py-2 rounded-lg hover:bg-purple-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour Client</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation tabs */}
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

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Section Factures */}
          {activeTab === 'factures' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-semibold">Gestion des Factures</h3>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une facture
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
                {clientData.factures.map((facture) => (
                  <div key={facture.id} className="border border-gray-200 rounded-lg p-4">
                    {editingItem?.id === facture.id ? (
                      <FactureForm
                        facture={facture}
                        onSave={(updatedFacture: Partial<Facture>) => updateFacture(facture.id, updatedFacture)}
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
                              <p className="font-medium">{formatDate(facture.date)}</p>
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
                ))}
                {clientData.factures.length === 0 && !showAddForm && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune facture pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section Contenus */}
          {activeTab === 'contenus' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-semibold">Gestion des Contenus</h3>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un contenu
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
                {clientData.contenus.map((contenu) => (
                  <div key={contenu.id} className="border border-gray-200 rounded-lg p-4">
                    {editingItem?.id === contenu.id ? (
                      <ContenuForm
                        contenu={contenu}
                        onSave={(updatedContenu: Partial<Contenu>) => updateContenu(contenu.id, updatedContenu)}
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
                ))}
                {clientData.contenus.length === 0 && !showAddForm && (
                  <div className="text-center py-8 text-gray-500">
                    <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun contenu pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section Identifiants */}
          {activeTab === 'credentials' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-semibold">Gestion des Identifiants</h3>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un identifiant
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
                {clientData.credentials.map((credential) => (
                  <div key={credential.id} className="border border-gray-200 rounded-lg p-4">
                    {editingItem?.id === credential.id ? (
                      <CredentialForm
                        credential={credential}
                        onSave={(updatedCredential: Partial<Credential>) => updateCredential(credential.id, updatedCredential)}
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
                ))}
                {clientData.credentials.length === 0 && !showAddForm && (
                  <div className="text-center py-8 text-gray-500">
                    <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun identifiant pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section Rapports */}
          {activeTab === 'rapports' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-semibold">Gestion des Rapports</h3>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un rapport
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
                {clientData.rapports.map((rapport) => (
                  <div key={rapport.id} className="border border-gray-200 rounded-lg p-4">
                    {editingItem?.id === rapport.id ? (
                      <RapportForm
                        rapport={rapport}
                        onSave={(updatedRapport: Partial<Rapport>) => updateRapport(rapport.id, updatedRapport)}
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
                ))}
                {clientData.rapports.length === 0 && !showAddForm && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun rapport pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;