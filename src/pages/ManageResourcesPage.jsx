import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import icons from '../components/Icons';
import ResourceModal from '../components/ResourceModal';

const ManageResourcesPage = ({ onBack, onLogout, onLogoClick }) => {
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentItem, setCurrentItem] = useState(null);
    const [resourceType, setResourceType] = useState('main');

    const fetchResources = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:3001/api/gerir/recursos');
            if (!response.ok) throw new Error('Falha ao buscar recursos para gestão.');
            const data = await response.json();
            setResources(data);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const handleOpenAddModal = (type, parentResource = null) => {
        setModalMode('add');
        setResourceType(type);
        setCurrentItem(parentResource ? { RecursoPaiID: parentResource.RecursoID } : {});
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item, type) => {
        setModalMode('edit');
        setResourceType(type);
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (resource) => {
        if (window.confirm(`Tem a certeza que quer apagar o recurso "${resource.Nome}" e TODOS os seus sub-recursos? Esta ação não pode ser desfeita e pode afetar reservas existentes.`)) {
            try {
                const response = await fetch(`http://localhost:3001/api/gerir/recursos/${resource.RecursoID}`, {
                    method: 'DELETE',
                });
                const responseData = await response.json();
                if (!response.ok) {
                    throw new Error(responseData.message || 'Falha ao apagar o recurso.');
                }
                toast.success(responseData.message);
                fetchResources();
            } catch (err) {
                toast.error(err.message);
            }
        }
    };
    
    return (
        <div className="bg-slate-50 min-h-screen">
            <Header title="Gerir Recursos" onLogoClick={onLogoClick} onLogout={onLogout}>
                <button onClick={onBack} className="flex items-center text-gray-600 hover:text-blue-600 font-semibold p-2 rounded-md hover:bg-slate-100">
                    <icons.ArrowLeft className="h-6 w-6 mr-1" />
                    <span className="hidden sm:inline">Voltar</span>
                </button>
            </Header>
            <main className="w-full max-w-4xl mx-auto p-4 md:p-8">
                <div className="flex justify-end mb-6">
                    <button onClick={() => handleOpenAddModal('main')} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700">
                        Adicionar Novo Recurso Principal
                    </button>
                </div>
                
                {isLoading && <p className="text-center text-slate-500">A carregar recursos...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                <div className="space-y-6">
                    {resources.map(resource => (
                        <div key={resource.RecursoID} className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex justify-between items-center border-b pb-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{resource.Nome}</h2>
                                    <p className="text-sm text-slate-500">{resource.Descricao}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleOpenEditModal(resource, 'main')} className="p-2 text-slate-500 hover:text-blue-600" title="Editar Recurso Principal">
                                        <icons.Settings size={20} />
                                    </button>
                                    <button onClick={() => handleDelete(resource)} className="p-2 text-slate-500 hover:text-red-600" title="Apagar Recurso Principal">
                                        {/* Futuramente um ícone de lixo aqui */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex justify-end mb-4">
                                <button onClick={() => handleOpenAddModal('sub', resource)} className="text-sm bg-green-100 text-green-800 font-semibold py-1 px-3 rounded-full hover:bg-green-200">
                                    Adicionar Sub-recurso
                                </button>
                            </div>

                            <div className="space-y-2">
                                {resource.SubRecursos.map(sub => (
                                    <div key={sub.SubRecursoID} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                        <p className="font-semibold text-slate-700">{sub.Nome}</p>
                                        <button onClick={() => handleOpenEditModal(sub, 'sub')} className="p-2 text-slate-400 hover:text-blue-600" title="Editar Sub-recurso">
                                            <icons.Settings size={18} />
                                        </button>
                                    </div>
                                ))}
                                {resource.SubRecursos.length === 0 && <p className="text-sm text-center text-slate-400 italic py-2">Nenhum sub-recurso adicionado.</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {isModalOpen && (
    <ResourceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        item={currentItem}
        type={resourceType}
        onSave={fetchResources}
    />
)}
        </div>
    );
};

export default ManageResourcesPage;