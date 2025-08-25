import React, { useState } from 'react';
import Header from '../components/Header';
import icons from '../components/Icons';

const ObservationsPage = ({ finalResource, reservationDetails, onBack, onLogout, onConfirm, onLogoClick }) => {
  const [department, setDepartment] = useState('');
  const [subLocal, setSubLocal] = useState('');
  const [otherDepartment, setOtherDepartment] = useState('');
  const [specificLocal, setSpecificLocal] = useState('');
  const [activity, setActivity] = useState('');
  const departments = { 'Infantil': [], 'Fundamental 1': ['Cluster 2', 'Cluster 3', 'Cluster 4', 'Cluster 5'], 'Fundamental 2': [], 'Ensino Médio': [], 'Outro': [] };
  const handleDepartmentChange = (e) => { setDepartment(e.target.value); setSubLocal(''); setOtherDepartment(''); };
  const handleConfirmClick = () => {
    let finalDepartment = department;
    if (department === 'Outro') {
        if (!otherDepartment.trim()) { alert('Por favor, especifique o departamento.'); return; }
        finalDepartment = otherDepartment.trim();
    }
    if (!finalDepartment) { alert('Por favor, selecione um departamento.'); return; }
    const fullLocal = subLocal ? `${finalDepartment} - ${subLocal} - ${specificLocal}` : `${finalDepartment} - ${specificLocal}`;
    onConfirm({ local: fullLocal, atividade: activity });
  };
  return (
    <div className="bg-slate-50 min-h-screen">
      <Header title="Observações" onLogoClick={onLogoClick} onLogout={onLogout}><button onClick={onBack} className="flex items-center text-gray-600 hover:text-blue-600 font-semibold p-2 rounded-md hover:bg-slate-100"><icons.ArrowLeft className="h-6 w-6 mr-1" /><span className="hidden sm:inline">Voltar</span></button></Header>
      <main className="flex justify-center p-8">
        <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-2xl border-t-4 border-blue-600">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">3. Onde o recurso será utilizado?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div><label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">Departamento</label><select id="department" value={department} onChange={handleDepartmentChange} className="w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"><option value="">Selecione...</option>{Object.keys(departments).map(dept => <option key={dept} value={dept}>{dept}</option>)}</select></div>
            {department && departments[department] && departments[department].length > 0 && (<div className="fade-in"><label htmlFor="sublocal" className="block text-sm font-medium text-slate-700 mb-1">Sublocal</label><select id="sublocal" value={subLocal} onChange={(e) => setSubLocal(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"><option value="">Selecione...</option>{departments[department].map(sub => <option key={sub} value={sub}>{sub}</option>)}</select></div>)}
          </div>
          {department === 'Outro' && (<div className="mb-6 fade-in"><label htmlFor="other_department" className="block text-sm font-medium text-slate-700 mb-1">Qual departamento?</label><input type="text" id="other_department" value={otherDepartment} onChange={(e) => setOtherDepartment(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Biblioteca, Ginásio..." /></div>)}
          <div className="mb-8"><label htmlFor="specific_local" className="block text-sm font-medium text-slate-700 mb-1">Local Específico de Uso (Ex: 4ºA ou Sala 34)</label><input type="text" id="specific_local" value={specificLocal} onChange={(e) => setSpecificLocal(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Informe a sala, turma ou local" /></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">4. Qual atividade será realizada?</h2>
          <div className="mb-8"><label htmlFor="atividade" className="block text-sm font-medium text-slate-700 mb-1">Atividade (Ex: Moodle, Matific, Kahoot etc.)</label><textarea id="atividade" value={activity} onChange={(e) => setActivity(e.target.value)} rows="3" className="w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none" placeholder="Descreva a atividade a ser realizada"></textarea></div>
          <div className="bg-blue-50 text-blue-800 p-6 rounded-xl mb-6 shadow-inner"><p className="font-semibold text-lg">Revisão do Pedido:</p><p>Recurso: <span className="font-medium">{finalResource.nome}</span></p><p>Data: <span className="font-medium">{new Date(reservationDetails.date + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span></p><p>Horário: <span className="font-medium">{reservationDetails.startTime} - {reservationDetails.endTime}</span></p></div>
          <button onClick={handleConfirmClick} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all transform hover:scale-105">Enviar para Análise</button>
        </div>
      </main>
    </div>
  );
};

export default ObservationsPage;