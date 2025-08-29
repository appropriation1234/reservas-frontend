import React, { useState, useEffect, useCallback } from 'react';
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ReportPage from './pages/ReportPage';
import MyReservationsPage from './pages/MyReservationsPage';
import SubResourcePage from './pages/SubResourcePage';
import DateTimePage from './pages/DateTimePage';
import ObservationsPage from './pages/ObservationsPage';
import ConfirmationPage from './pages/ConfirmationPage';
import HelpModal from './pages/HelpModal';

const App = () => {
    const { instance, inProgress, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    const [resources, setResources] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null); // Nosso utilizador interno
    const [loginError, setLoginError] = useState(null); // Novo estado para gerir erros de login
    const [page, setPage] = useState('home');
    const [showHelp, setShowHelp] = useState(false);
    const [reservationFlow, setReservationFlow] = useState({});

    const fetchData = useCallback(async () => {
        try {
            const [resResources, resReservations] = await Promise.all([
                fetch('http://localhost:3001/api/recursos').then(res => res.json()),
                fetch('http://localhost:3001/api/reservas').then(res => res.json())
            ]);
            setResources(resResources);
            setReservations(resReservations);
        } catch (error) {
            console.error("Erro ao carregar dados da API:", error);
        }
    }, []);
    
    useEffect(() => {
        const checkUser = async () => {
            if (isAuthenticated && accounts.length > 0 && !user) { // Adicionado '!user' para evitar re-execuções desnecessárias
                const currentUserAccount = accounts[0];
                const userEmail = currentUserAccount.username;

                try {
                    const response = await fetch('http://localhost:3001/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: userEmail })
                    });

                    if (!response.ok) {
                        setLoginError(`O seu email (${userEmail}) foi autenticado pela Microsoft, mas não foi encontrado no sistema de reservas. Por favor, contacte o suporte de TI.`);
                        // Reativa o logout para limpar a sessão inválida
                        instance.logoutRedirect(); 
                        return;
                    }
                    
                    const userData = await response.json();
                    setUser(userData);
                    
                    await fetchData();

                } catch (error) {
                    console.error("Erro de rede ou crítico ao comunicar com a API interna:", error);
                    setLoginError("Não foi possível conectar ao servidor de reservas. Tente novamente mais tarde.");
                } finally {
                    setIsLoading(false);
                }

            } else if (inProgress === InteractionStatus.None && !isAuthenticated) {
                setIsLoading(false);
            }
        };

        checkUser();

    }, [isAuthenticated, inProgress, accounts, instance, fetchData, user]);

    const handleLogout = () => {
        instance.logoutRedirect({ postLogoutRedirectUri: "/" });
        setUser(null); // Limpa o nosso estado de utilizador interno
    };
    
    const handleLogoClick = () => setPage('home');
    const handleResourceClick = (resource) => { setReservationFlow({ resource }); setPage(resource.subRecursos?.length > 0 ? 'sub_resource' : 'date_time'); };
    const handleSubResourceSelect = (subResource) => { setReservationFlow(prev => ({ ...prev, subResource })); setPage('date_time'); };
    const handleDateTimeSubmit = (details) => { setReservationFlow(prev => ({ ...prev, timeDetails: details })); setPage('observations'); };
      
    const handleConfirm = async (observations) => {
        const { resource, subResource, timeDetails } = reservationFlow;
        const finalResource = subResource || resource;
        const newReservationData = {
          usuarioId: user.id, recursoPaiId: resource.id, recursoFinalId: finalResource.id,
          dataInicio: `${timeDetails.date}T${timeDetails.startTime}:00`, dataFim: `${timeDetails.date}T${timeDetails.endTime}:00`,
          status: 'pendente', obsLocal: observations.local, obsAtividade: observations.atividade
        };
        try {
            const response = await fetch('http://localhost:3001/api/reservas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReservationData) });
            if (!response.ok) throw new Error('Falha ao criar o pedido de reserva.');
            setReservationFlow(prev => ({ ...prev, observations }));
            fetchData();
            setPage('confirmation');
        } catch (error) { console.error("Erro ao enviar pedido:", error); alert("Ocorreu um erro ao enviar o seu pedido."); }
    };
      
    const handleBack = () => {
        if (['admin', 'my_reservations', 'confirmation', 'report'].includes(page)) { setPage('home'); } 
        else if (page === 'observations') { setPage('date_time'); } 
        else if (page === 'date_time') {
            if (reservationFlow.subResource) { setReservationFlow(prev => ({ resource: prev.resource })); setPage('sub_resource'); } 
            else { setReservationFlow({}); setPage('home'); }
        } else if (page === 'sub_resource') { setReservationFlow({}); setPage('home'); }
    };

    const handleNewReservation = () => { setReservationFlow({}); setPage('home'); };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen text-lg font-semibold">A verificar autenticação...</div>;
    }

    // Se não estiver autenticado ou se não tiver um utilizador válido no nosso sistema, mostra a página de login.
    // Passamos o erro para a LoginPage para que ela o possa exibir.
    if (!isAuthenticated || !user) {
        return <LoginPage loginError={loginError} />;
    }
    
    const renderPage = () => {
        const finalResource = reservationFlow.subResource || reservationFlow.resource;
        switch(page) {
            case 'home': return <HomePage resources={resources} onResourceClick={handleResourceClick} onLogout={handleLogout} onAdminClick={() => setPage('admin')} onMyReservationsClick={() => setPage('my_reservations')} userProfile={user.profile} onLogoClick={handleLogoClick} onReportClick={() => setPage('report')} onShowHelp={() => setShowHelp(true)} />;
            case 'admin': return <AdminPage onBack={handleBack} onLogout={handleLogout} resources={resources} onLogoClick={handleLogoClick} />;
            case 'my_reservations': return <MyReservationsPage onBack={handleBack} onLogout={handleLogout} userId={user.id} onLogoClick={handleLogoClick} />;
            case 'sub_resource': return <SubResourcePage resource={reservationFlow.resource} onSelect={handleSubResourceSelect} onBack={handleBack} onLogout={handleLogout} onLogoClick={handleLogoClick} />;
            case 'date_time': return <DateTimePage finalResource={finalResource} reservations={reservations} onBack={handleBack} onLogout={handleLogout} onDateTimeSubmit={handleDateTimeSubmit} onLogoClick={handleLogoClick} userId={user.id} />;
            case 'observations': return <ObservationsPage finalResource={finalResource} reservationDetails={reservationFlow.timeDetails} onBack={handleBack} onLogout={handleLogout} onConfirm={handleConfirm} onLogoClick={handleLogoClick} />;
            case 'confirmation': return <ConfirmationPage details={{...reservationFlow, finalResource}} onNewReservation={handleNewReservation} onMyReservationsClick={() => setPage('my_reservations')} />;
            case 'report': return <ReportPage onBack={handleBack} onLogout={handleLogout} onLogoClick={handleLogoClick} resources={resources} />;
            default: return <div>Página não encontrada</div>;
        }
    };

    return (
        <div className="font-sans antialiased text-slate-800 bg-slate-100 min-h-screen">
            {renderPage()}
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </div>
    );
};

export default App;