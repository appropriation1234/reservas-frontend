import React, { useState, useEffect, useCallback } from 'react';
import { useMsal, useIsAuthenticated, MsalAuthenticationTemplate } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginRequest } from './authConfig';

import AdminLayout from './components/AdminLayout';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ReportPage from './pages/ReportPage';
import MyReservationsPage from './pages/MyReservationsPage';
import SubResourcePage from './pages/SubResourcePage';
import DateTimePage from './pages/DateTimePage';
import ObservationsPage from './pages/ObservationsPage';
import ConfirmationPage from './pages/ConfirmationPage';
import HelpModal from './pages/HelpModal';
import ManageResourcesPage from './pages/ManageResourcesPage';
import ManageUsersPage from './pages/ManageUsersPage';

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

function ErrorComponent({ error }) {
    console.error(error);
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-10 bg-white rounded-lg shadow-lg">
                <h1 className="text-xl font-bold text-red-600">Erro de Autenticação</h1>
                <p className="mt-2">Por favor, volte ao portal e tente fazer o login novamente.</p>
                <a href="http://localhost:5174" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded">Voltar ao Portal</a>
            </div>
        </div>
    );
}

function MainContent() {
    const { instance, accounts } = useMsal();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState('home');
    const [resources, setResources] = useState([]);
    const [reservations, setReservations] = useState([]);
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
            toast.error("Não foi possível carregar os dados da aplicação.");
        }
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            if (accounts.length > 0 && !user) {
                const userEmail = accounts[0].username;
                try {
                    const response = await fetch('http://localhost:3001/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: userEmail })
                    });
                    if (!response.ok) throw new Error("Utilizador não registado.");
                    const userData = await response.json();
                    setUser(userData);
                    await fetchData();
                } catch (error) {
                    toast.error(error.message);
                } finally {
                    setIsLoading(false);
                }
            } else if (accounts.length === 0) {
                setIsLoading(false);
            }
        };
        checkUser();
    }, [accounts, user, fetchData]);

    const handleLogout = () => {
        window.location.href = 'http://localhost:5174';
    };
    const handleLogoClick = () => setPage('home');
    const handleResourceClick = (resource) => {
        setReservationFlow({ resource });
        if (resource.subRecursos && resource.subRecursos.length > 0) {
            setPage('sub_resource');
        } else {
            setPage('date_time');
        }
    };
    const handleSubResourceSelect = (subResource) => { setReservationFlow(prev => ({ ...prev, subResource })); setPage('date_time'); };
    const handleDateTimeSubmit = (details) => { setReservationFlow(prev => ({ ...prev, timeDetails: details })); setPage('observations'); };
    const handleConfirm = async (observations) => {
        const { resource, subResource, timeDetails } = reservationFlow;
        const finalResource = subResource || resource;
        const newReservationData = {
          usuarioId: user.id, 
          recursoPaiId: resource.id, 
          recursoFinalId: finalResource.id,
          dataInicio: `${timeDetails.date}T${timeDetails.startTime}:00`, 
          dataFim: `${timeDetails.date}T${timeDetails.endTime}:00`,
          status: 'pendente', 
          obsLocal: observations.local, 
          obsAtividade: observations.atividade
        };
        try {
            const response = await fetch('http://localhost:3001/api/reservas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReservationData) });
            if (!response.ok) throw new Error('Falha ao criar o pedido de reserva.');
            setReservationFlow(prev => ({ ...prev, observations }));
            fetchData();
            setPage('confirmation');
        } catch (error) { 
            toast.error("Ocorreu um erro ao enviar o seu pedido.");
        }
    };
    const handleBackToHome = () => setPage('home');
    const handleBack = () => {
        if (['my_reservations', 'confirmation', 'report'].includes(page)) { setPage('home'); } 
        else if (page === 'observations') { setPage('date_time'); } 
        else if (page === 'date_time') {
            if (reservationFlow.subResource) { setReservationFlow(prev => ({ resource: prev.resource })); setPage('sub_resource'); } 
            else { setReservationFlow({}); setPage('home'); }
        } else if (page === 'sub_resource') { setReservationFlow({}); setPage('home'); }
    };
    const handleNewReservation = () => { setReservationFlow({}); setPage('home'); };

    if (isLoading || !user) {
        return <div className="flex items-center justify-center min-h-screen">A carregar...</div>;
    }

    const isAdminProfile = ['TI_Admin', 'Secretaria', 'ProdutorEventos'].includes(user.profile);
    const isAdminPage = ['reservations', 'resources', 'users'].includes(page);

    if (isAdminProfile && isAdminPage) {
        return (
            <AdminLayout user={user} onLogout={handleLogout} onLogoClick={handleBackToHome} activePage={page} setActivePage={setPage}>
                {page === 'reservations' && <AdminPage resources={resources} />}
                {page === 'resources' && <ManageResourcesPage />}
                {page === 'users' && <ManageUsersPage />}
            </AdminLayout>
        );
    }
    
    const finalResource = reservationFlow.subResource || reservationFlow.resource;
    switch(page) {
        case 'home': 
            return <HomePage resources={resources} onResourceClick={handleResourceClick} onLogout={handleLogout} onAdminClick={() => setPage('reservations')} onMyReservationsClick={() => setPage('my_reservations')} userProfile={user.profile} onLogoClick={handleLogoClick} onReportClick={() => setPage('report')} onShowHelp={() => setShowHelp(true)} />;
        case 'my_reservations': 
            return <MyReservationsPage onBack={handleBack} onLogout={handleLogout} userId={user.id} onLogoClick={handleLogoClick} />;
        case 'report': 
            return <ReportPage onBack={handleBack} onLogout={handleLogout} onLogoClick={handleLogoClick} resources={resources} />;
        case 'sub_resource': 
            return <SubResourcePage resource={reservationFlow.resource} onSelect={handleSubResourceSelect} onBack={handleBack} onLogout={handleLogout} onLogoClick={handleLogoClick} />;
        case 'date_time': 
            return <DateTimePage finalResource={finalResource} reservations={reservations} onBack={handleBack} onLogout={handleLogout} onDateTimeSubmit={handleDateTimeSubmit} onLogoClick={handleLogoClick} user={user} />;
        case 'observations': 
            return <ObservationsPage finalResource={finalResource} reservationDetails={reservationFlow.timeDetails} onBack={handleBack} onLogout={handleLogout} onConfirm={handleConfirm} onLogoClick={handleLogoClick} />;
        case 'confirmation': 
            return <ConfirmationPage details={{...reservationFlow, finalResource}} onNewReservation={handleNewReservation} onMyReservationsClick={() => setPage('my_reservations')} />;
        default: 
            return <div>Página não encontrada</div>;
    }
}

const App = () => {
    return (
        <div className="bg-gray-100">
             <MsalAuthenticationTemplate 
                interactionType={InteractionType.Redirect} 
                authenticationRequest={loginRequest}
                errorComponent={ErrorComponent}
                loadingComponent={() => <div className="flex items-center justify-center min-h-screen">A autenticar...</div>}
            >
                <MainContent />
            </MsalAuthenticationTemplate>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            {/* O seu <HelpModal> precisa de ser gerido aqui ou dentro do MainContent */}
        </div>
    );
};

export default App;