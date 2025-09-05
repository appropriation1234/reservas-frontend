import React from 'react';
import Header from '../components/Header';
import icons from '../components/Icons';

const HomePage = ({ resources, onResourceClick, onLogout, onAdminClick, onMyReservationsClick, userProfile, onLogoClick, onReportClick, onShowHelp }) => {
    
    // Separa os recursos: o de Streaming e os outros (principais).
    const streamingResource = resources.find(r => r.nome === 'Contas de Streaming');
    const mainResources = resources.filter(r => r.nome !== 'Contas de Streaming');

    // Componente para o cartão de um recurso real
    const ResourceCard = ({ resource }) => {
        const IconComponent = icons[resource.icone];
        return (
            <div 
                key={resource.id} 
                onClick={() => onResourceClick(resource)} 
                className="flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl shadow-md border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
                {IconComponent && <div className="text-4xl text-blue-600 mb-3"><IconComponent size={40} /></div>}
                <h2 className="text-xl font-bold text-slate-800">{resource.nome}</h2>
            </div>
        );
    };

    // Componente para o placeholder
    const PlaceholderCard = ({ key }) => {
        const IconComponent = icons['Lock'];
        return (
            <div 
                key={key}
                className="hidden lg:flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 cursor-not-allowed"
            >
                {IconComponent && <div className="text-4xl text-slate-400"><IconComponent size={40} /></div>}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center bg-slate-50 min-h-screen">
            <Header title="Reservar um Recurso" onLogoClick={onLogoClick} onLogout={onLogout}>
                <button onClick={onMyReservationsClick} className="flex items-center bg-white text-blue-600 border border-blue-600 font-semibold py-2 px-2 sm:px-3 rounded-lg hover:bg-blue-50 transition-colors text-sm whitespace-nowrap">
                    <icons.Calendar className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Minhas Reservas</span>
                </button>
                
                {/* ===== A CORREÇÃO ESTÁ AQUI ===== */}
                {['TI_Admin', 'Secretaria', 'ProdutorEventos'].includes(userProfile) && (
                    <>
                        <button onClick={onReportClick} className="flex items-center bg-white text-purple-600 border border-purple-600 font-semibold py-2 px-2 sm:px-3 rounded-lg hover:bg-purple-50 transition-colors text-sm whitespace-nowrap">
                            <icons.Shield className="h-5 w-5 sm:mr-2" />
                            <span className="hidden sm:inline">Relatório</span>
                        </button>
                        <button onClick={onAdminClick} className="flex items-center bg-slate-800 text-white font-semibold py-2 px-2 sm:px-3 rounded-lg shadow-md hover:bg-slate-900 transition-colors text-sm whitespace-nowrap">
                            <icons.Shield className="h-5 w-5 sm:mr-2" />
                            <span className="hidden sm:inline">Admin</span>
                        </button>
                    </>
                )}
            </Header>
            
            <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mainResources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                    ))}
                    <PlaceholderCard key="placeholder-1" />
                    {streamingResource && <ResourceCard key={streamingResource.id} resource={streamingResource} />}
                    <PlaceholderCard key="placeholder-2" />
                </div>
            </main>
            
            <button
              onClick={onShowHelp}
              className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 z-30"
              aria-label="Ajuda"
            >
              <icons.HelpCircle className="h-6 w-6" />
            </button>
        </div>
    );
};

export default HomePage; 