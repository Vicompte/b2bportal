import React, { useState, useEffect } from 'react';
import { FileText, Download, LogOut, User, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, listUserFactureFiles, getFacturePublicUrl } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FactureFolder {
  id: string;
  name: string;
  hasPDF: boolean;
  pdfUrl?: string;
}

const ClientPortal: React.FC = () => {
  const { user, signOut } = useAuth();
  const [factures, setFactures] = useState<FactureFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Récupérer les factures du client
  useEffect(() => {
    const loadFactures = async () => {
      if (!user?.id) {
        console.log('Pas d\'ID utilisateur disponible');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        console.log('Chargement des factures pour l\'utilisateur:', user.id);

        // Lister tous les dossiers de factures pour cet utilisateur
        const { data, error } = await listUserFactureFiles(user.id);

        if (error) {
          console.error('Erreur lors du chargement des factures:', error);
          setError('Erreur lors du chargement des factures');
          return;
        }

        console.log('Données reçues:', data);

        if (!data || data.length === 0) {
          console.log('Aucune facture trouvée');
          setFactures([]);
          return;
        }

        // Traiter les dossiers de factures
        const facturePromises = data
          .filter(item => item.name && item.name !== '.emptyFolderPlaceholder')
          .map(async (folder) => {
            const factureId = folder.name;
            
            try {
              // Vérifier si le PDF existe dans ce dossier
              const { data: files, error: listError } = await supabase.storage
                .from('factures')
                .list(`${user.id}/${factureId}`, { limit: 10 });

              if (listError) {
                console.error(`Erreur lors de la vérification du PDF pour ${factureId}:`, listError);
              }

              const hasPDF = files?.some(file => file.name === 'facture.pdf') || false;
              const pdfUrl = hasPDF ? getFacturePublicUrl(user.id, factureId) : undefined;

              console.log(`Facture ${factureId}: PDF=${hasPDF}, URL=${pdfUrl}`);

              return {
                id: factureId,
                name: factureId,
                hasPDF,
                pdfUrl
              };
            } catch (err) {
              console.error(`Erreur pour la facture ${factureId}:`, err);
              return {
                id: factureId,
                name: factureId,
                hasPDF: false,
                pdfUrl: undefined
              };
            }
          });

        const facturesData = await Promise.all(facturePromises);
        console.log('Factures traitées:', facturesData);
        setFactures(facturesData.sort((a, b) => a.name.localeCompare(b.name)));

      } catch (err) {
        console.error('Erreur générale:', err);
        setError('Une erreur est survenue lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };

    loadFactures();
  }, [user?.id]);

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
      console.error('Erreur lors du téléchargement:', err);
      // Fallback: ouvrir dans un nouvel onglet
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

  // Récupérer le nom du client depuis les métadonnées Supabase
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
                    console.error('Erreur de chargement du logo');
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
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Se déconnecter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes Factures</h2>
          <p className="text-gray-600">Consultez et téléchargez vos factures PDF</p>
        </div>

        {/* Informations de debug en développement */}
        {import.meta.env.DEV && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Debug:</strong> User ID: {user?.id || 'Non défini'} | 
              Email: {user?.email || 'Non défini'} | 
              Factures: {factures.length}
            </p>
          </div>
        )}

        {/* État de chargement */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement de vos factures...</p>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Liste des factures */}
        {!isLoading && !error && (
          <>
            {factures.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture disponible</h3>
                <p className="text-gray-500">Vos factures apparaîtront ici une fois qu'elles seront disponibles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {factures.map((facture) => (
                  <div
                    key={facture.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            Facture {facture.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {facture.hasPDF ? 'PDF disponible' : 'PDF non disponible'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {facture.hasPDF && facture.pdfUrl ? (
                          <button
                            onClick={() => handleDownload(facture.pdfUrl!, facture.name)}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            <Download className="w-4 h-4" />
                            <span>Télécharger PDF</span>
                          </button>
                        ) : (
                          <div className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-500 px-4 py-3 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <span>PDF non disponible</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Informations supplémentaires */}
        {!isLoading && !error && factures.length > 0 && (
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Besoin d'aide ?
                </h3>
                <p className="text-sm text-blue-700">
                  Si vous ne trouvez pas une facture ou si vous avez des questions, 
                  contactez-nous à <strong>contact@infinityagency.be</strong>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientPortal;