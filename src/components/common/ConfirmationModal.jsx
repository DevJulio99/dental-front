import React, { useRef } from 'react';
import { useModalInteraction } from '../../hooks/useModalInteraction';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isConfirming }) => {
  const modalRef = useModalInteraction(isOpen, onClose, isConfirming);

  if (!isOpen) {
    return null;
  }

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} disabled={isConfirming} className="text-gray-500 hover:text-gray-800 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed">&times;</button>
        </div>
        <p className="text-sm text-gray-500">{message}</p>
        <div className="flex justify-end mt-6 space-x-4">
          <button onClick={onClose} disabled={isConfirming} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
          <button onClick={onConfirm} disabled={isConfirming} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-error hover:bg-red-700 disabled:bg-gray-400">
            {isConfirming ? 'Eliminando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;