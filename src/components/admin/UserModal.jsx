import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useModalInteraction } from '../../hooks/useModalInteraction';

const emptyUserForm = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  rol: 'Odontologo', // Rol por defecto
};

const roleOptions = ['Admin', 'Odontologo', 'Asistente', 'SuperAdmin'];

const baseUserSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido.').regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/, 'El nombre solo puede contener letras y espacios.'),
  apellido: z.string().min(1, 'El apellido es requerido.').regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/, 'El apellido solo puede contener letras y espacios.'),
  email: z.string().min(1, 'El email es requerido.').email('El formato del correo no es válido.'),
  rol: z.enum(roleOptions, { required_error: 'El rol es requerido.' }),
});

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(3, 'La contraseña debe tener al menos 3 caracteres.'),
});

const updateUserSchema = baseUserSchema.extend({
  password: z.string().optional(),
});

const UserModal = ({ isOpen, onClose, userToEdit, onSave, isSaving, loggedInUser, onOpenChangePassword }) => {
  const modalRef = useModalInteraction(isOpen, onClose, isSaving);
  const isEditing = !!userToEdit;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: emptyUserForm,
  });

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        reset({
          nombre: userToEdit.nombre || '',
          apellido: userToEdit.apellido || '',
          email: userToEdit.email || '',
          password: '',
          rol: userToEdit.rol || 'Odontologo',
        });
      } else {
        reset(emptyUserForm);
      }
    }
  }, [isOpen, userToEdit, reset]);

  if (!isOpen) {
    return null;
  }

  const onFormSubmit = (data) => {
    const payload = { ...data };
    if (isEditing) {
      delete payload.password;
    }
    onSave(userToEdit?.id, payload);
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</h2>
          <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="nombre" className="block text-sm font-medium text-gray-800">Nombres</label><input type="text" id="nombre" {...register('nombre')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /><p className="mt-1 text-sm text-red-600">{errors.nombre?.message}</p></div>
              <div><label htmlFor="apellido" className="block text-sm font-medium text-gray-800">Apellidos</label><input type="text" id="apellido" {...register('apellido')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /><p className="mt-1 text-sm text-red-600">{errors.apellido?.message}</p></div>
            </div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-800">Email</label><input type="email" id="email" {...register('email')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /><p className="mt-1 text-sm text-red-600">{errors.email?.message}</p></div>
            {!isEditing && (
              <div><label htmlFor="password" className="block text-sm font-medium text-gray-800">Contraseña</label><input type="password" id="password" {...register('password')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /><p className="mt-1 text-sm text-red-600">{errors.password?.message}</p></div>
            )}
            <div><label htmlFor="rol" className="block text-sm font-medium text-gray-800">Rol</label><select id="rol" {...register('rol')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"><option disabled>Seleccione un rol</option>{roleOptions.map(role => (<option key={role} value={role}>{role}</option>))}</select><p className="mt-1 text-sm text-red-600">{errors.rol?.message}</p></div>
          </div>
          <div className="flex justify-between items-center pt-4 mt-6 border-t">
            <div>
              {isEditing && userToEdit?.id !== loggedInUser?.id && (
                <button
                  type="button"
                  onClick={() => onOpenChangePassword(userToEdit)}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none"
                >
                  Cambiar Contraseña
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-100 transition-all duration-200">Cancelar</button>
              <button type="submit" disabled={isSaving} className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md">
                {isSaving ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;