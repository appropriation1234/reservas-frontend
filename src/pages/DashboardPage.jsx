import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/admin/dashboard-stats');
            if (!response.ok) throw new Error('Falha ao buscar estatísticas do dashboard.');
            const data = await response.json();
            setStats(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (isLoading) {
        return <p>A carregar dashboard...</p>;
    }

    if (!stats) {
        return <p>Não foi possível carregar os dados do dashboard.</p>;
    }

    const StatCard = ({ title, value, description }) => (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-slate-500 font-semibold">{title}</h3>
            <p className="text-4xl font-bold text-slate-800 my-2">{value}</p>
            <p className="text-sm text-slate-400">{description}</p>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Pedidos Pendentes" 
                    value={stats.pedidosPendentes}
                    description="Aguardando aprovação"
                />
                <StatCard 
                    title="Reservas para Hoje" 
                    value={stats.reservasHoje}
                    description="Recursos já alocados"
                />
                <StatCard 
                    title="Recurso Mais Solicitado" 
                    value={stats.recursoMaisSolicitado}
                    description="O mais popular entre os utilizadores"
                />
                <StatCard 
                    title="Intenções de Reserva" 
                    value={stats.intencoesEsteMes}
                    description="Nos últimos 30 dias"
                />
            </div>
            
            {/* Espaço futuro para gráficos */}
            <div className="mt-12 bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-700">Utilização de Recursos (Gráfico Futuro)</h2>
                <p className="text-slate-500 mt-2">Área reservada para um gráfico de barras mostrando os recursos mais utilizados.</p>
            </div>
        </div>
    );
};

export default DashboardPage;