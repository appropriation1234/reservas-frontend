import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import icons from '../components/Icons';

const DateTimePage = ({ finalResource, reservations, onBack, onLogout, onDateTimeSubmit, onLogoClick, user }) => {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [conflict, setConflict] = useState({ type: null, message: '' });
    const [intentionSent, setIntentionSent] = useState(false);

    const checkConflict = useCallback(() => {
        if (intentionSent) return;
        if (!date || !startTime || !endTime) {
            setConflict({ type: null, message: '' });
            return;
        }
        const newStart = new Date(`${date}T${startTime}:00`);
        const newEnd = new Date(`${date}T${endTime}:00`);
        if (newEnd <= newStart) {
            setConflict({ type: 'error', message: 'O horário de fim deve ser após o de início.' });
            return;
        }
        const timeOverlap = (res) => {
            const existingStart = new Date(res.data_inicio);
            const existingEnd = new Date(res.data_fim);
            return newStart < existingEnd && newEnd > existingStart;
        }
        const activeReservations = reservations.filter(r => r.status === 'aprovada' || r.status === 'pendente');

        const existingReservation = activeReservations.find(res => res.id_recurso_final === finalResource.id && timeOverlap(res));

        if (existingReservation) {
             if(existingReservation.status === 'aprovada') {
                setConflict({ type: 'error', message: 'Este horário se encontra OCUPADO. Declare sua intenção de reserva para ajudar a equipe de TI a expandir os recursos no FUTURO.' });
             } else {
                setConflict({ type: 'error', message: 'Existe uma reserva em espera de aprovação neste horário. Declare sua intenção de reserva para ajudar a equipe de TI a medir a demanda.' });
             }
            return;
        }

        setConflict({ type: null, message: '' });
    }, [date, startTime, endTime, reservations, finalResource, intentionSent]);

    useEffect(() => {
        checkConflict();
    }, [checkConflict]);

    const handleSubmit = () => {
        if (conflict.type === 'error' || intentionSent) return;
        if (date && startTime && endTime) {
            onDateTimeSubmit({ date, startTime, endTime });
        } else {
            toast.warn('Por favor, selecione data e horários.');
        }
    };

    const handleIntentionSubmit = async () => {
        if (!user || !finalResource) {
            console.error("Erro: Dados do utilizador ou do recurso estão em falta.");
            alert("Ocorreu um erro. Por favor, recarregue a página e tente novamente.");
            return;
        }
        if (!date || !startTime || !endTime) {
            toast.warn('Por favor, selecione data e horários antes de declarar a intenção.');
            return;
        }
        const intentionData = {
            usuarioId: user.id,
            recursoFinalId: finalResource.id,
            dataInicio: `${date}T${startTime}:00`,
            dataFim: `${date}T${endTime}:00`,
        };
        try {
            const response = await fetch('http://localhost:3001/api/intencoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(intentionData)
            });
            if (!response.ok) throw new Error('Falha ao registar a intenção.');
            setIntentionSent(true);
        } catch (error) {
            console.error(error);
            toast.error("Ocorreu um erro ao registar a sua intenção. Tente novamente.");
        }
    };

    const days = useMemo(() => {
        const d = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < 30; i++) {
            const day = new Date(today);
            day.setDate(today.getDate() + i);
            d.push(day);
        }
        return d;
    }, []);

    const dayStatus = useMemo(() => {
        const statusMap = {};
        days.forEach(day => {
            const dateString = day.toISOString().split('T')[0];
            const reservationsForDay = reservations.filter(res => res.data_inicio.startsWith(dateString) && res.id_recurso_final === finalResource.id && (res.status === 'aprovada' || res.status === 'pendente'));
            if (reservationsForDay.some(r => r.status === 'aprovada')) {
                statusMap[dateString] = 'approved';
            } else if (reservationsForDay.some(r => r.status === 'pendente')) {
                statusMap[dateString] = 'pending';
            }
        });
        return statusMap;
    }, [days, reservations, finalResource]);

    const reservationsForSelectedDay = useMemo(() => {
        if (!date) return [];
        return reservations.filter(res => res.data_inicio.startsWith(date) && res.id_recurso_final === finalResource.id && (res.status === 'aprovada' || res.status === 'pendente')).sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));
    }, [date, reservations, finalResource]);

    const isDateLocked = (day) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (day.getTime() <= today.getTime()) return true;
        const now = new Date();
        return day.getTime() - now.getTime() < 48 * 60 * 60 * 1000;
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header title={`Reserva: ${finalResource.nome}`} onLogoClick={onLogoClick} onLogout={onLogout}>
                <button onClick={onBack} className="flex items-center text-gray-600 hover:text-blue-600 font-semibold p-2 rounded-md hover:bg-slate-100">
                    <icons.ArrowLeft className="h-6 w-6 mr-1" />
                    <span className="hidden sm:inline">Voltar</span>
                </button>
            </Header>
            <main className="flex justify-center p-8">
                <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-2xl border-t-4 border-blue-600">
                    <h2 className="text-2xl font-bold mb-6 text-slate-800">1. Selecione a Data</h2>
                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-3 mb-10">
                        {days.map(day => {
                            const dateString = day.toISOString().split('T')[0];
                            const isDisabled = isDateLocked(day);
                            const status = dayStatus[dateString];
                            return (
                                <div key={dateString} onClick={() => { if (!isDisabled) { setDate(dateString); setIntentionSent(false); } }} className={`relative flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${isDisabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-100 hover:bg-blue-200 cursor-pointer'} ${date === dateString ? 'bg-blue-600 text-white shadow-lg' : ''}`}>
                                    <span className="text-sm font-semibold capitalize">{day.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '')}</span>
                                    <span className="text-2xl font-extrabold">{day.getUTCDate()}</span>
                                    {status && <div className={`absolute bottom-1 h-2 w-2 rounded-full ${status === 'approved' ? 'bg-red-500' : 'bg-yellow-400'}`}></div>}
                                </div>
                            );
                        })}
                    </div>

                    {date && (
                        <div className="fade-in">
                            {reservationsForSelectedDay.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-slate-700 mb-3">Horários Ocupados Neste Dia:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {reservationsForSelectedDay.map(res => (
                                            <div key={res.id_reserva} className={`px-3 py-1 text-sm font-semibold rounded-full ${res.status === 'aprovada' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {new Date(res.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(res.data_fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ({res.status})
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <h2 className="text-2xl font-bold mb-6 text-slate-800">2. Selecione o Horário</h2>
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-2">
                                <div className="w-full sm:w-1/2">
                                    <label htmlFor="start-time" className="block text-sm font-medium text-slate-700 mb-1">Início</label>
                                    <input type="time" id="start-time" value={startTime} onChange={(e) => { setStartTime(e.target.value); setIntentionSent(false); }} className={`w-full p-3 border rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 ${conflict.type === 'error' ? 'border-red-500' : 'border-slate-300'}`} />
                                </div>
                                <div className="w-full sm:w-1/2">
                                    <label htmlFor="end-time" className="block text-sm font-medium text-slate-700 mb-1">Fim</label>
                                    <input type="time" id="end-time" value={endTime} onChange={(e) => { setEndTime(e.target.value); setIntentionSent(false); }} className={`w-full p-3 border rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 ${conflict.type === 'error' ? 'border-red-500' : 'border-slate-300'}`} />
                                </div>
                            </div>

                            {intentionSent ? (
                                <div className="mt-4 text-center">
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                                        <strong className="font-bold block text-lg">Isto NÃO é um pedido de reserva.</strong>
                                        <span className="block mt-1">Obrigado! A sua intenção de uso para este horário foi registada. Isto ajuda a equipe de TI a medir a demanda por recursos.</span>
                                    </div>
                                    <button 
                                        onClick={onLogoClick} 
                                        className="mt-4 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all"
                                    >
                                        Voltar para a Página Inicial
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {conflict.message && (
                                        <p className={`text-sm mt-2 mb-6 ${conflict.type === 'error' ? 'text-red-600' : 'text-amber-600'}`}>
                                            {conflict.message}
                                        </p>
                                    )}

                                    <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                        <button 
                                            onClick={handleSubmit} 
                                            disabled={conflict.type === 'error'} 
                                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400"
                                        >
                                            Enviar para Análise
                                        </button>
                                        
                                        {conflict.type === 'error' && (
                                            <button 
                                                onClick={handleIntentionSubmit}
                                                className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-red-700 transition-all transform hover:scale-105"
                                            >
                                                Declarar Intenção de Reserva
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DateTimePage;