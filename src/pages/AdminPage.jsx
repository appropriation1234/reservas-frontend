import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import icons from '../components/Icons';

const AdminPage = ({ onBack, onLogout, onLogoClick, resources }) => {
    const [activeTab, setActiveTab] = useState('dia');
    const [selectedReservation, setSelectedReservation] = useState(null);
    const getToday = () => new Date().toISOString().split('T')[0];
    const [currentDate, setCurrentDate] = useState(getToday());

    const [reservasLista, setReservasLista] = useState([]);
    const [isLoadingLista, setIsLoadingLista] = useState(false);
    const [errorLista, setErrorLista] = useState('');
    const [filters, setFilters] = useState({ status: 'pendente', solicitante: '', recurso: '', data: '' });
    
    const [dailyReservations, setDailyReservations] = useState([]);
    const [isLoadingDay, setIsLoadingDay] = useState(true);
    const [errorDay, setErrorDay] = useState('');

    const [weeklyReservations, setWeeklyReservations] = useState([]);
    const [isLoadingWeek, setIsLoadingWeek] = useState(true);
    const [errorWeek, setErrorWeek] = useState('');
    const [weekDays, setWeekDays] = useState([]);

    const formatDateToISO = (date) => date.toISOString().split('T')[0];
    const parseISOString = (s) => new Date(s.replace(/-/g, '/'));

    const getWeekDays = useCallback((date) => {
        const current = parseISOString(date);
        const dayOfWeek = current.getDay();
        const firstDayOfWeek = new Date(current);
        firstDayOfWeek.setDate(current.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        
        const week = Array.from({ length: 6 }, (_, i) => {
            const day = new Date(firstDayOfWeek);
            day.setDate(firstDayOfWeek.getDate() + i);
            return day;
        });
        setWeekDays(week);
        return { start: formatDateToISO(week[0]), end: formatDateToISO(week[5]) };
    }, []);

    const finalBookableResources = useMemo(() => {
        const allResources = [];
        resources.forEach(res => {
            if (res.subRecursos && res.subRecursos.length > 0) {
                allResources.push(...res.subRecursos);
            } else {
                allResources.push({ id: res.id, nome: res.nome });
            }
        });
        return allResources;
    }, [resources]);

    const groupedDisplayResources = useMemo(() => {
        const streamingResourceNames = new Set(['Disney+', 'Netflix']);
        const otherResources = [];
        let hasStreaming = false;

        finalBookableResources.forEach(resource => {
            if (streamingResourceNames.has(resource.nome)) {
                hasStreaming = true;
            } else {
                otherResources.push(resource);
            }
        });
        
        const sortedOthers = otherResources.sort((a,b) => a.nome.localeCompare(b.nome));

        if (hasStreaming) {
            return [...sortedOthers, { id: 'streaming-group', nome: 'Streaming' }];
        }
        return sortedOthers;
    }, [finalBookableResources]);

    const fetchAdminReservas = useCallback(async () => {
        setIsLoadingLista(true);
        setErrorLista('');
        try {
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

    const fetchReservationsForDay = useCallback(async (date) => {
        if (!date) return;
        setIsLoadingDay(true);
        setErrorDay('');
        try {
            const response = await fetch(`http://localhost:3001/api/admin/reservas?data=${date}&status=todas`);
            if (!response.ok) throw new Error('Falha ao carregar as reservas do dia.');
            const data = await response.json();
            setDailyReservations(data.filter(r => ['aprovada', 'pendente'].includes(r.Status)).sort((a, b) => new Date(a.DataInicio) - new Date(b.DataInicio)));
        } catch (err) {
            setErrorDay(err.message);
        } finally {
            setIsLoadingDay(false);
        }
    }, []);

    const fetchReservationsForWeek = useCallback(async (date) => {
        if (!date) return;
        setIsLoadingWeek(true);
        setErrorWeek('');
        try {
            const { start, end } = getWeekDays(date);
            const params = new URLSearchParams({ dataInicio: start, dataFim: end, status: 'todas' });
            const response = await fetch(`http://localhost:3001/api/admin/reservas?${params.toString()}`);
            if (!response.ok) throw new Error('Falha ao carregar as reservas da semana.');
            const data = await response.json();
            setWeeklyReservations(data.filter(r => ['aprovada', 'pendente'].includes(r.Status)));
        } catch (err) {
            setErrorWeek(err.message);
        } finally {
            setIsLoadingWeek(false);
        }
    }, [getWeekDays]);
    
    useEffect(() => {
        if (activeTab === 'lista') fetchAdminReservas();
        if (activeTab === 'dia') fetchReservationsForDay(currentDate);
        if (activeTab === 'semana') fetchReservationsForWeek(currentDate);
    }, [activeTab, currentDate, filters, fetchAdminReservas, fetchReservationsForDay, fetchReservationsForWeek]);

    const handleUpdateStatus = async (reservaId, newStatus) => {
        let motivo = null;
        if (newStatus === 'recusada') {
            motivo = prompt("Por favor, insira o motivo da recusa:");
            if (motivo === null) return;
            if (!motivo.trim()) { alert("O motivo da recusa não pode estar em branco."); return; }
        }
        try {
            const response = await fetch(`http://localhost:3001/api/admin/reservas/${reservaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus, motivo: motivo }) });
            if (!response.ok) throw new Error('Falha ao atualizar o status.');
            
            if (activeTab === 'lista') fetchAdminReservas();
            if (activeTab === 'dia') fetchReservationsForDay(currentDate);
            if (activeTab === 'semana') fetchReservationsForWeek(currentDate);

            setSelectedReservation(null);
        } catch (err) { alert(err.message); }
    };
    
    const handleDateChange = (daysToAdd) => {
        const date = parseISOString(currentDate);
        date.setDate(date.getDate() + daysToAdd);
        setCurrentDate(formatDateToISO(date));
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
                <p className="text-sm text-gray-600">{reserva.NomeSubRecurso || reserva.NomeRecursoPai}</p>
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
            <main className="w-full max-w-screen-2xl mx-auto p-4 md:p-8">
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('dia')} className={`${activeTab === 'dia' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-lg`}>Grade Diária</button>
                            <button onClick={() => setActiveTab('semana')} className={`${activeTab === 'semana' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-lg`}>Programação da Semana</button>
                            <button onClick={() => setActiveTab('lista')} className={`${activeTab === 'lista' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-lg`}>Lista de Pedidos</button>
                        </nav>
                    </div>

                    {activeTab === 'dia' && (
                        <div className="fade-in">
                            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                                <label className="font-semibold text-gray-700 mb-2 sm:mb-0 whitespace-nowrap">Selecione o Dia:</label>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => setCurrentDate(getToday())} className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-200 transition-colors">Hoje</button>
                                    <button onClick={() => handleDateChange(-1)} className="p-2 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 transition-colors" aria-label="Dia anterior">&lt;</button>
                                    <button onClick={() => handleDateChange(1)} className="p-2 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 transition-colors" aria-label="Próximo dia">&gt;</button>
                                    <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                                </div>
                            </div>
                            {isLoadingDay && <p>A carregar grade do dia...</p>}
                            {errorDay && <p className="text-red-500">{errorDay}</p>}
                            {!isLoadingDay && !errorDay && (
                                <div className="grid grid-flow-col auto-cols-fr gap-4 overflow-x-auto pb-4">
                                    {groupedDisplayResources.map(resource => {
                                        const streamingResourceNames = new Set(['Disney+', 'Netflix']);
                                        let reservationsForResource;

                                        if (resource.id === 'streaming-group') {
                                            reservationsForResource = dailyReservations.filter(res => streamingResourceNames.has(res.NomeSubRecurso || res.NomeRecursoPai));
                                        } else {
                                            reservationsForResource = dailyReservations.filter(res => (res.NomeSubRecurso || res.NomeRecursoPai) === resource.nome);
                                        }
                                        
                                        return (
                                            <div key={resource.id} className="bg-slate-50 p-4 rounded-xl min-h-[200px] w-full min-w-[250px]">
                                                <h3 className="font-bold text-lg text-slate-700 border-b pb-2 mb-4">{resource.nome}</h3>
                                                <div className="space-y-2">
                                                    {reservationsForResource.length > 0 ? (
                                                        reservationsForResource.map(reserva => <ReservationCard key={reserva.ReservaID} reserva={reserva} onClick={setSelectedReservation} />)
                                                    ) : (
                                                        <p className="text-xs text-center text-gray-400 italic mt-4">Nenhuma reserva.</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'semana' && (
                        <div className="fade-in">
                            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                                <label className="font-semibold text-gray-700 mb-2 sm:mb-0 whitespace-nowrap">Navegar por Semana:</label>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => setCurrentDate(getToday())} className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-200 transition-colors">Hoje</button>
                                    <button onClick={() => handleDateChange(-7)} className="p-2 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 transition-colors" aria-label="Semana anterior">&lt;</button>
                                    <button onClick={() => handleDateChange(7)} className="p-2 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 transition-colors" aria-label="Próxima semana">&gt;</button>
                                    <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                                </div>
                            </div>
                            
                            {isLoadingWeek && <p>A carregar programação da semana...</p>}
                            {errorWeek && <p className="text-red-500">{errorWeek}</p>}
                            {!isLoadingWeek && !errorWeek && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {weekDays.map(day => {
                                        const dateISO = formatDateToISO(day);
                                        const reservationsForDay = weeklyReservations.filter(r => r.DataInicio.startsWith(dateISO)).sort((a, b) => new Date(a.DataInicio) - new Date(b.DataInicio));
                                        return (
                                            <div key={dateISO} className="bg-slate-50 p-3 rounded-lg min-h-[200px]">
                                                <h3 className="font-bold text-center text-slate-700 border-b pb-2 mb-2">
                                                    {day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')} <br/>
                                                    <span className="text-sm font-normal">{day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                                                </h3>
                                                <div className="space-y-2">
                                                    {reservationsForDay.length > 0 ? (
                                                        reservationsForDay.map(reserva => <ReservationCard key={reserva.ReservaID} reserva={reserva} onClick={setSelectedReservation} />)
                                                    ) : (
                                                        <p className="text-xs text-center text-gray-400 italic mt-4">Nenhuma reserva.</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
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
                                            {reservasLista.map(reserva => (
                                                <tr key={reserva.ReservaID} className="bg-white border-b hover:bg-slate-50">
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
                                                </tr>
                                            ))}
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