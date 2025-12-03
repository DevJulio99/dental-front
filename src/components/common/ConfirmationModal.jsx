import React, { useRef } from 'react';
import { useModalInteraction } from '../../hooks/useModalInteraction';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isConfirming }) => {
  const modalRef = useModalInteraction(isOpen, onClose, isConfirming);

  if (!isOpen) {
    return null;
  }

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-large">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} disabled={isConfirming} className="text-gray-400 hover:text-gray-600 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded">&times;</button>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end mt-6 space-x-3">
          <button 
            onClick={onClose} 
            disabled={isConfirming} 
            className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-200 transition-all duration-200"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isConfirming} 
            className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {isConfirming ? 'Eliminando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;