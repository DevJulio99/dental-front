import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import format from 'date-fns/format';
import es from 'date-fns/locale/es';
import { useModalInteraction } from '../../hooks/useModalInteraction';

const PublicAppointmentModal = ({ isOpen, onClose, onConfirm, slotInfo }) => {
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '' });
  const modalRef = useModalInteraction(isOpen, onClose);
  
  useEffect(() => {
    if (isOpen) {
      setFormData({ fullName: '', phone: '', email: '' });
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      toast.error('El nombre completo y el teléfono son obligatorios.');
      return;
    }
    onConfirm({ ...formData, ...slotInfo });
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Confirmar Cita</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <p className="mb-4 text-gray-700">
          Estás reservando para el <strong className="text-primary">{format(slotInfo.start, 'PPPPp', { locale: es })}</strong>.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div><label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nombre Completo</label><input type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label><input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Opcional)</label><input type="email" id="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-blue-600">Confirmar Reserva</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicAppointmentModal;