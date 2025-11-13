import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para manejar interacciones comunes de un modal.
 * @param {boolean} isOpen - Si el modal está abierto o no.
 * @param {function} onClose - La función a llamar para cerrar el modal.
 */
export const useModalInteraction = (isOpen, onClose) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      // Cierra si se hace clic en el fondo (el div con ref) pero no en sus hijos
      if (modalRef.current && event.target === modalRef.current) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return modalRef;
};