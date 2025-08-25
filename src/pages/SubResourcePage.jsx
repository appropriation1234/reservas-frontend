import React from 'react';
import Header from '../components/Header';
import icons from '../components/Icons';

const SubResourcePage = ({ resource, onSelect, onBack, onLogout, onLogoClick }) => (
    <div className="bg-slate-50 min-h-screen">
      <Header title={`Escolha uma opção de ${resource.nome}`} onLogoClick={onLogoClick} onLogout={onLogout}>
          <button onClick={onBack} className="flex items-center text-gray-600 hover:text-blue-600 font-semibold p-2 rounded-md hover:bg-slate-100">
              <icons.ArrowLeft className="h-6 w-6 mr-1" />
              <span className="hidden sm:inline">Voltar</span>
          </button>
      </Header>
      <main className="flex justify-center p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            {resource.subRecursos.map(option => {
                const IconComponent = icons[resource.icone];
                return (
                  <div key={option.id} onClick={() => onSelect(option)} className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-t-4 border-purple-500 hover:border-blue-600 transform hover:-translate-y-1">
                    {IconComponent && <div className="text-5xl text-purple-600 mb-4"><IconComponent size={48} /></div>}
                    <h2 className="text-2xl font-bold text-slate-800 text-center">{option.nome}</h2>
                  </div>
                )
            })}
          </div>
      </main>
    </div>
  );

export default SubResourcePage;