import React from 'react';

const ConfirmationPage = ({ details, onNewReservation, onMyReservationsClick }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
    <main className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-2xl border-t-4 border-blue-600 text-center">
      <h2 className="text-3xl font-bold text-blue-600 mb-4">Pedido Enviado para Análise</h2>
      <p className="text-slate-600 mb-6">A sua solicitação de reserva foi enviada para a equipe de TI. Você será notificado quando o status for atualizado.</p>
      <div className="text-left bg-slate-50 p-6 rounded-lg border border-slate-200">
        <p className="text-lg text-slate-700 mb-2">Recurso: <span className="font-bold">{details.finalResource.nome}</span></p>
        <p className="text-lg text-slate-700 mb-2">Data: <span className="font-bold">{new Date(details.timeDetails.date + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span></p>
        <p className="text-lg text-slate-700 mb-4">Horário: <span className="font-bold">{details.timeDetails.startTime} - {details.timeDetails.endTime}</span></p>
        <p className="text-lg text-slate-700 font-bold mt-4">Observações:</p>
        <p className="text-lg text-slate-700 mb-2">Local: <span className="font-bold">{details.observations.local || 'Não informado'}</span></p>
        <p className="text-lg text-slate-700">Atividade: <span className="font-bold">{details.observations.atividade || 'Não informado'}</span></p>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button onClick={onNewReservation} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all">
            Página Inicial
        </button>
        <button onClick={onMyReservationsClick} className="bg-white text-blue-600 border border-blue-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-50 transform hover:scale-105 transition-all">
            Ver Minhas Reservas
        </button>
      </div>
    </main>
  </div>
);

export default ConfirmationPage;