import React from 'react';

const LoginPage = ({ onLogin }) => (
  <div className="flex items-center justify-center min-h-screen login-bg p-4">
    <div className="w-full max-w-md bg-slate-100 p-8 rounded-2xl shadow-2xl fade-in">
      <div className="flex justify-center mb-6">
        <img src="/assets/logo.png" alt="Logo Colégio Miguel de Cervantes" className="h-12" />
      </div>
      <h2 className="text-2xl font-bold text-center text-slate-500 mb-2">Sistema de Reservas</h2>
      <p className="text-center text-slate-600 mb-8">Acesso para colaboradores</p>
      <form onSubmit={onLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email Corporativo</label>
          <input type="email" id="email" className="w-full p-3 bg-slate-200 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="seu.nome@cmc.com.br" required />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
          <input type="password" id="password" className="w-full p-3 bg-slate-200 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="••••••••" required />
        </div>
        <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105">Acessar</button>
      </form>
    </div>
  </div>
);

export default LoginPage;