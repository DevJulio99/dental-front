import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useModalInteraction } from '../../hooks/useModalInteraction';
import { format } from 'date-fns';

const emptyPatientForm = {
  firstName: '',
  lastName: '',
  dniPasaporte: '',
  fechaNacimiento: '',
  telefono: '',
  email: '',
  direccion: '',
  genero: 'Masculino', // Valor por defecto
  alergias: '',
  observaciones: '',
};

const patientSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido.').regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/, 'El nombre solo puede contener letras y espacios.'),
  lastName: z.string().min(1, 'El apellido es requerido.').regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/, 'El apellido solo puede contener letras y espacios.'),
  dniPasaporte: z.string().min(8, 'Debe tener entre 8 y 12 dígitos.').max(12, 'Debe tener entre 8 y 12 dígitos.').regex(/^[0-9]+$/, 'Solo se permiten números.'),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es requerida.')
    .refine(val => new Date(val) < new Date(), {
      message: 'La fecha no puede ser futura.',
    }).refine(val => new Date(val).getFullYear() >= 1900, {
      message: 'El año de nacimiento no es válido.',
    }),
  telefono: z.string().length(9, 'El teléfono debe tener 9 dígitos.').regex(/^[0-9]+$/, 'Solo se permiten números.'),
  email: z.string().min(1, 'El email es requerido.').email('El formato del correo no es válido.'),
  direccion: z.string().min(1, 'La dirección es requerida.').regex(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s.,#-]+$/, 'La dirección contiene caracteres no válidos.'),
  genero: z.enum(['Masculino', 'Femenino']),
  alergias: z.string().optional(),
  observaciones: z.string().optional(),
});

const PatientModal = ({ isOpen, onClose, patientToEdit, onSave, isSaving }) => {
  const modalRef = useModalInteraction(isOpen, onClose, isSaving);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: emptyPatientForm,
  });

  useEffect(() => {
    if (isOpen) {
      if (patientToEdit) {
        reset({
          ...patientToEdit,
          fechaNacimiento: patientToEdit.fechaNacimiento ? format(new Date(patientToEdit.fechaNacimiento), 'yyyy-MM-dd') : '',
          alergias: patientToEdit.alergias || '',
          observaciones: patientToEdit.observaciones || '',
        });
      } else {
        reset(emptyPatientForm);
      }
    }
  }, [isOpen, patientToEdit, reset]);

  if (!isOpen) {
    return null;
  }

  const onFormSubmit = (data) => {
    const payload = {
      ...data,
      nombreCompleto: `${data.firstName} ${data.lastName}`.trim(),
      fechaNacimiento: data.fechaNacimiento 
        ? new Date(data.fechaNacimiento).toISOString() 
        : null,
    };

    onSave(patientToEdit?.id, payload);
  };

  const isEditing = !!patientToEdit;

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Paciente' : 'Agregar Nuevo Paciente'}</h2>
          <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded">&times;</button>
        </div>
        <form id="patient-form" onSubmit={handleSubmit(onFormSubmit)} className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label htmlFor="firstName" className="block text-sm font-medium text-gray-800">Nombres</label><input type="text" id="firstName" {...register('firstName')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /><p className="mt-1 text-sm text-red-600">{errors.firstName?.message}</p></div>
              <div><label htmlFor="lastName" className="block text-sm font-medium text-gray-800">Apellidos</label><input type="text" id="lastName" {...register('lastName')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /><p className="mt-1 text-sm text-red-600">{errors.lastName?.message}</p></div>
            </div>
            <div><label htmlFor="dniPasaporte" className="block text-sm font-medium text-gray-800">DNI / Pasaporte</label><input type="text" id="dniPasaporte" {...register('dniPasaporte')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /><p className="mt-1 text-sm text-red-600">{errors.dniPasaporte?.message}</p></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-800">Fecha de Nacimiento</label><input type="date" id="fechaNacimiento" {...register('fechaNacimiento')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /><p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento?.message}</p></div>
              <div><label htmlFor="genero" className="block text-sm font-medium text-gray-800">Género</label><select id="genero" {...register('genero')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select><p className="mt-1 text-sm text-red-600">{errors.genero?.message}</p></div>
            </div>
            <div><label htmlFor="telefono" className="block text-sm font-medium text-gray-800">Teléfono</label><input type="tel" id="telefono" {...register('telefono')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /><p className="mt-1 text-sm text-red-600">{errors.telefono?.message}</p></div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-800">Email</label><input type="email" id="email" {...register('email')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/><p className="mt-1 text-sm text-red-600">{errors.email?.message}</p></div>
            <div><label htmlFor="direccion" className="block text-sm font-medium text-gray-800">Dirección</label><input type="text" id="direccion" {...register('direccion')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/><p className="mt-1 text-sm text-red-600">{errors.direccion?.message}</p></div>
            <div><label htmlFor="alergias" className="block text-sm font-medium text-gray-800">Alergias</label><textarea id="alergias" {...register('alergias')} rows="2" className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea></div>
            <div><label htmlFor="observaciones" className="block text-sm font-medium text-gray-800">Observaciones</label><textarea id="observaciones" {...register('observaciones')} rows="2" className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea></div>
          </div>
        </form>
        <div className="flex justify-end p-6 space-x-2 border-t">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
            <button type="submit" form="patient-form" disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-blue-50 rounded-md bg-primary hover:bg-hover-btn-primary hover:text-white disabled:bg-gray-400">
              {isSaving ? 'Guardando...' : 'Guardar Paciente'}
            </button>
          </div>
      </div>
    </div>
  );
};

export default PatientModal;
