import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import icons from './Icons';

const ResourceModal = ({ isOpen, onClose, mode, type, item, onSave }) => {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData(item);
        } else {
            setFormData({});
        }
    }, [item]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const isMainResource = type === 'main';
        let url = '';
        let method = '';
        const id = isMainResource ? item?.RecursoID : item?.SubRecursoID;

        if (mode === 'add') {
            url = isMainResource ? '/api/gerir/recursos' : '/api/gerir/subrecursos';
            method = 'POST';
        } else {
            url = isMainResource ? `/api/gerir/recursos/${id}` : `/api/gerir/subrecursos/${id}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(`http://localhost:3001${url}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || `Falha ao ${mode === 'add' ? 'criar' : 'atualizar'}.`);
            }

            toast.success(responseData.message);
            onSave();
            onClose();

        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = `${mode === 'add' ? 'Adicionar' : 'Editar'} ${type === 'main' ? 'Recurso Principal' : 'Sub-recurso'}`;
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg fade-in" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">{title}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'add' && (
                        <div>
                            <label htmlFor={type === 'main' ? 'RecursoID' : 'SubRecursoID'} className="block text-sm font-medium text-slate-700">ID do Recurso (ex: rec005, sub007)</label>
                            <input
                                type="text"
                                id={type === 'main' ? 'RecursoID' : 'SubRecursoID'}
                                name={type === 'main' ? 'RecursoID' : 'SubRecursoID'}
                                value={formData[type === 'main' ? 'RecursoID' : 'SubRecursoID'] || ''}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm"
                            />
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="Nome" className="block text-sm font-medium text-slate-700">Nome do Recurso</label>
                        <input
                            type="text"
                            id="Nome"
                            name="Nome"
                            value={formData.Nome || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm"
                        />
                    </div>

                    {type === 'main' && (
                        <>
                            <div>
                                <label htmlFor="Descricao" className="block text-sm font-medium text-slate-700">Descrição</label>
                                <textarea
                                    id="Descricao"
                                    name="Descricao"
                                    value={formData.Descricao || ''}
                                    onChange={handleChange}
                                    rows="3"
                                    className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="Icone" className="block text-sm font-medium text-slate-700">Nome do Ícone</label>
                                <select 
                                    id="Icone" 
                                    name="Icone" 
                                    value={formData.Icone || ''} 
                                    onChange={handleChange}
                                    className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm"
                                >
                                    <option value="">Selecione um ícone</option>
                                    {Object.keys(icons).map(iconName => (
                                        <option key={iconName} value={iconName}>{iconName}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="pt-4 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 disabled:opacity-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50">
                            {isSubmitting ? 'A guardar...' : 'Guardar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResourceModal;