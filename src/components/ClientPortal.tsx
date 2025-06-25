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
  Eye
} from 'lucide-react';
import { supabase, listUserFactureFiles, getFacturePublicUrl } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { getClientBySupabaseId } from '../utils/authManager';

interface FactureFolder {
  id: string;
  name: string;
  hasPDF: boolean;
  pdfUrl?: string;
}

const ClientPortal: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('factures');
  const [factures, setFactures] = useState<FactureFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientData, setClientData] = useState<any>(null);

  console.log('🔍 ClientPortal - User:', user?.email || 'Aucun');

  // Récupérer les données du client depuis le localStorage
  useEffect(() => {
    if (user?.id) {
      const client = getClientBySupabaseId(user.id);
      if (client) {
        setClientData(client.data || {
          factures: [],
          contenus: [],
          credentials: [],
          rapports: []
        });
      }
    }
  }, [user?.id]);

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
          {/* Section Factures */}
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
                                <p className="text-sm text-gray-500">Montant</p>
                                <div className="flex items-center space-x-1">
                                  <Euro className="w-4 h-4 text-green-600" />
                                  <p className="font-semibold text-green-600">{formatMontant(facture.montant)}</p>
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