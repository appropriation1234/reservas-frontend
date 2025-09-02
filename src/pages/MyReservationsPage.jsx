// src/pages/MyReservationsPage.jsx - VERSÃO CORRIGIDA

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import icons from '../components/Icons';

const MyReservationsPage = ({ onBack, onLogout, userId, onLogoClick }) => {
    const [myReservations, setMyReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMyReservations = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/usuarios/${userId}/reservas`);
            if (!response.ok) throw new Error('Falha ao buscar suas reservas.');
            const data = await response.json();
            setMyReservations(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchMyReservations();
    }, [fetchMyReservations]);

    const handleCancel = async (reservaId) => {
        const motivo = prompt("Por favor, insira o motivo do cancelamento:");
        if (motivo && motivo.trim()) {
            try {
                const response = await fetch(`http://localhost:3001/api/reservas/${reservaId}/cancelar`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ motivo })
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Falha ao cancelar o pedido.');
                }
                toast.success("Reserva cancelada com sucesso!");
                fetchMyReservations();
            } catch (err) {
                toast.error(err.message);
            }
        } else if (motivo !== null) {
            toast.warn("O motivo do cancelamento é obrigatório.");
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            pendente: 'bg-yellow-100 text-yellow-800',
            aprovada: 'bg-green-100 text-green-800',
            recusada: 'bg-red-100 text-red-800',
            cancelada: 'bg-gray-200 text-gray-600'
        };
        return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
    };

    const canCancel = (reserva) => {
        const now = new Date();
        const dataInicio = new Date(reserva.DataInicio);
        const diffHoras = (dataInicio.getTime() - now.getTime()) / (1000 * 60 * 60);
        return ['pendente', 'aprovada'].includes(reserva.Status) && diffHoras > 24;
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header title="Minhas Reservas" onLogoClick={onLogoClick} onLogout={onLogout}>
                <button onClick={onBack} className="flex items-center text-gray-600 hover:text-blue-600 font-semibold p-2 rounded-md hover:bg-slate-100">
                    <icons.ArrowLeft className="h-6 w-6 mr-1" />
                    <span className="hidden sm:inline">Voltar</span>
                </button>
            </Header>
            <main className="w-full max-w-7xl mx-auto p-4 sm:p-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    {isLoading && <p className="text-center text-slate-500">A carregar as suas reservas...</p>}
                    {!isLoading && myReservations.length === 0 && <p className="text-center text-slate-500">Você ainda não fez nenhum pedido de reserva.</p>}
                    {!isLoading && myReservations.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Recurso</th>
                                        <th scope="col" className="px-6 py-3">Data & Hora</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myReservations.map(reserva => (
                                        <tr key={reserva.ReservaID} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-semibold text-slate-900">{reserva.NomeRecursoFinal}</td>
                                            <td className="px-6 py-4">{new Date(reserva.DataInicio).toLocaleDateString('pt-BR')} <br/>{new Date(reserva.DataInicio).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} - {new Date(reserva.DataFim).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={reserva.Status} />
                                                {reserva.Status === 'recusada' && reserva.ObservacoesRecusa && (
                                                    <p className="text-xs text-red-600 mt-1"><strong>Motivo:</strong> {reserva.ObservacoesRecusa}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {canCancel(reserva) && (
                                                    <button onClick={() => handleCancel(reserva.ReservaID)} className="font-medium text-red-600 hover:underline">
                                                        Cancelar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyReservationsPage;