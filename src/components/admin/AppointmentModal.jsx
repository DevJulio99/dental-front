import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useModalInteraction } from '../../hooks/useModalInteraction';
import { useApi } from '../../hooks/useApi';
import { format } from 'date-fns';
import { differenceInMinutes } from 'date-fns';

const emptyForm = {
  pacienteId: '',
  usuarioId: '',
  motivo: '',
  observations: '',
};

const AppointmentModal = ({ isOpen, onClose, onSave, slotInfo, eventToEdit, isSaving, patients, users }) => {
  const [formData, setFormData] = useState(emptyForm);
  const modalRef = useModalInteraction(isOpen, onClose, isSaving);

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        // Modo Editar: Cargamos los datos de la cita existente
        setFormData({
          id: eventToEdit.id,
          pacienteId: eventToEdit.pacienteId || '',
          usuarioId: eventToEdit.usuarioId || '',
          motivo: eventToEdit.motivo || '',
          observations: eventToEdit.observations || '',
        });
      } else {
        // Modo Crear: Reseteamos el formulario
        setFormData(emptyForm);
      }
    }
  }, [isOpen, eventToEdit]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pacienteId || !formData.usuarioId || !formData.motivo) {
      toast.error('Paciente, Odontólogo y Motivo son obligatorios.');
      return;
    }

    const start = eventToEdit?.start || slotInfo.start;
    const end = eventToEdit?.end || slotInfo.end;

    // Construimos el payload exacto que la API espera
    const payload = {
      pacienteId: formData.pacienteId,
      usuarioId: formData.usuarioId,
      motivo: formData.motivo,
      observaciones: formData.observaciones,
      fechaHora: start.toISOString(),
      duracionMinutos: differenceInMinutes(end, start),
      // Los campos appointmentDate y startTime se pueden derivar en el backend desde fechaHora si es necesario
    };

    // Encontramos los nombres para el feedback visual
    const patientName = patients.find(p => p.id === formData.pacienteId)?.nombreCompleto || '';
    const userName = users.find(u => u.id === formData.usuarioId)?.nombre || '';

    onSave({ id: formData.id, ...payload });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{eventToEdit ? 'Editar Cita' : 'Crear Nueva Cita'}</h2>
          <button onClick={onClose} disabled={isSaving} className="text-gray-500 hover:text-gray-800 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="pacienteId" className="block text-sm font-medium text-gray-700">Paciente</label>
              <select id="pacienteId" value={formData.pacienteId} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="" disabled>Seleccione un paciente</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.nombreCompleto}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="usuarioId" className="block text-sm font-medium text-gray-700">Odontólogo</label>
              <select id="usuarioId" value={formData.usuarioId} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="" disabled>Seleccione un odontólogo</option>
                {users.map(u => <option key={u.id} value={u.id}>{`${u.nombre} ${u.apellido}`}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-700">Motivo de la Cita</label>
              <input type="text" id="motivo" value={formData.motivo} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea id="observations" value={formData.observations || ''} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-blue-600 disabled:bg-gray-400">
              {isSaving ? 'Guardando...' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;