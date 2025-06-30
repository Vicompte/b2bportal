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
  Calculator,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  Euro,
  Calendar,
  DollarSign
} from 'lucide-react';
import { 
  loadClientData, 
  saveClientData, 
  ClientData, 
  Facture, 
  Contenu, 
  Credential, 
  Rapport,
  RecapitulatifTVA,
  calculerMontantTVA,
  calculerMontantTTC,
  calculerRecapitulatifTVAClient
} from '../utils/clientDataManager';
import { 
  getAllClients, 
  addClient, 
  deleteClient, 
  updateClientData,
  createClientUser,
  User
} from '../utils/authManager';
import { uploadFacturePDF } from '../lib/supabase';

interface StatsGlobales {
  totalFactures: number;
  facturesPayees: number;
  facturesEnAttente: number;
  montantTotalPaye: number;
  montantTotalEnAttente: number;
  totalTVA: number;
  totalHT: number;
  totalTTC: number;
}

interface StatsClient {
  clientId: string;
  clientName: string;
  clientCompany: string;
  totalFactures: number;
  facturesPayees: number;
  facturesEnAttente: number;
  montantPaye: number;
  montantEnAttente: number;
  tvaClient: number;
}

interface FactureEnAttente {
  clientId: string;
  clientName: string;
  clientCompany: string;
  facture: Facture;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [showClientPanel, setShowClientPanel] = useState(false);
  const [recapitulatifTVA, setRecapitulatifTVA] = useState<RecapitulatifTVA[]>([]);

  // Charger les clients
  useEffect(() => {
    refreshClients();
  }, []);

  // Calculer le récapitulatif TVA
  useEffect(() => {
    if (activeTab === 'tva' || activeTab === 'overview') {
      const recap = clients.map(client => 
        calculerRecapitulatifTVAClient(
          client.id, 
          `${client.name} - ${client.company}`, 
          client.data?.factures || []
        )
      );
      setRecapitulatifTVA(recap);
    }
  }, [activeTab, clients]);

  const refreshClients = () => {
    setClients(getAllClients());
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

  // Calculer les statistiques globales
  const calculateStatsGlobales = (): StatsGlobales => {
    let stats: StatsGlobales = {
      totalFactures: 0,
      facturesPayees: 0,
      facturesEnAttente: 0,
      montantTotalPaye: 0,
      montantTotalEnAttente: 0,
      totalTVA: 0,
      totalHT: 0,
      totalTTC: 0
    };

    clients.forEach(client => {
      if (!client.data?.factures) return;
      
      client.data.factures.forEach((facture: any) => {
        stats.totalFactures++;
        
        const montantTTC = facture.montantTTC || facture.montant || 0;
        const montantHT = facture.montantHT || 0;
        const montantTVA = facture.montantTVA || 0;
        
        stats.totalHT += montantHT;
        stats.totalTTC += montantTTC;
        stats.totalTVA += montantTVA;
        
        if (facture.statut === 'payee') {
          stats.facturesPayees++;
          stats.montantTotalPaye += montantTTC;
        } else {
          stats.facturesEnAttente++;
          stats.montantTotalEnAttente += montantTTC;
        }
      });
    });

    return stats;
  };

  // Calculer les statistiques par client
  const calculateStatsParClient = (): StatsClient[] => {
    return clients.map(client => {
      let clientStats: StatsClient = {
        clientId: client.id,
        clientName: client.name || 'N/A',
        clientCompany: client.company || 'N/A',
        totalFactures: 0,
        facturesPayees: 0,
        facturesEnAttente: 0,
        montantPaye: 0,
        montantEnAttente: 0,
        tvaClient: 0
      };

      if (client.data?.factures) {
        client.data.factures.forEach((facture: any) => {
          clientStats.totalFactures++;
          
          const montantTTC = facture.montantTTC || facture.montant || 0;
          const montantTVA = facture.montantTVA || 0;
          
          if (facture.statut === 'payee') {
            clientStats.facturesPayees++;
            clientStats.montantPaye += montantTTC;
          } else {
            clientStats.facturesEnAttente++;
            clientStats.montantEnAttente += montantTTC;
          }
          
          clientStats.tvaClient += montantTVA;
        });
      }

      return clientStats;
    }).filter(stats => stats.totalFactures > 0);
  };

  // Lister toutes les factures en attente
  const getFacturesEnAttente = (): FactureEnAttente[] => {
    const facturesEnAttente: FactureEnAttente[] = [];
    
    clients.forEach(client => {
      if (!client.data?.factures) return;
      
      client.data.factures
        .filter((facture: any) => facture.statut === 'en_attente')
        .forEach((facture: any) => {
          facturesEnAttente.push({
            clientId: client.id,
            clientName: client.name || 'N/A',
            clientCompany: client.company || 'N/A',
            facture
          });
        });
    });

    return facturesEnAttente.sort((a, b) => 
      new Date(a.facture.date).getTime() - new Date(b.facture.date).getTime()
    );
  };

  const handleAddClient = async (clientData: any) => {
    try {
      console.log('🔄 Création client complet...', clientData.username);

      const { data: supabaseUser, error } = await createClientUser(
        clientData.username,
        clientData.password,
        { name: clientData.name, company: clientData.company }
      );

      if (error || !supabaseUser?.user?.id) {
        alert('❌ Erreur création compte Supabase: ' + (error?.message || 'Utilisateur non créé'));
        return;
      }

      console.log('✅ Compte Supabase créé:', supabaseUser.user.id);

      const newClient = addClient({
        ...clientData,
        supabaseUserId: supabaseUser.user.id
      });

      refreshClients();
      setShowAddClientForm(false);
      alert('✅ Client créé avec succès !');
      
    } catch (error: any) {
      console.error('❌ Erreur création client:', error);
      alert('❌ Erreur lors de la création: ' + error.message);
    }
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      deleteClient(clientId);
      refreshClients();
    }
  };

  const handleClientPanelData = (clientId: string, newData: any) => {
    updateClientData(clientId, newData);
    refreshClients();
  };

  const handleUploadPDF = async (clientId: string, factureId: string, file: File) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client?.supabaseUserId) {
        alert('❌ Client sans ID Supabase');
        return;
      }

      const { data, error } = await uploadFacturePDF(client.supabaseUserId, factureId, file);
      
      if (error) {
        alert('❌ Erreur upload: ' + error.message);
        return;
      }

      alert('✅ PDF uploadé avec succès !');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const statsGlobales = calculateStatsGlobales();
  const statsParClient = calculateStatsParClient();
  const facturesEnAttenteListe = getFacturesEnAttente();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard Administrateur</h1>
                <p className="text-purple-200">Gestion complète - Infinity Agency</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-purple-200">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation tabs */}
        <nav className="flex flex-wrap gap-1 mb-6">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'tva', label: 'Récapitulatif TVA', icon: Calculator }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowAddClientForm(false);
                  setShowClientPanel(false);
                }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Section Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-purple-600" />
                Vue d'ensemble - Tous les clients
              </h3>
              
              {/* Cartes statistiques globales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Clients</p>
                      <p className="text-3xl font-bold">{clients.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Factures Payées</p>
                      <p className="text-3xl font-bold">{statsGlobales.facturesPayees}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">En Attente</p>
                      <p className="text-3xl font-bold">{statsGlobales.facturesEnAttente}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">TVA à Collecter</p>
                      <p className="text-2xl font-bold">{formatMontant(statsGlobales.totalTVA)}</p>
                    </div>
                    <Calculator className="w-8 h-8 text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Cartes financières supplémentaires */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium">Total HT</p>
                      <p className="text-2xl font-bold">{formatMontant(statsGlobales.totalHT)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-indigo-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Total TTC</p>
                      <p className="text-2xl font-bold">{formatMontant(statsGlobales.totalTTC)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-emerald-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">En Attente TTC</p>
                      <p className="text-2xl font-bold">{formatMontant(statsGlobales.montantTotalEnAttente)}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-200" />
                  </div>
                </div>
              </div>

              {/* Tableau récapitulatif des factures par client */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-600" />
                  Récapitulatif Factures par Client
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Client</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Total Factures</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Payées</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">En Attente</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Montant Payé</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Montant En Attente</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">TVA Client</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {statsParClient.map((clientStats) => (
                        <tr key={clientStats.clientId} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{clientStats.clientName}</p>
                              <p className="text-sm text-gray-500">{clientStats.clientCompany}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{clientStats.totalFactures}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                              {clientStats.facturesPayees}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
                              {clientStats.facturesEnAttente}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-green-600">
                            {formatMontant(clientStats.montantPaye)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-orange-600">
                            {formatMontant(clientStats.montantEnAttente)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-purple-600">
                            {formatMontant(clientStats.tvaClient)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {statsParClient.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune donnée de facturation disponible</p>
                  </div>
                )}
              </div>

              {/* Factures en attente de paiement - Vue prioritaire */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Factures en Attente de Paiement ({facturesEnAttenteListe.length})
                </h4>
                
                {facturesEnAttenteListe.length > 0 ? (
                  <div className="space-y-3">
                    {facturesEnAttenteListe.map((item) => (
                      <div key={`${item.clientId}-${item.facture.id}`} 
                           className="bg-white border border-red-200 rounded-lg p-4 flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium text-gray-900">{item.clientName}</p>
                              <p className="text-sm text-gray-500">{item.clientCompany}</p>
                            </div>
                            <div>
                              <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{item.facture.numero}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="text-sm">{formatDate(item.facture.date)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-red-600">
                            {formatMontant(item.facture.montantTTC || item.facture.montant || 0)}
                          </p>
                          <p className="text-sm text-gray-500">
                            TVA: {formatMontant(item.facture.montantTVA || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="text-green-700 font-medium">Aucune facture en attente de paiement</p>
                    <p className="text-green-600 text-sm">Tous les paiements sont à jour !</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section Clients */}
          {activeTab === 'clients' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-semibold">Gestion des Clients</h3>
                <button
                  onClick={() => setShowAddClientForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un client
                </button>
              </div>

              {showAddClientForm && (
                <div className="mb-6 bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">Nouveau Client</h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleAddClient({
                      name: formData.get('name'),
                      company: formData.get('company'),
                      username: formData.get('username'),
                      password: formData.get('password')
                    });
                  }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input
                          type="text"
                          name="name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                        <input
                          type="text"
                          name="company"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="username"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <input
                          type="password"
                          name="password"
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
                        onClick={() => setShowAddClientForm(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4 inline mr-2" />
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                  <div key={client.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{client.name}</h4>
                        <p className="text-sm text-gray-500">{client.company}</p>
                        <p className="text-sm text-gray-400">{client.username}</p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowClientPanel(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Gérer les données"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Factures:</span>
                        <span className="font-medium">{client.data?.factures?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Contenus:</span>
                        <span className="font-medium">{client.data?.contenus?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Identifiants:</span>
                        <span className="font-medium">{client.data?.credentials?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Rapports:</span>
                        <span className="font-medium">{client.data?.rapports?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {clients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  <p>Aucun client pour le moment</p>
                </div>
              )}
            </div>
          )}

          {/* Section Récapitulatif TVA */}
          {activeTab === 'tva' && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Calculator className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold">Récapitulatif TVA</h3>
              </div>

              {/* Totaux généraux */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total TVA à collecter</p>
                      <p className="text-2xl font-bold">
                        {formatMontant(recapitulatifTVA.reduce((sum, r) => sum + r.totalTVAGlobale, 0))}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">TVA 0%</p>
                      <p className="text-2xl font-bold">
                        {formatMontant(recapitulatifTVA.reduce((sum, r) => sum + r.totalTVA0, 0))}
                      </p>
                    </div>
                    <Calculator className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">TVA 21%</p>
                      <p className="text-2xl font-bold">
                        {formatMontant(recapitulatifTVA.reduce((sum, r) => sum + r.totalTVA21, 0))}
                      </p>
                    </div>
                    <Calculator className="w-8 h-8 text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Tableau détaillé */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Client</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total HT</th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">TVA 0%</th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">TVA 21%</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total TVA</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total TTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recapitulatifTVA.map((recap) => (
                      <tr key={recap.clientId} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 font-medium">{recap.clientName}</td>
                        <td className="border border-gray-300 px-4 py-3 text-right">{formatMontant(recap.totalFacturesHT)}</td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <div className="text-sm">
                            <div className="font-semibold">{formatMontant(recap.totalTVA0)}</div>
                            <div className="text-gray-500">({recap.nbFactures0} factures)</div>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <div className="text-sm">
                            <div className="font-semibold">{formatMontant(recap.totalTVA21)}</div>
                            <div className="text-gray-500">({recap.nbFactures21} factures)</div>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-green-600">
                          {formatMontant(recap.totalTVAGlobale)}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right font-bold">
                          {formatMontant(recap.totalTTC)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-gray-300 px-4 py-3">TOTAUX</td>
                      <td className="border border-gray-300 px-4 py-3 text-right">
                        {formatMontant(recapitulatifTVA.reduce((sum, r) => sum + r.totalFacturesHT, 0))}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {formatMontant(recapitulatifTVA.reduce((sum, r) => sum + r.totalTVA0, 0))}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {formatMontant(recapitulatifTVA.reduce((sum, r) => sum + r.totalTVA21, 0))}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right text-green-600">
                        {formatMontant(recapitulatifTVA.reduce((sum, r) => sum + r.totalTVAGlobale, 0))}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right">
                        {formatMontant(recapitulatifTVA.reduce((sum, r) => sum + r.totalTTC, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {recapitulatifTVA.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune donnée TVA disponible</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Panel de gestion client */}
      {showClientPanel && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Gestion de {selectedClient.name} - {selectedClient.company}
                </h3>
                <button
                  onClick={() => setShowClientPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Utilisez le panel d'administration pour gérer les données de ce client.
              </p>
              <div className="flex space-x-4">
                <div className="text-sm">
                  <span className="font-medium">Email:</span> {selectedClient.username}
                </div>
                <div className="text-sm">
                  <span className="font-medium">ID Supabase:</span> {selectedClient.supabaseUserId || 'Non défini'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;