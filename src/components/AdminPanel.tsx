import React, { useState } from 'react';
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

interface ClientData {
  id: string;
  name: string;
  company: string;
  email: string;
  factures: any[];
  contenus: any[];
  credentials: any[];
  rapports: any[];
}

interface AdminPanelProps {
  onBackToClient: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToClient }) => {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [activeTab, setActiveTab] = useState('clients');
  
  // Données clients (vous pouvez les modifier)
  const [clientsData, setClientsData] = useState<Record<string, ClientData>>({
    'client1': {
      id: 'client1',
      name: 'Martin Dubois',
      company: 'TechStart Innovation',
      email: 'martin@techstart.com',
      factures: [],
      contenus: [],
      credentials: [],
      rapports: []
    },
    'client2': {
      id: 'client2',
      name: 'Sophie Laurent',
      company: 'Creative Agency',
      email: 'sophie@creative.com',
      factures: [],
      contenus: [],
      credentials: [],
      rapports: []
    }
  });

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
                <p className="text-purple-200 text-sm">Gestion des clients</p>
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
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar - Liste des clients */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Clients</h2>
                <button className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {Object.entries(clientsData).map(([clientId, client]) => (
                  <div
                    key={clientId}
                    onClick={() => setSelectedClient(clientId)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedClient === clientId
                        ? 'bg-purple-50 border border-purple-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium text-sm">{client.name}</p>
                    <p className="text-xs text-gray-500">{client.company}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="col-span-12 lg:col-span-9">
            {selectedClient ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {clientsData[selectedClient].name} - {clientsData[selectedClient].company}
                </h2>
                
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
                        onClick={() => setActiveTab(tab.id)}
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

                {/* Contenu des tabs */}
                <div>
                  {activeTab === 'factures' && (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                        <h3 className="text-lg font-semibold">Factures</h3>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucune facture pour le moment</p>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'contenus' && (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                        <h3 className="text-lg font-semibold">Contenus</h3>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucun contenu pour le moment</p>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'credentials' && (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                        <h3 className="text-lg font-semibold">Identifiants</h3>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <Key className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucun identifiant pour le moment</p>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'rapports' && (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                        <h3 className="text-lg font-semibold">Rapports</h3>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucun rapport pour le moment</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sélectionnez un client
                </h3>
                <p className="text-gray-500">
                  Choisissez un client dans la liste pour gérer ses données
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;