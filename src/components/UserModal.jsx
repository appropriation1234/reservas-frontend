import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const UserModal = ({ isOpen, onClose, mode, user, onSave }) => {
    const [formData, setFormData] = useState({ NomeCompleto: '', Email: '', Perfil: 'Professor' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && user) {
            setFormData(user);
        } else {
            setFormData({ NomeCompleto: '', Email: '', Perfil: 'Professor' });
        }
    }, [user, mode]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = mode === 'add' ? '/api/gerir/usuarios' : `/api/gerir/usuarios/${user.UsuarioID}`;
        const method = mode === 'add' ? 'POST' : 'PUT';

        try {
            const response = await fetch(`http://localhost:3001${url}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || `Falha ao ${mode === 'add' ? 'criar' : 'atualizar'} utilizador.`);
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

    const title = mode === 'add' ? 'Adicionar Novo Utilizador' : 'Editar Utilizador';

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg fade-in" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">{title}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="NomeCompleto" className="block text-sm font-medium text-slate-700">Nome Completo</label>
                        <input
                            type="text"
                            id="NomeCompleto"
                            name="NomeCompleto"
                            value={formData.NomeCompleto || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="Email" className="block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            id="Email"
                            name="Email"
                            value={formData.Email || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="Perfil" className="block text-sm font-medium text-slate-700">Perfil</label>
                        <select
                            id="Perfil"
                            name="Perfil"
                            value={formData.Perfil || 'Professor'}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm"
                        >
                            <option value="Professor">Professor</option>
                            <option value="TI_Admin">TI_Admin</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 disabled:opacity-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50">
                            {isSubmitting ? 'A guardar...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;