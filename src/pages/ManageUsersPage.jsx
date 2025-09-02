import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import icons from '../components/Icons';
import UserModal from '../components/UserModal';

const ManageUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentUser, setCurrentUser] = useState(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:3001/api/gerir/usuarios');
            if (!response.ok) throw new Error('Falha ao buscar utilizadores.');
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenAddModal = () => {
        setModalMode('add');
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setModalMode('edit');
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (user) => {
        if (window.confirm(`Tem a certeza que quer apagar o utilizador "${user.NomeCompleto}"? Esta ação não pode ser desfeita.`)) {
            try {
                const response = await fetch(`http://localhost:3001/api/gerir/usuarios/${user.UsuarioID}`, {
                    method: 'DELETE',
                });
                const responseData = await response.json();
                if (!response.ok) throw new Error(responseData.message);
                toast.success(responseData.message);
                fetchUsers();
            } catch (err) {
                toast.error(err.message);
            }
        }
    };

    const ProfileBadge = ({ profile }) => {
        const style = profile === 'TI_Admin' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800';
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style}`}>{profile}</span>;
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-slate-800"></h1>
                <button onClick={handleOpenAddModal} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700">
                    Adicionar Novo Utilizador
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {isLoading && <p className="p-6 text-center">A carregar utilizadores...</p>}
                {error && <p className="p-6 text-center text-red-500">{error}</p>}
                {!isLoading && !error && (
                    <table className="w-full text-left">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-4 font-bold text-slate-600">Nome Completo</th>
                                <th className="p-4 font-bold text-slate-600">Email</th>
                                <th className="p-4 font-bold text-slate-600">Perfil</th>
                                <th className="p-4 font-bold text-slate-600 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.UsuarioID} className="border-t border-slate-200">
                                    <td className="p-4 font-semibold text-slate-800">{user.NomeCompleto}</td>
                                    <td className="p-4 text-slate-600">{user.Email}</td>
                                    <td className="p-4"><ProfileBadge profile={user.Perfil} /></td>
                                    <td className="p-4 flex justify-end space-x-2">
                                        <button onClick={() => handleOpenEditModal(user)} className="p-2 text-slate-500 hover:text-blue-600" title="Editar Utilizador">
                                            <icons.Settings size={20} />
                                        </button>
                                        <button onClick={() => handleDelete(user)} className="p-2 text-slate-500 hover:text-red-600" title="Apagar Utilizador">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            {isModalOpen && (
                <UserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    mode={modalMode}
                    user={currentUser}
                    onSave={fetchUsers}
                />
            )}
        </>
    );
};

export default ManageUsersPage;