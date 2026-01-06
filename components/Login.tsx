
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const users: User[] = [
    { id: '1', name: 'Administrador', role: 'MANAGER' },
    { id: '2', name: 'Vendedor João', role: 'SELLER' },
    { id: '3', name: 'Vendedora Maria', role: 'SELLER' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl mb-4">
            <i className="fas fa-store text-4xl"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestor Pro</h1>
          <p className="text-slate-500 mt-2">Selecione seu acesso para continuar</p>
        </div>

        <div className="space-y-4">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => onLogin(user)}
              className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                  user.role === 'MANAGER' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <i className={`fas ${user.role === 'MANAGER' ? 'fa-user-shield' : 'fa-user'}`}></i>
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 group-hover:text-blue-700">{user.name}</p>
                  <p className="text-xs text-slate-400 font-semibold uppercase">{user.role === 'MANAGER' ? 'Gestão' : 'Vendas'}</p>
                </div>
              </div>
              <i className="fas fa-chevron-right text-slate-300 group-hover:text-blue-500 transition-colors"></i>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">© 2024 Sistema de Gestão Empresarial</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
