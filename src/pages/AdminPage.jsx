import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import icons from '../components/Icons';

const AdminPage = ({ onBack, onLogout, onLogoClick, resources }) => {
    const [activeTab, setActiveTab] = useState('lista');
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [reservasLista, setReservasLista] = useState([]);
    const [isLoadingLista, setIsLoadingLista] = useState(true);
    const [errorLista, setErrorLista] = useState('');
    const [filters, setFilters] = useState({ status: 'pendente', solicitante: '', recurso: '', data: '' });
    const getToday = () => new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(getToday());
    const [dailyReservations, setDailyReservations] = useState([]);
    const [isLoadingGrade, setIsLoadingGrade] = useState(true);
    const [errorGrade, setErrorGrade] = useState('');

    const finalBookableResources = useMemo(() => {
        const allResources = [];
        resources.forEach(res => {
            if (res.subRecursos && res.subRecursos.length > 0) { allResources.push(...res.subRecursos); } 
            else { allResources.push({ id: res.id, nome: res.nome }); }
        });
        return allResources;
    }, [resources]);

    const fetchAdminReservas = useCallback(async () => {
        try {
            setIsLoadingLista(true);
            const params = new URLSearchParams();
            if (filters.status && filters.status !== 'todas') params.append('status', filters.status);
            if (filters.solicitante) params.append('solicitante', filters.solicitante);
            if (filters.recurso) params.append('recurso', filters.recurso);
            if (filters.data) params.append('data', filters.data);
            const response = await fetch(`http://localhost:3001/api/admin/reservas?${params.toString()}`);
            if (!response.ok) throw new Error('Falha ao buscar dados de administração.');
            const data = await response.json();
            setReservasLista(data);
        } catch (err) { setErrorLista(err.message); } finally { setIsLoadingLista(false); }
    }, [filters]);

    const fetchReservationsForDate = useCallback(async (date) => {
        if (!date) return;
        try {
            setIsLoadingGrade(true);
            setErrorGrade('');
            const response = await fetch(`http://localhost:3001/api/admin/reservas?data=${date}&status=todas`);
            if (!response.ok) throw new Error('Falha ao carregar as reservas do dia.');
            const data = await response.json();
            setDailyReservations(data.filter(r => r.Status === 'aprovada' || r.Status === 'pendente').sort((a, b) => new Date(a.DataInicio) - new Date(b.DataInicio)));
        } catch (err) { setErrorGrade(err.message); } finally { setIsLoadingGrade(false); }
    }, []);

    useEffect(() => {
        if (activeTab === 'lista') fetchAdminReservas();
        if (activeTab === 'grade') fetchReservationsForDate(selectedDate);
    }, [activeTab, filters, selectedDate, fetchAdminReservas, fetchReservationsForDate]);

    const handleUpdateStatus = async (reservaId, newStatus) => {
        let motivo = null;
        if (newStatus === 'recusada') {
            motivo = prompt("Por favor, insira o motivo da recusa:");
            if (motivo === null) return;
            if (!motivo.trim()) {
                alert("O motivo da recusa não pode estar em branco.");
                return;
            }
        }
        try {
            const response = await fetch(`http://localhost:3001/api/admin/reservas/${reservaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus, motivo: motivo }) });
            if (!response.ok) throw new Error('Falha ao atualizar o status.');
            fetchAdminReservas();
            fetchReservationsForDate(selectedDate);
            setSelectedReservation(null);
        } catch (err) { alert(err.message); }
    };
    const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const clearFilters = () => setFilters({ status: 'todas', solicitante: '', recurso: '', data: '' });
    
    const StatusBadgeLista = ({ status }) => {
        const colors = { pendente: 'bg-yellow-100 text-yellow-800', aprovada: 'bg-green-100 text-green-800', recusada: 'bg-red-100 text-red-800', cancelada: 'bg-gray-200 text-gray-600' };
        return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
    };
    const ReservationModal = ({ reservation, onClose, onUpdateStatus }) => {
        if (!reservation) return null;
        const startTime = new Date(reservation.DataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(reservation.DataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={onClose}>
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg fade-in" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Detalhes do Pedido</h3>
                    <div className="space-y-3 text-lg">
                        <p><strong>Recurso:</strong> {reservation.NomeSubRecurso || reservation.NomeRecursoPai}</p>
                        <p><strong>Solicitante:</strong> {reservation.NomeUsuario}</p>
                        <p><strong>Horário:</strong> {startTime} - {endTime}</p>
                        <p><strong>Local:</strong> {reservation.ObservacoesLocal || 'Não informado'}</p>
                        <p><strong>Atividade:</strong> {reservation.ObservacoesAtividade || 'Não informado'}</p>
                        <p><strong>Status:</strong> <StatusBadgeLista status={reservation.Status} /></p>
                    </div>
                    {reservation.Status === 'pendente' && (
                        <div className="mt-6 pt-4 border-t flex space-x-4">
                            <button onClick={() => onUpdateStatus(reservation.ReservaID, 'aprovada')} className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 transition-all">Aprovar</button>
                            <button onClick={() => onUpdateStatus(reservation.ReservaID, 'recusada')} className="w-full py-3 px-4 bg-red-600 text-white font-bold rounded-xl shadow-md hover:bg-red-700 transition-all">Recusar</button>
                        </div>
                    )}
                    <button onClick={onClose} className="w-full mt-4 py-3 px-4 bg-gray-500 text-white font-bold rounded-xl shadow-md hover:bg-gray-600">Fechar</button>
                </div>
            </div>
        );
    };
    const ReservationCard = ({ reserva, onClick }) => {
        const startTime = new Date(reserva.DataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(reserva.DataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const isPendente = reserva.Status === 'pendente';
        return (
            <div className={`p-3 rounded-lg border-l-4 mb-2 cursor-pointer transition-transform transform hover:scale-105 ${isPendente ? 'bg-yellow-50 border-yellow-400 hover:bg-yellow-100' : 'bg-green-50 border-green-500 hover:bg-green-100'}`} onClick={() => onClick(reserva)}>
                <p className="font-bold text-gray-800">{startTime} - {endTime}</p>
                <p className="text-sm text-gray-600">{reserva.NomeUsuario}</p>
                {isPendente && <span className="text-xs font-semibold text-yellow-800">(Pendente)</span>}
            </div>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header title="Painel de Administração" onLogoClick={onLogoClick} onLogout={onLogout}>
                <button onClick={onBack} className="flex items-center text-gray-600 hover:text-blue-600 font-semibold p-2 rounded-md hover:bg-slate-100">
                    <icons.ArrowLeft className="h-6 w-6 mr-1" />
                    <span className="hidden sm:inline">Voltar</span>
                </button>
            </Header>
            <main className="w-full max-w-screen-xl mx-auto p-4 md:p-8">
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('grade')} className={`${activeTab === 'grade' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-lg`}>Grade Diária</button>
                            <button onClick={() => setActiveTab('lista')} className={`${activeTab === 'lista' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-lg`}>Lista de Pedidos</button>
                        </nav>
                    </div>
                    {activeTab === 'grade' && (
                        <div className="fade-in">
                            <div className="mb-6"><label htmlFor="date-picker" className="font-semibold text-gray-700">Selecione o Dia:</label><input type="date" id="date-picker" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1 ml-2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/></div>
                            {isLoadingGrade && <p>A carregar grade...</p>}
                            {errorGrade && <p className="text-red-500">{errorGrade}</p>}
                            {!isLoadingGrade && !errorGrade && (<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">{finalBookableResources.map(resource => { const reservationsForResource = dailyReservations.filter(res => (res.NomeSubRecurso || res.NomeRecursoPai) === resource.nome); return (<div key={resource.id} className="bg-slate-50 p-4 rounded-xl"><h3 className="font-bold text-lg text-slate-700 border-b pb-2 mb-4">{resource.nome}</h3><div>{reservationsForResource.length > 0 ? (reservationsForResource.map(reserva => <ReservationCard key={reserva.ReservaID} reserva={reserva} onClick={setSelectedReservation} />)) : (<p className="text-sm text-gray-500 italic">Nenhuma reserva para este dia.</p>)}</div></div>); })}</div>)}
                        </div>
                    )}
                    {activeTab === 'lista' && (
                        <div className="fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                                <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"><option value="todas">Todos os Status</option><option value="pendente">Pendentes</option><option value="aprovada">Aprovadas</option><option value="recusada">Recusadas</option><option value="cancelada">Canceladas</option></select>
                                <select name="recurso" value={filters.recurso} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"><option value="">Todos os Recursos</option>{resources.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}</select>
                                <input type="date" name="data" value={filters.data} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                                <input type="text" name="solicitante" placeholder="Pesquisar por solicitante..." value={filters.solicitante} onChange={handleFilterChange} className="w-full lg:col-span-2 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline mb-4">Limpar Filtros</button>
                            {isLoadingLista && <p>A carregar pedidos...</p>}
                            {errorLista && <p className="text-red-500">{errorLista}</p>}
                            {!isLoadingLista && !errorLista && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-slate-100"><tr><th scope="col" className="px-6 py-3">Solicitante</th><th scope="col" className="px-6 py-3">Recurso</th><th scope="col" className="px-6 py-3">Data & Hora</th><th scope="col" className="px-6 py-3">Status</th><th scope="col" className="px-6 py-3">Observações</th><th scope="col" className="px-6 py-3">Ações</th></tr></thead>
                                        <tbody>
                                            {reservasLista.map(reserva => (<tr key={reserva.ReservaID} className="bg-white border-b hover:bg-slate-50">
                                                <td className="px-6 py-4 font-semibold text-slate-900">{reserva.NomeUsuario}</td>
                                                <td className="px-6 py-4">{reserva.NomeSubRecurso || reserva.NomeRecursoPai}</td>
                                                <td className="px-6 py-4">{new Date(reserva.DataInicio).toLocaleDateString('pt-BR')} <br/>{new Date(reserva.DataInicio).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} - {new Date(reserva.DataFim).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</td>
                                                <td className="px-6 py-4"><StatusBadgeLista status={reserva.Status} /></td>
                                                <td className="px-6 py-4 text-xs">
                                                    <strong>Local:</strong> {reserva.ObservacoesLocal || 'N/A'}<br/>
                                                    <strong>Atividade:</strong> {reserva.ObservacoesAtividade || 'N/A'}<br/>
                                                    {(reserva.Status === 'recusada' || reserva.Status === 'cancelada') && (
                                                        <strong className="text-red-600 mt-1 block">
                                                            Motivo: {reserva.ObservacoesRecusa || reserva.ObservacoesCancelamento}
                                                        </strong>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">{reserva.Status === 'pendente' && (<div className="flex space-x-2"><button onClick={() => handleUpdateStatus(reserva.ReservaID, 'aprovada')} className="font-medium text-green-600 hover:underline">Aprovar</button><button onClick={() => handleUpdateStatus(reserva.ReservaID, 'recusada')} className="font-medium text-red-600 hover:underline">Recusar</button></div>)}</td>
                                            </tr>))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            {selectedReservation && (<ReservationModal reservation={selectedReservation} onClose={() => setSelectedReservation(null)} onUpdateStatus={handleUpdateStatus}/>)}
        </div>
    );
};


export default AdminPage;