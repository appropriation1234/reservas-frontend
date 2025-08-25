import React from 'react';

const HelpModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-xl fade-in" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Como Fazer uma Reserva</h3>
      <p className="text-slate-700 mb-4"><strong>1. Selecione o Recurso:</strong> Na tela inicial, clique no card do equipamento ou conta que você deseja reservar.</p>
      <p className="text-slate-700 mb-4"><strong>2. Escolha a Data e Horário:</strong> No calendário, clique em uma data disponível e depois informe o horário de início e fim.</p>
      <p className="text-slate-700 mb-4"><strong>3. Adicione Observações:</strong> Informe o local e a atividade para que a equipe de TI possa preparar o equipamento.</p>
      <p className="text-slate-700 mb-6"><strong>4. Confirme:</strong> Revise os detalhes e clique em "Enviar para Análise" para finalizar.</p>
      <button onClick={onClose} className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700">Entendi!</button>
    </div>
  </div>
);

export default HelpModal;