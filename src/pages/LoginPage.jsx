import React from 'react';
import { useMsal } from "@azure/msal-react";

const LoginPage = ({ loginError }) => { // Recebe a prop 'loginError'
    const { instance } = useMsal();

    const handleLogin = () => {
        instance.loginRedirect().catch(e => {
            console.error(e);
        });
    }

    return (
        <div className="flex items-center justify-center min-h-screen login-bg p-4">
            <div className="w-full max-w-md bg-slate-100 p-8 rounded-2xl shadow-2xl fade-in text-center">
                <div className="flex justify-center mb-6">
                    <img src="/assets/logo.png" alt="Logo Colégio Miguel de Cervantes" className="h-12" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700 mb-2">Sistema de Reservas</h2>
                <p className="text-slate-600 mb-8">Acesso para colaboradores</p>
                
                {/* NOVO: Bloco para exibir a mensagem de erro, se existir */}
                {loginError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <strong className="font-bold">Acesso Negado: </strong>
                        <span className="block sm:inline">{loginError}</span>
                    </div>
                )}
                
                <button 
                    onClick={handleLogin}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
                >
                    Entrar com a Conta Microsoft
                </button>
            </div>
        </div>
    );
};

export default LoginPage;