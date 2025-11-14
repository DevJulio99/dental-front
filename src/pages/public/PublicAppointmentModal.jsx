import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import format from 'date-fns/format';
import es from 'date-fns/locale/es';
import { useModalInteraction } from '../../hooks/useModalInteraction';

const emptyForm = {
  nombreCompleto: '',
  tipoDocumento: 'DNI',
  dniPasaporte: '',
  fechaNacimiento: '',
  telefono: '',
  email: '',
  motivo: '',
};

const PublicAppointmentModal = ({ isOpen, onClose, onConfirm, slotInfo, isSaving }) => {
  const [formData, setFormData] = useState(emptyForm);
  const modalRef = useModalInteraction(isOpen, onClose, isSaving);
  
  useEffect(() => {
    if (isOpen) {
      setFormData(emptyForm);
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
    if (!formData.nombreCompleto || !formData.telefono || !formData.dniPasaporte || !formData.fechaNacimiento || !formData.motivo) {
      toast.error('Por favor, complete todos los campos obligatorios.');
      return;
    }

    const payload = {
      ...formData,
      fechaNacimiento: new Date(formData.fechaNacimiento).toISOString(),
      fechaHora: slotInfo.start.toISOString(),
    };

    onConfirm(payload);
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Confirmar Cita</h2>
          <button onClick={onClose} disabled={isSaving} className="text-gray-500 hover:text-gray-800 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed">&times;</button>
        </div>
        <p className="mb-4 text-gray-700">
          Estás reservando para el <strong className="text-primary">{format(slotInfo.start, 'PPPPp', { locale: es })}</strong>.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div><label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700">Nombre Completo</label><input type="text" id="nombreCompleto" value={formData.nombreCompleto} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="tipoDocumento" className="block text-sm font-medium text-gray-700">Tipo de Documento</label><select id="tipoDocumento" value={formData.tipoDocumento} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required><option value="DNI">DNI</option><option value="Pasaporte">Pasaporte</option></select></div>
              <div><label htmlFor="dniPasaporte" className="block text-sm font-medium text-gray-700">N° de Documento</label><input type="text" id="dniPasaporte" value={formData.dniPasaporte} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            </div>
            <div><label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label><input type="date" id="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label><input type="tel" id="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Opcional)</label><input type="email" id="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label htmlFor="motivo" className="block text-sm font-medium text-gray-700">Motivo de la Cita</label><input type="text" id="motivo" value={formData.motivo} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-blue-600 disabled:bg-gray-400">
              {isSaving ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicAppointmentModal;