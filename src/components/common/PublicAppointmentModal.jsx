import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import format from 'date-fns/format';
import es from 'date-fns/locale/es';
import { useModalInteraction } from '../../hooks/useModalInteraction';

const PublicAppointmentModal = ({ isOpen, onClose, onConfirm, slotInfo }) => {
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '' });  
  // Aplicamos el hook para las interacciones de cierre
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
    // Asignamos la ref al div del fondo oscuro
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"> 
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Confirmar Cita</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded">&times;</button>
        </div>
        <p className="mb-4 text-gray-600">
          Estás reservando para el <strong className="text-primary-600">{format(slotInfo.start, 'PPPPp', { locale: es })}</strong>.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div><label htmlFor="fullName" className="block text-sm font-medium text-gray-800">Nombre Completo</label><input type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required /></div>
            <div><label htmlFor="phone" className="block text-sm font-medium text-gray-800">Teléfono</label><input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required /></div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-800">Email (Opcional)</label><input type="email" id="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" /></div>
          </div>
          <div className="flex justify-end mt-6 space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-100 transition-all duration-200">Cancelar</button>
            <button type="submit" className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md">Confirmar Reserva</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicAppointmentModal;