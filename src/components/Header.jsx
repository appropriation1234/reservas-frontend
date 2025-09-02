import React from 'react';
import icons from './Icons';

const Header = ({ title, onLogoClick, onLogout, children }) => {
    return (
        <header className="flex justify-between items-center w-full px-4 sm:px-8 py-4 border-b bg-white shadow-sm sticky top-0 z-20">
            <div className="flex-1 flex justify-start">
                <img 
                    src="/assets/logo.png"
                    alt="Logo Colégio Miguel de Cervantes" 
                    className="h-8 sm:h-10 cursor-pointer"
                    onClick={onLogoClick}
                />
            </div>
            <div className="flex-1 text-center">
                <h1 className="text-lg sm:text-2xl font-extrabold text-slate-800 whitespace-nowrap">{title}</h1>
            </div>
            <div className="flex-1 flex justify-end items-center space-x-2 sm:space-x-4">
                {children}
                <button onClick={onLogout} className="flex items-center text-red-500 hover:text-red-600 font-semibold p-2 rounded-md hover:bg-red-50 transition-colors">
                    <span className="hidden sm:inline">Sair</span>
                    <icons.LogOut className="h-5 w-5 sm:ml-2" />
                </button>
            </div>
        </header>
    );
};

export default Header;