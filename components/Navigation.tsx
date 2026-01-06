
import React from 'react';
import { User } from '../types';

interface NavigationProps {
  activeTab: 'dashboard' | 'inventory' | 'customers';
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'customers') => void;
  currentUser: User;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'inventory', label: 'Estoque', icon: 'fa-boxes-stacked' },
    { id: 'customers', label: 'Clientes', icon: 'fa-users' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <i className="fas fa-store text-blue-400"></i>
            Gestor Pro
          </h1>
        </div>
        
        <div className="p-6 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-lg font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold truncate text-sm">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">{currentUser.role === 'MANAGER' ? 'Gestor' : 'Vendedor'}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 py-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                activeTab === tab.id ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              <i className={`fas ${tab.icon} w-5`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-sm font-bold"
          >
            <i className="fas fa-right-from-bracket"></i>
            Sair do Sistema
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 shadow-lg px-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <i className={`fas ${tab.icon} text-lg mb-1`}></i>
            <span className="text-[10px] uppercase font-bold tracking-tighter">{tab.label}</span>
          </button>
        ))}
        <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center w-full h-full text-red-500 opacity-60"
          >
            <i className="fas fa-power-off text-lg mb-1"></i>
            <span className="text-[10px] uppercase font-bold tracking-tighter">Sair</span>
          </button>
      </nav>
    </>
  );
};

export default Navigation;
