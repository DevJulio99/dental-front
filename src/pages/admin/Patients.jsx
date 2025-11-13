import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PatientModal from '../../components/admin/PatientModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useApi } from '../../hooks/useApi';
// Importamos los SVGs como componentes de React para poder estilizarlos
import { ReactComponent as FileUserIcon } from '../../assets/icons/ic-file-user.svg';
import { ReactComponent as EditIcon } from '../../assets/icons/ic-edit.svg';
import { ReactComponent as TrashIcon } from '../../assets/icons/ic-delete.svg';
import toast from 'react-hot-toast';

// --- INICIO: Simulación de Backend ---
// Estos serían los datos que tu API devolvería desde la base de datos.
const samplePatientsData = [
  {
    id: 1,
    fullName: 'Juan Pérez García',
    dni: '12345678A',
    birthDate: '1985-05-20',
    email: 'juan.perez@example.com',
    phone: '600 11 22 33',
    nextAppointment: '25/07/2024 10:30',
  },
  {
    id: 2,
    fullName: 'María López Fernández',
    dni: '87654321B',
    birthDate: '1992-11-15',
    email: 'maria.lopez@example.com',
    phone: '611 22 33 44',
    nextAppointment: null,
  },
  {
    id: 3,
    fullName: 'Carlos Sánchez Ruiz',
    dni: '11223344C',
    birthDate: '1978-02-10',
    email: 'carlos.sanchez@example.com',
    phone: '622 33 44 55',
    nextAppointment: '28/07/2024 16:00',
  },
];

// Esta función simula una llamada a la API con un retardo.
const fakeApiCall = (data) => {
  return new Promise(resolve => setTimeout(() => resolve(data), 1000)); // Simula 1 segundo de espera
};
// --- FIN: Simulación de Backend ---

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const { isLoading, error, get, post, put, del } = useApi();
  // `null` = cerrado, `undefined` = crear, `{...}` = editar
  const [editingPatient, setEditingPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para el paciente que se va a eliminar
  const [patientToDelete, setPatientToDelete] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // En un caso real, la línea sería:
        // const data = await get('/patients');

        // Para la simulación, usamos nuestra función fakeApiCall
        const data = await fakeApiCall(samplePatientsData);
        setPatients(data);
      } catch (err) {
        // El hook `useApi` ya establece el mensaje de error.
        // No necesitamos hacer nada extra aquí, a menos que queramos un log.
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

  const handleSavePatient = async (patientData) => {
    try {
      if (patientData.id) {
        const updatedPatient = await put(`/patients/${patientData.id}`, patientData);
        setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        toast.success('Paciente actualizado con éxito.');
      } else {
        const newPatient = await post('/patients', patientData);
        setPatients([...patients, newPatient]);
        toast.success('Paciente creado con éxito.');
      }
      handleCloseModal();
    } catch (err) {
      toast.error(error || 'No se pudo guardar el paciente.');
    }
  };

  const handleDeletePatient = async () => {
    if (patientToDelete) {
      try {
        await del(`/patients/${patientToDelete.id}`);
        setPatients(patients.filter(p => p.id !== patientToDelete.id));
        toast.success('Paciente eliminado con éxito.');
        setPatientToDelete(null); // Cierra el modal de confirmación
      } catch (err) {
        toast.error(error || 'No se pudo eliminar el paciente.');
      }
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Pacientes</h1>
        <button onClick={handleOpenCreateModal} className="flex items-center px-4 py-2 font-bold text-white transition-colors duration-200 transform rounded-md bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Agregar Paciente
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Nombre Completo</th>
              <th scope="col" className="px-6 py-3">DNI</th>
              <th scope="col" className="px-6 py-3">Teléfono</th>
              <th scope="col" className="px-6 py-3">Próxima Cita</th>
              <th scope="col" className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan="5" className="text-center p-4">Cargando...</td></tr>}
            {error && !isLoading && <tr><td colSpan="5" className="text-center p-4 text-red-500">{error}</td></tr>}
            {!isLoading && patients.map((patient) => (
              <tr key={patient.id} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {patient.fullName}
                </th>
                <td className="px-6 py-4">{patient.dni}</td>
                <td className="px-6 py-4">{patient.phone}</td>
                <td className="px-6 py-4">
                  {patient.nextAppointment ? patient.nextAppointment : <span className="text-gray-400">Ninguna</span>}
                </td>
                <td className="px-6 py-4 space-x-2 text-right">
                  <Link to={`/pacientes/${patient.id}`} className="inline-flex items-center p-2 text-sm font-medium text-center text-white rounded-lg bg-primary hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300" title="Ver Ficha">
                    <FileUserIcon className="w-4 h-4 text-white" />
                  </Link>
                  <button onClick={() => handleOpenEditModal(patient)} className="inline-flex items-center p-2 text-sm font-medium text-center text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300" title="Editar">
                    <EditIcon className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={() => handleOpenDeleteModal(patient)} className="inline-flex items-center p-2 text-sm font-medium text-center text-white rounded-lg bg-error hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300" title="Eliminar">
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
      />

      <ConfirmationModal
        isOpen={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        onConfirm={handleDeletePatient}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar a ${patientToDelete?.fullName}? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default Patients;