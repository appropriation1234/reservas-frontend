import React, { useState, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import icons from '../components/Icons';

const ReportPage = ({ onBack, onLogout, onLogoClick, resources }) => {
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ departamento: '', sublocal: '', dataInicio: '', dataFim: '', recurso: '' });
    const [modalDetails, setModalDetails] = useState({ isOpen: false, title: '', data: [] });
    const [isModalLoading, setIsModalLoading] = useState(false);

    const finalBookableResources = useMemo(() => {
        const allResources = [];
        resources.forEach(res => {
            if (res.subRecursos && res.subRecursos.length > 0) { allResources.push(...res.subRecursos); }
            else { allResources.push({ id: res.id, nome: res.nome }); }
        });
        return allResources;
    }, [resources]);
    
    const departments = {
        'Infantil': [],
        'Fundamental 1': ['Cluster 2', 'Cluster 3', 'Cluster 4', 'Cluster 5'],
        'Fundamental 2': [],
        'Ensino Médio': []
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            if (name === 'departamento') newFilters.sublocal = '';
            return newFilters;
        });
    };

    const fetchReportData = useCallback(async () => {
        try {
            setIsLoading(true); setError('');
            const params = new URLSearchParams();
            if (filters.departamento) params.append('departamento', filters.departamento);
            if (filters.sublocal) params.append('sublocal', filters.sublocal);
            if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
            if (filters.dataFim) params.append('dataFim', filters.dataFim);
            if (filters.recurso) params.append('recurso', filters.recurso);
            const response = await fetch(`http://localhost:3001/api/relatorio/uso?${params.toString()}`);
            if (!response.ok) throw new Error('Falha ao carregar os dados do relatório.');
            const data = await response.json();
            setReportData(data);
        } catch (err) {
            setError(err.message); setReportData([]);
        } finally { setIsLoading(false); }
    }, [filters]);
    
    const clearFilters = () => {
        setFilters({ departamento: '', sublocal: '', dataInicio: '', dataFim: '', recurso: '' });
        setReportData([]);
    };

    const handleShowDetails = async (recursoNome, status) => {
        setIsModalLoading(true);
        setModalDetails({ isOpen: true, title: `${status.charAt(0).toUpperCase() + status.slice(1)}s - ${recursoNome}`, data: [], recursoNome, status });
        try {
            const params = new URLSearchParams({ recursoNome, status });
            if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
            if (filters.dataFim) params.append('dataFim', filters.dataFim);
            if (filters.departamento) params.append('departamento', filters.departamento);
            if (filters.sublocal) params.append('sublocal', filters.sublocal);
            
            const response = await fetch(`http://localhost:3001/api/admin/reservas?${params.toString()}`);
            if (!response.ok) throw new Error('Falha ao buscar detalhes.');
            const data = await response.json();
            setModalDetails(prev => ({ ...prev, data }));
        } catch (err) { alert(err.message); } finally { setIsModalLoading(false); }
    };
    
    const handleDownloadPdf = (specificParams = {}) => {
        const params = new URLSearchParams();
        if (filters.departamento) params.append('departamento', filters.departamento);
        if (filters.sublocal) params.append('sublocal', filters.sublocal);
        if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
        if (filters.dataFim) params.append('dataFim', filters.dataFim);
        if (filters.recurso) params.append('recursoNome', filters.recurso);
        if (specificParams.recursoNome) params.append('recursoNome', specificParams.recursoNome);
        if (specificParams.status) params.append('status', specificParams.status);
        window.open(`http://localhost:3001/api/relatorio/detalhado/pdf?${params.toString()}`, '_blank');
    };

    const DetailsModal = ({ details, onClose, isLoading }) => {
        if (!details.isOpen) return null;
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-5xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">{details.title}</h3>
                        <button onClick={() => handleDownloadPdf({ recursoNome: details.recursoNome, status: details.status })} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-700">Descarregar PDF</button>
                    </div>
                    {isLoading ? <p>A carregar...</p> : (
                        <div className="max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-slate-100 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">Solicitante</th>
                                        <th className="px-4 py-2">Data</th>
                                        <th className="px-4 py-2">Local</th>
                                        {(details.status === 'recusada' || details.status === 'cancelada') && (<th className="px-4 py-2">Motivo</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {details.data.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center p-4">Nenhuma reserva encontrada para estes filtros.</td></tr>
                                    ) : (
                                        details.data.map(reserva => (
                                            <tr key={reserva.ReservaID} className="border-b">
                                                <td className="px-4 py-2">{reserva.NomeUsuario}</td>
                                                <td className="px-4 py-2">{new Date(reserva.DataInicio).toLocaleDateString('pt-BR')}</td>
                                                <td className="px-4 py-2">{reserva.ObservacoesLocal}</td>
                                                {(details.status === 'recusada' || details.status === 'cancelada') && (
                                                    <td className="px-4 py-2 text-red-600">{reserva.ObservacoesRecusa || reserva.ObservacoesCancelamento}</td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <button onClick={onClose} className="w-full mt-4 py-2 px-4 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600">Fechar</button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header title="Relatório de Utilização" onLogoClick={onLogoClick} onLogout={onLogout}>
                <button onClick={onBack} className="flex items-center text-gray-600 hover:text-blue-600 font-semibold p-2 rounded-md hover:bg-slate-100">
                    <icons.ArrowLeft className="h-6 w-6 mr-1" /><span className="hidden sm:inline">Voltar</span>
                </button>
            </Header>
            <main className="w-full max-w-7xl mx-auto p-4 sm:p-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Estatísticas de Uso por Recurso</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 border rounded-lg mb-6">
                        <div><label className="block text-sm font-medium text-slate-700">Recurso</label><select name="recurso" value={filters.recurso} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md"><option value="">Todos</option>{finalBookableResources.map(res => <option key={res.id} value={res.nome}>{res.nome}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-slate-700">Departamento</label><select name="departamento" value={filters.departamento} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md"><option value="">Todos</option>{Object.keys(departments).map(dept => <option key={dept} value={dept}>{dept}</option>)}</select></div>
                        {filters.departamento === 'Fundamental 1' && (<div><label className="block text-sm font-medium text-slate-700">Sublocal</label><select name="sublocal" value={filters.sublocal} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md"><option value="">Todos</option>{departments['Fundamental 1'].map(sub => <option key={sub} value={sub}>{sub}</option>)}</select></div>)}
                        <div><label className="block text-sm font-medium text-slate-700">De:</label><input type="date" name="dataInicio" value={filters.dataInicio} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md"/></div>
                        <div><label className="block text-sm font-medium text-slate-700">Até:</label><input type="date" name="dataFim" value={filters.dataFim} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md"/></div>
                    </div>
                    <div className="flex items-center space-x-4 mb-6">
                        <button onClick={fetchReportData} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">Aplicar Filtros</button>
                        <button onClick={clearFilters} className="text-sm text-gray-600 hover:underline">Limpar</button>
                        {reportData.length > 0 && (<button onClick={() => handleDownloadPdf()} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700">Descarregar PDF</button>)}
                    </div>
                    {isLoading && <p>A gerar relatório...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!isLoading && !error && reportData.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100"><tr><th scope="col" className="px-6 py-3">Recurso</th><th scope="col" className="px-6 py-3 text-center">Aprovadas</th><th scope="col" className="px-6 py-3 text-center">Canceladas</th><th scope="col" className="px-6 py-3 text-center">Recusadas</th></tr></thead>
                                <tbody>
                                    {reportData.map(item => (
                                        <tr key={item.Recurso} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-semibold text-slate-900">{item.Recurso}</td>
                                            <td className="px-6 py-4 text-center text-lg font-bold text-green-600 cursor-pointer hover:underline" onClick={() => handleShowDetails(item.Recurso, 'aprovada')}>{item.Aprovadas}</td>
                                            <td className="px-6 py-4 text-center text-lg font-bold text-gray-500 cursor-pointer hover:underline" onClick={() => handleShowDetails(item.Recurso, 'cancelada')}>{item.Canceladas}</td>
                                            <td className="px-6 py-4 text-center text-lg font-bold text-red-600 cursor-pointer hover:underline" onClick={() => handleShowDetails(item.Recurso, 'recusada')}>{item.Recusadas}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!isLoading && !error && reportData.length === 0 && <p className="text-slate-500">Nenhum resultado encontrado. Tente aplicar um filtro.</p>}
                </div>
            </main>
            <DetailsModal details={modalDetails} onClose={() => setModalDetails({ isOpen: false, title: '', data: [] })} isLoading={isModalLoading} />
        </div>
    );
};

export default ReportPage;