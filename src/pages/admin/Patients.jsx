import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PatientModal from '../../components/admin/PatientModal';
import { format } from 'date-fns';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useApi } from '../../hooks/useApi';
// Importamos los SVGs como componentes de React para poder estilizarlos
import { ReactComponent as FileUserIcon } from '../../assets/icons/ic-file-user.svg';
import { ReactComponent as EditIcon } from '../../assets/icons/ic-edit.svg';
import { ReactComponent as TrashIcon } from '../../assets/icons/ic-delete.svg';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const { isLoading, error, get, post, put, del } = useApi();
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState(null); // Estado de error solo para el listado
  // `null` = cerrado, `undefined` = crear, `{...}` = editar
  const [editingPatient, setEditingPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para el paciente que se va a eliminar
  const [patientToDelete, setPatientToDelete] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsListLoading(true);
        setListError(null); // Limpiamos el error de listado antes de cada petición
        // Llamada real a la API para obtener la lista de pacientes
        const data = await get('/Pacientes');
        console.log('data:', data);
        if (Array.isArray(data)) {
          setPatients(data);
        }
      } catch (err) { // El error de `get` se captura aquí
        setListError(err.message || 'No se pudo cargar la lista de pacientes.');
        // El hook `useApi` ya maneja el estado de error, que se muestra en la tabla.
        console.error("Error al obtener los pacientes:", err);
      } finally {
        setIsListLoading(false);
      }
    };
    fetchPatients();
  }, [get]);

  const handleOpenCreateModal = () => {
    setEditingPatient(undefined); // undefined para modo creación
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient) => {
    setEditingPatient(patient); // objeto paciente para modo edición
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleOpenDeleteModal = (patient) => {
    setPatientToDelete(patient);
  };

  const handleSavePatient = async (id, payload) => {
    try {
      if (id) {
        const updatedPatient = await put(`/Pacientes/${id}`, payload);
        setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        toast.success('Paciente actualizado con éxito.');
      } else {
        const newPatient = await post('/Pacientes', payload);
        setPatients([...patients, newPatient]);
        toast.success('Paciente creado con éxito.');
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar el paciente.');
    }
  };

  const handleDeletePatient = async () => {
    if (patientToDelete) {
      try {
        await del(`/Pacientes/${patientToDelete.id}`);
        setPatients(patients.filter(p => p.id !== patientToDelete.id));
        toast.success('Paciente eliminado con éxito.');
        setPatientToDelete(null); // Cierra el modal de confirmación
      } catch (err) {
        // Mostramos el error de eliminación solo en el toast
        toast.error(err.message || 'No se pudo eliminar el paciente.');
      }
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-50">Gestión de Pacientes</h1>
        <button onClick={handleOpenCreateModal} className="flex items-center px-4 py-2 font-bold text-white transition-colors duration-200 transform rounded-xl bg-button-primary hover:bg-hover-btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Agregar Paciente
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Nombre Completo</th>
              <th scope="col" className="px-6 py-3">DNI / Pasaporte</th>
              <th scope="col" className="px-6 py-3">Teléfono</th>
              <th scope="col" className="px-6 py-3">Próxima Cita</th>
              <th scope="col" className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isListLoading && <tr><td colSpan="5" className="text-center p-4"><LoadingSpinner /></td></tr>}
            {listError && !isListLoading && <tr><td colSpan="5" className="text-center p-4 text-red-500">{listError}</td></tr>}
            {!isListLoading && !listError && patients.map((patient) => (
              <tr key={patient.id} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {patient.nombreCompleto}
                </th>
                <td className="px-6 py-4">{patient.dniPasaporte}</td>
                <td className="px-6 py-4">{patient.telefono}</td>
                <td className="px-6 py-4">
                  {patient.fechaUltimaCita ? format(new Date(patient.fechaUltimaCita), 'dd/MM/yyyy HH:mm') : <span className="text-gray-400">Ninguna</span>}
                </td>
                <td className="px-6 py-4 space-x-2 text-right">
                  <Link to={`/pacientes/${patient.id}`} className="inline-flex items-center p-2 text-sm font-medium text-center text-white rounded-lg bg-button-primary hover:bg-hover-btn-primary focus:ring-4 focus:outline-none focus:ring-blue-300" title="Ver Ficha">
                    <FileUserIcon className="w-4 h-4 text-white" />
                  </Link>
                  <button onClick={() => handleOpenEditModal(patient)} className="inline-flex items-center p-2 text-sm font-medium text-center text-white bg-button-primary hover:bg-hover-btn-primary rounded-lg focus:ring-4 focus:outline-none focus:ring-yellow-300" title="Editar">
                    <EditIcon className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={() => handleOpenDeleteModal(patient)} className="inline-flex items-center p-2 text-sm font-medium text-center text-white rounded-lg bg-button-primary hover:bg-hover-btn-primary focus:ring-4 focus:outline-none focus:ring-red-300" title="Eliminar">
                    <TrashIcon className="w-4 h-4 text-white" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PatientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        patientToEdit={editingPatient}
        onSave={handleSavePatient}
        isSaving={isLoading}
      />

      <ConfirmationModal
        isOpen={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        onConfirm={handleDeletePatient}
        isConfirming={isLoading}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar a ${patientToDelete?.nombreCompleto}? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default Patients;