import React, { useRef } from 'react';
import { useModalInteraction } from '../../hooks/useModalInteraction';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const modalRef = useModalInteraction(isOpen, onClose);

  if (!isOpen) {
    return null;
  }

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="mt-2 text-gray-600">{message}</p>
        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-error rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Confirmar Eliminación
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;