import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  LogOut, 
  User, 
  AlertCircle, 
  Loader2,
  Video,
  Key,
  BarChart3,
  ExternalLink,
  Euro,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  TrendingUp,
  CreditCard,
  DollarSign,
  Calculator
} from 'lucide-react';
import { supabase, listUserFactureFiles, getFacturePublicUrl } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { getClientBySupabaseId } from '../utils/authManager';
import { migrerFacturesVersTVA } from '../utils/clientDataManager';

interface FactureFolder {
  id: string;
  name: string;
  hasPDF: boolean;
  pdfUrl?: string;
}

interface DashboardStats {
  totalFactures: number;
  facturesPayees: number;
  facturesEnAttente: number;
  montantTotalHT: number;
  montantTotalTTC: number;
  montantPayeTTC: number;
  montantEnAttenteTTC: number;
  totalTVA: number;
}

const ClientPortal: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [factures, setFactures] = useState<FactureFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientData, setClientData] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalFactures: 0,
    facturesPayees: 0,
    facturesEnAttente: 0,
    montantTotalHT: 0,
    montantTotalTTC: 0,
    montantPayeTTC: 0,
    montantEnAttenteTTC: 0,
    totalTVA: 0
  });

  console.log('🔍 ClientPortal - User:', user?.email || 'Aucun');

  // Récupérer les données du client depuis le localStorage
  useEffect(() => {
    if (user?.id) {
      const client = getClientBySupabaseId(user.id);
      if (client) {
        const data = client.data || {
          factures: [],
          contenus: [],
          credentials: [],
          rapports: []
        };
        
        // Migration automatique des factures
        if (data.factures) {
          data.factures = migrerFacturesVersTVA(data.factures);
        }
        
        setClientData(data);
      }
    }
  }, [user?.id]);

  // Calculer les statistiques du dashboard avec TVA
  useEffect(() => {
    if (clientData?.factures) {
      const factures = clientData.factures;
      
      const stats: DashboardStats = {
        totalFactures: factures.length,
        facturesPayees: factures.filter((f: any) => f.statut === 'payee').length,
        facturesEnAttente: factures.filter((f: any) => f.statut === 'en_attente').length,
        montantTotalHT: factures.reduce((total: number, f: any) => total + (f.montantHT || 0), 0),
        montantTotalTTC: factures.reduce((total: number, f: any) => total + (f.montantTTC || f.montant || 0), 0),
        montantPayeTTC: factures
          .filter((f: any) => f.statut === 'payee')
          .reduce((total: number, f: any) => total + (f.montantTTC || f.montant || 0), 0),
        montantEnAttenteTTC: factures
          .filter((f: any) => f.statut === 'en_attente')
          .reduce((total: number, f: any) => total + (f.montantTTC || f.montant || 0), 0),
        totalTVA: factures.reduce((total: number, f: any) => total + (f.montantTVA || 0), 0)
      };
      
      setDashboardStats(stats);
    }
  }, [clientData]);

  // Récupérer les factures PDF depuis Supabase
  useEffect(() => {
    const loadFactures = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const { data, error } = await listUserFactureFiles(user.id);

        if (error) {
          setError('Erreur lors du chargement des factures');
          return;
        }

        if (!data || data.length === 0) {
          setFactures([]);
          return;
        }

        const facturePromises = data
          .filter(item => item.name && item.name !== '.emptyFolderPlaceholder')
          .map(async (folder) => {
            const factureId = folder.name;
            
            try {
              const { data: files, error: listError } = await supabase.storage
                .from('factures')
                .list(`${user.id}/${factureId}`, { limit: 10 });

              const hasPDF = files?.some(file => file.name === 'facture.pdf') || false;
              const pdfUrl = hasPDF ? getFacturePublicUrl(user.id, factureId) : undefined;

              return {
                id: factureId,
                name: factureId,
                hasPDF,
                pdfUrl
              };
            } catch (err) {
              return {
                id: factureId,
                name: factureId,
                hasPDF: false,
                pdfUrl: undefined
              };
            }
          });

        const facturesData = await Promise.all(facturePromises);
        setFactures(facturesData.sort((a, b) => a.name.localeCompare(b.name)));

      } catch (err) {
        setError('Une erreur est survenue lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };

    loadFactures();
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  };

  const handleDownload = (pdfUrl: string, factureName: string) => {
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `facture-${factureName}.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  };

  // Trouver le PDF correspondant à une facture
  const getFacturePDF = (factureId: number) => {
    return factures.find(f => f.name === factureId.toString());
  };

  const clientName = user?.user_metadata?.name || user?.email || 'Client';

  // Composant Dashboard Stats avec TVA
  const DashboardSection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tableau de Bord</h2>
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total des factures */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Factures</p>
              <p className="text-3xl font-bold">{dashboardStats.totalFactures}</p>
            </div>
            <div className="w-12 h-12 bg-blue-400 bg-opacity-30 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Factures payées */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Factures Payées</p>
              <p className="text-3xl font-bold">{dashboardStats.facturesPayees}</p>
            </div>
            <div className="w-12 h-12 bg-green-400 bg-opacity-30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Factures en attente */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">En Attente</p>
              <p className="text-3xl font-bold">{dashboardStats.facturesEnAttente}</p>
            </div>
            <div className="w-12 h-12 bg-orange-400 bg-opacity-30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Montant total HT */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total HT</p>
              <p className="text-2xl font-bold">{formatMontant(dashboardStats.montantTotalHT)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-400 bg-opacity-30 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total TVA */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Total TVA</p>
              <p className="text-2xl font-bold">{formatMontant(dashboardStats.totalTVA)}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-400 bg-opacity-30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Montant total TTC */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Total TTC</p>
              <p className="text-2xl font-bold">{formatMontant(dashboardStats.montantTotalTTC)}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-400 bg-opacity-30 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Résumé rapide */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé Financier</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progression des paiements */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progression des Paiements</span>
              <span className="text-sm text-gray-500">
                {dashboardStats.totalFactures > 0 
                  ? Math.round((dashboardStats.facturesPayees / dashboardStats.totalFactures) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: dashboardStats.totalFactures > 0 
                    ? `${(dashboardStats.facturesPayees / dashboardStats.totalFactures) * 100}%`
                    : '0%'
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{dashboardStats.facturesPayees} payées</span>
              <span>{dashboardStats.facturesEnAttente} en attente</span>
            </div>
          </div>

          {/* Répartition des montants */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Répartition des Montants TTC</span>
              <span className="text-sm text-gray-500">
                {dashboardStats.montantTotalTTC > 0 
                  ? Math.round((dashboardStats.montantPayeTTC / dashboardStats.montantTotalTTC) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: dashboardStats.montantTotalTTC > 0 
                    ? `${(dashboardStats.montantPayeTTC / dashboardStats.montantTotalTTC) * 100}%`
                    : '0%'
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatMontant(dashboardStats.montantPayeTTC)} payé</span>
              <span>{formatMontant(dashboardStats.montantEnAttenteTTC)} en attente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Factures récentes */}
      {clientData?.factures && clientData.factures.length > 0 && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Factures Récentes</h3>
          <div className="space-y-3">
            {clientData.factures
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3)
              .map((facture: any) => (
                <div key={facture.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      facture.statut === 'payee' ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{facture.numero}</p>
                      <p className="text-sm text-gray-500">{formatDate(facture.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatMontant(facture.montantTTC || facture.montant || 0)}</p>
                    <p className={`text-xs ${
                      facture.statut === 'payee' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {facture.statut === 'payee' ? 'Payée' : 'En attente'}
                    </p>
                  </div>
                </div>
              ))}
          </div>
          <button
            onClick={() => setActiveTab('factures')}
            className="mt-4 w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Voir toutes les factures →
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex justify-center">
                <img 
                  src="/IMG_0214.PNG" 
                  alt="Infinity Agency Logo" 
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Bienvenue {clientName}
                </h1>
                <p className="text-sm text-gray-500">Portail Client - Infinity Agency</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Se déconnecter</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation tabs */}
        <nav className="flex flex-wrap gap-1 mb-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'factures', label: 'Factures', icon: FileText },
            { id: 'contenus', label: 'Contenus', icon: Video },
            { id: 'credentials', label: 'Identifiants', icon: Key },
            { id: 'rapports', label: 'Rapports', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Contenu des onglets */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Section Dashboard */}
          {activeTab === 'dashboard' && <DashboardSection />}

          {/* Section Factures avec TVA */}
          {activeTab === 'factures' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Factures</h2>
              
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Chargement...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {!isLoading && !error && (
                <div className="space-y-4">
                  {clientData?.factures?.map((facture: any) => {
                    const facturePDF = getFacturePDF(facture.id);
                    
                    return (
                      <div key={facture.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-500">Numéro</p>
                                <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{facture.numero}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <p>{formatDate(facture.date)}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Montant TTC</p>
                                <div className="flex items-center space-x-1">
                                  <Euro className="w-4 h-4 text-green-600" />
                                  <p className="font-semibold text-green-600">{formatMontant(facture.montantTTC || facture.montant || 0)}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Statut</p>
                                <div className="flex items-center space-x-1">
                                  {facture.statut === 'payee' ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-orange-600" />
                                  )}
                                  <span className={`text-sm font-medium ${
                                    facture.statut === 'payee' ? 'text-green-600' : 'text-orange-600'
                                  }`}>
                                    {facture.statut === 'payee' ? 'Payée' : 'En attente'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-sm text-gray-500">Description</p>
                              <p className="text-gray-700">{facture.description}</p>
                            </div>

                            {/* Détail TVA */}
                            {facture.montantHT !== undefined && (
                              <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                                  <Calculator className="w-4 h-4 mr-2" />
                                  Détail TVA
                                </h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Montant HT :</span>
                                    <span className="font-semibold ml-2">{formatMontant(facture.montantHT)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">TVA ({facture.tauxTVA}%) :</span>
                                    <span className="font-semibold ml-2">{formatMontant(facture.montantTVA || 0)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Total TTC :</span>
                                    <span className="font-bold text-lg text-blue-600 ml-2">{formatMontant(facture.montantTTC)}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Section PDF */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-5 h-5 text-gray-600" />
                                  <span className="font-medium">PDF Facture</span>
                                  {facturePDF?.hasPDF ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                  )}
                                </div>
                                {facturePDF?.hasPDF && facturePDF?.pdfUrl ? (
                                  <button
                                    onClick={() => handleDownload(facturePDF.pdfUrl!, facture.numero)}
                                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Télécharger</span>
                                  </button>
                                ) : (
                                  <span className="text-sm text-gray-500">PDF non disponible</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }) || []}

                  {(!clientData?.factures || clientData.factures.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                      <p>Aucune facture disponible</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section Contenus */}
          {activeTab === 'contenus' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Contenus</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientData?.contenus?.map((contenu: any) => (
                  <div key={contenu.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Video className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{contenu.nom}</h3>
                        <p className="text-sm text-gray-500 capitalize">{contenu.type}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">{formatDate(contenu.date)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <a
                      href={contenu.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Voir le contenu</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )) || []}

                {(!clientData?.contenus || clientData.contenus.length === 0) && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Video className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <p>Aucun contenu disponible</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section Identifiants */}
          {activeTab === 'credentials' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Identifiants</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clientData?.credentials?.map((credential: any) => (
                  <div key={credential.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Key className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{credential.service}</h3>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Nom d'utilisateur</p>
                            <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded border">{credential.username}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Mot de passe</p>
                            <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded border">{credential.password}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">URL</p>
                            <a
                              href={credential.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                            >
                              <span className="break-all">{credential.url}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )) || []}

                {(!clientData?.credentials || clientData.credentials.length === 0) && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Key className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <p>Aucun identifiant disponible</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section Rapports */}
          {activeTab === 'rapports' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Rapports</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientData?.rapports?.map((rapport: any) => (
                  <div key={rapport.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{rapport.nom}</h3>
                        <p className="text-sm text-gray-500 capitalize">{rapport.type}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">{formatDate(rapport.date)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <a
                      href={rapport.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Voir le rapport</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )) || []}

                {(!clientData?.rapports || clientData.rapports.length === 0) && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <p>Aucun rapport disponible</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section d'aide */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Besoin d'aide ?
              </h3>
              <p className="text-sm text-blue-700">
                Si vous ne trouvez pas une information ou si vous avez des questions, 
                contactez-nous à <strong>contact@infinityagency.be</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;