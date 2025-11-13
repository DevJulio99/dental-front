import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Odontogram from '../../components/Odontogram/Odontogram';

// Datos de ejemplo. En una aplicación real, esto vendría de una llamada a la API
// usando el `patientId` de la URL.
const patientData = {
  id: 1,
  fullName: 'Juan Pérez García',
  dni: '12345678A',
  phone: '600 11 22 33',
  email: 'juan.perez@example.com',
  birthDate: '1985-05-20',
};

const PatientDetail = () => {
  const { patientId } = useParams();

  // Aquí harías una llamada a la API: const { data: patient, isLoading } = useApi(`/patients/${patientId}`);
  // Por ahora, usamos los datos de ejemplo.
  const patient = patientData;

  return (
    <div>
      <Link to="/pacientes" className="text-primary hover:underline mb-4 inline-block">&larr; Volver a la lista de pacientes</Link>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{patient.fullName}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
          <p><strong className="text-gray-600">DNI:</strong> {patient.dni}</p>
          <p><strong className="text-gray-600">Teléfono:</strong> {patient.phone}</p>
          <p><strong className="text-gray-600">Email:</strong> {patient.email}</p>
          <p><strong className="text-gray-600">Fecha de Nacimiento:</strong> {patient.birthDate}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Odontograma</h2>
        <Odontogram patientId={patient.id} />
      </div>
    </div>
  );
};

export default PatientDetail;