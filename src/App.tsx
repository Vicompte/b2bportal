import React, { useState } from 'react';
import { 
  FileText, 
  Video, 
  Key, 
  User, 
  CheckCircle, 
  Clock, 
  Euro,
  Copy,
  ExternalLink,
  Settings
} from 'lucide-react';
import AdminPanel from './components/AdminPanel';

// Types
interface Facture {
  id: number;
  numero: string;
  date: string;
  montant: number;
  statut: 'payee' | 'en_attente';
  description: string;
}

interface Contenu {
  id: number;
  nom: string;
  lien: string;
  date: string;
  type: string;
}

interface Credential {
  id: number;
  service: string;
  username: string;
  password: string;
  url: string;
}

interface Rapport {
  id: number;
  nom: string;
  lien: string;
  date: string;
  type: string;
}

// Données de démonstration - Modifiez ces données selon vos besoins
const clientData = {
  name: 'Martin Dubois',
  company: 'TechStart Innovation',
  factures: [
    {
      id: 1,
      numero: 'FAC-2025-001',
      date: '2025-01-15',
      montant: 3500,
      statut: 'payee' as const,
      description: 'Développement site web e-commerce'
    },
    {
      id: 2,
      numero: 'FAC-2025-002',
      date: '2025-02-01',
      montant: 1200,
      statut: 'en_attente' as const,
      description: 'Maintenance et SEO mensuel'
    },
    {
      id: 3,
      numero: 'FAC-2025-003',
      date: '2025-02-15',
      montant: 2800,
      statut: 'payee' as const,
      description: 'Campagne publicitaire Google Ads'
    },
    {
      id: 4,
      numero: 'FAC-2025-004',
      date: '2025-03-01',
      montant: 4200,
      statut: 'en_attente' as const,
      description: 'Refonte identité visuelle complète'
    }
  ] as Facture[],
  contenus: [
    {
      id: 1,
      nom: 'Vidéos Promotionnelles Q1 2025',
      lien: 'https://drive.google.com/drive/folders/1ABCDefGHijKLMnOPqrsTUVwxyz123456',
      date: '2025-01-20',
      type: 'video'
    },
    {
      id: 2,
      nom: 'Photos Produits E-commerce',
      lien: 'https://drive.google.com/drive/folders/2ABCDefGHijKLMnOPqrsTUVwxyz123456',
      date: '2025-02-05',
      type: 'photo'
    },
    {
      id: 3,
      nom: 'Bannières Publicitaires Facebook',
      lien: 'https://drive.google.com/drive/folders/3ABCDefGHijKLMnOPqrsTUVwxyz123456',
      date: '2025-02-18',
      type: 'design'
    },
    {
      id: 4,
      nom: 'Logo et Charte Graphique',
      lien: 'https://drive.google.com/drive/folders/4ABCDefGHijKLMnOPqrsTUVwxyz123456',
      date: '2025-03-02',
      type: 'branding'
    }
  ] as Contenu[],
  credentials: [
    {
      id: 1,
      service: 'WordPress Admin',
      username: 'admin@techstart-innovation.com',
      password: 'SecureWP2025!',
      url: 'https://techstart-innovation.com/wp-admin'
    },
    {
      id: 2,
      service: 'Google Analytics',
      username: 'analytics@techstart-innovation.com',
      password: 'Analytics@2025',
      url: 'https://analytics.google.com'
    },
    {
      id: 3,
      service: 'Search Console',
      username: 'webmaster@techstart-innovation.com',
      password: 'Console#2025',
      url: 'https://search.google.com/search-console'
    },
    {
      id: 4,
      service: 'Facebook Business',
      username: 'social@techstart-innovation.com',
      password: 'Facebook$2025',
      url: 'https://business.facebook.com'
    }
  ] as Credential[],
  rapports: [
    {
      id: 1,
      nom: 'Rapport SEO - Janvier 2025',
      lien: 'https://drive.google.com/file/d/1ABCDefGHijKLMnOPqrsTUVwxyz123456/view',
      date: '2025-01-31',
      type: 'seo'
    },
    {
      id: 2,
      nom: 'Analyse Performance Site - Février',
      lien: 'https://drive.google.com/file/d/2ABCDefGHijKLMnOPqrsTUVwxyz123456/view',
      date: '2025-02-28',
      type: 'performance'
    },
    {
      id: 3,
      nom: 'Rapport Campagne Google Ads',
      lien: 'https://drive.google.com/file/d/3ABCDefGHijKLMnOPqrsTUVwxyz123456/view',
      date: '2025-03-05',
      type: 'ads'
    },
    {
      id: 4,
      nom: 'Audit Sécurité Complet',
      lien: 'https://drive.google.com/file/d/4ABCDefGHijKLMnOPqrsTUVwxyz123456/view',
      date: '2025-03-15',
      type: 'security'
    }
  ] as Rapport[]
};

function App() {
  const [activeTab, setActiveTab] = useState('factures');
  const [showAdmin, setShowAdmin] = useState(false);

  // Calculs des statistiques
  const totalFactures = clientData.factures.length;
  const facturesPayees = clientData.factures.filter(f => f.statut === 'payee').length;
  const facturesAttente = clientData.factures.filter(f => f.statut === 'en_attente').length;
  const montantTotal = clientData.factures.reduce((total, f) => total + f.montant, 0);

  // Utilitaires
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copié dans le presse-papier !');
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      alert('Impossible de copier le texte');
    }
  };

  // Si on est en mode admin, afficher le panel admin
  if (showAdmin) {
    return <AdminPanel onBackToClient={() => setShowAdmin(false)} />;
  }

  // Composant Header
  const Header = () => (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{clientData.name}</h1>
              <p className="text-sm text-gray-500">{clientData.company}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAdmin(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500">Portail Client</p>
              <p className="text-lg font-semibold text-blue-600">Agence Digitale</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  // Composant Stats Dashboard
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Factures</p>
            <p className="text-2xl font-bold text-gray-900">{totalFactures}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Factures Payées</p>
            <p className="text-2xl font-bold text-gray-900">{facturesPayees}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">En Attente</p>
            <p className="text-2xl font-bold text-gray-900">{facturesAttente}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Euro className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Montant Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatMontant(montantTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Composant Navigation
  const Navigation = () => {
    const tabs = [
      { id: 'factures', label: 'Factures', icon: FileText },
      { id: 'contenus', label: 'Contenus', icon: Video },
      { id: 'credentials', label: 'Identifiants', icon: Key },
      { id: 'rapports', label: 'Rapports', icon: FileText }
    ];

    return (
      <nav className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    );
  };

  // Section Factures
  const FacturesSection = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Mes Factures</h2>
            <p className="text-sm text-gray-500">Consultez l'historique de vos factures et leur statut</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numéro
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientData.factures.map((facture) => (
              <tr key={facture.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {facture.numero}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(facture.date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {facture.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatMontant(facture.montant)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                    facture.statut === 'payee'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {facture.statut === 'payee' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>{facture.statut === 'payee' ? 'Payée' : 'En attente'}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Section Contenus
  const ContenusSection = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Video className="w-5 h-5 text-blue-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Contenus Audiovisuels</h2>
          <p className="text-sm text-gray-500">Accédez à tous vos contenus créatifs sur Google Drive</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientData.contenus.map((contenu) => (
          <div key={contenu.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200">
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">{contenu.nom}</h3>
                  <p className="text-xs text-gray-500">{formatDate(contenu.date)}</p>
                </div>
              </div>
              <a
                href={contenu.lien}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <span>Ouvrir Google Drive</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Section Identifiants
  const CredentialsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Key className="w-5 h-5 text-blue-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Mes Identifiants</h2>
          <p className="text-sm text-gray-500">Retrouvez tous vos accès et identifiants de connexion</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {clientData.credentials.map((cred) => (
          <div key={cred.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{cred.service}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                      {cred.username}
                    </code>
                    <button
                      onClick={() => copyToClipboard(cred.username)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors duration-200"
                      title="Copier"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                      {cred.password}
                    </code>
                    <button
                      onClick={() => copyToClipboard(cred.password)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors duration-200"
                      title="Copier"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accès
                  </label>
                  <a
                    href={cred.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <span>Se connecter</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Section Rapports
  const RapportsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="w-5 h-5 text-blue-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Rapports & Analyses</h2>
          <p className="text-sm text-gray-500">Consultez et téléchargez vos rapports de performance</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientData.rapports.map((rapport) => (
          <div key={rapport.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 transition-all duration-200">
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">{rapport.nom}</h3>
                  <p className="text-xs text-gray-500">{formatDate(rapport.date)}</p>
                </div>
              </div>
              <a
                href={rapport.lien}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <span>Télécharger PDF</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards />
        <Navigation />
        
        <div className="mb-8">
          {activeTab === 'factures' && <FacturesSection />}
          {activeTab === 'contenus' && <ContenusSection />}
          {activeTab === 'credentials' && <CredentialsSection />}
          {activeTab === 'rapports' && <RapportsSection />}
        </div>
      </main>
    </div>
  );
}

export default App;