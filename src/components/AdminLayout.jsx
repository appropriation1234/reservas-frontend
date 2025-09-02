import React from 'react';
import Header from './Header';
import icons from './Icons';

const AdminLayout = ({ user, onLogout, onLogoClick, activePage, setActivePage, children }) => {
    
    // Mapeia o nome da página para o título a ser exibido
    const pageTitles = {
        reservations: 'Gestão de Reservas',
        resources: 'Gestão de Recursos',
        users: 'Gestão de Utilizadores',
    };

    const NavLink = ({ pageName, icon, label }) => {
        const isActive = activePage === pageName;
        const baseClasses = "flex items-center w-full p-3 my-1 rounded-lg transition-colors";
        const activeClasses = "bg-blue-100 text-blue-700 font-bold";
        const inactiveClasses = "hover:bg-slate-100";
        
        return (
            <button 
                onClick={() => setActivePage(pageName)}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
                {icon}
                <span className="ml-3">{label}</span>
            </button>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header title={pageTitles[activePage] || 'Painel de Administração'} onLogoClick={onLogoClick} onLogout={onLogout}>
                <button onClick={onLogoClick} className="flex items-center text-gray-600 hover:text-blue-600 font-semibold p-2 rounded-md hover:bg-slate-100">
                    <icons.ArrowLeft className="h-6 w-6 mr-1" />
                    <span className="hidden sm:inline">Página Inicial</span>
                </button>
            </Header>
            <div className="flex">
                <aside className="w-64 bg-white p-4 border-r border-slate-200 h-[calc(100vh-73px)] sticky top-[73px]">
                    <nav>
                        <NavLink 
                            pageName="reservations" 
                            icon={<icons.Calendar size={20} />} 
                            label="Gestão de Reservas"
                        />
                        <NavLink 
                            pageName="resources" 
                            icon={<icons.Settings size={20} />} 
                            label="Gestão de Recursos"
                        />
                        <NavLink 
                            pageName="users" 
                            icon={<icons.Users size={20} />} 
                            label="Gestão de Utilizadores"
                        />
                    </nav>
                </aside>
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;