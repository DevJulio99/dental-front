import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import Odontogram from '../../components/Odontogram/Odontogram';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PatientDetail = () => {
  const { patientId } = useParams();
  const { get, isLoading } = useApi();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  const loadPatient = async () => {
    try {
      const data = await get(`/Pacientes/${patientId}`);
      setPatient(data);
    } catch (err) {
      setError('Error al cargar los datos del paciente');
      toast.error('Error al cargar los datos del paciente');
      console.error(err);
    }
  };

  if (isLoading && !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 mb-4">{error || 'Paciente no encontrado'}</p>
        <Link to="/pacientes" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
          Volver a la lista de pacientes
        </Link>
      </div>
    );
  }

  const nombreCompleto = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Sin nombre';
  const fechaNacimiento = patient.fechaNacimiento 
    ? format(new Date(patient.fechaNacimiento), 'dd/MM/yyyy')
    : 'No especificada';

  return (
    <div>
      <Link to="/pacientes" className="text-primary hover:underline mb-4 inline-block">
        &larr; Volver a la lista de pacientes
      </Link>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{nombreCompleto}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
          <p>
            <strong className="text-gray-600">DNI/Pasaporte:</strong> {patient.dniPasaporte || 'No especificado'}
          </p>
          <p>
            <strong className="text-gray-600">Teléfono:</strong> {patient.telefono || 'No especificado'}
          </p>
          <p>
            <strong className="text-gray-600">Email:</strong> {patient.email || 'No especificado'}
          </p>
          <p>
            <strong className="text-gray-600">Fecha de Nacimiento:</strong> {fechaNacimiento}
          </p>
          {patient.direccion && (
            <p className="md:col-span-2">
              <strong className="text-gray-600">Dirección:</strong> {patient.direccion}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Odontograma</h2>
        <Odontogram patientId={patientId} />
      </div>
    </div>
  );
};

export default PatientDetail;