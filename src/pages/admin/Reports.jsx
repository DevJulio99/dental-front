import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { configureCharts } from '../../config/chartjs-config';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';

// Registramos los componentes de Chart.js
configureCharts();

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const { isLoading, error, get } = useApi();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const [citas, tratamientos, totalPacientes, pacientesPorMes] = await Promise.all([
          get('/Reportes/citas'),
          get('/Reportes/tratamientos'),
          get('/Reportes/pacientes/total'),
          get(`/Reportes/pacientes/por-mes?año=${currentYear}`)
        ]);

        setReportData({
          citas,
          tratamientos,
          totalPacientes,
          pacientesPorMes
        });

      } catch (err) {
        toast.error('No se pudieron cargar los reportes.');
        console.error("Error al cargar reportes:", err);
      }
    };
    fetchReports();
  }, [get]);

  const treatmentsChartData = {
    labels: reportData?.tratamientos?.tratamientosMasComunes.map(t => t.nombre) || [],
    datasets: [
      {
        label: 'Número de Tratamientos',
        data: reportData?.tratamientos?.tratamientosMasComunes.map(t => t.cantidad) || [],
        backgroundColor: 'rgba(52, 152, 219, 0.6)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1,
      },
    ],
  };

  const appointmentsChartData = {
    labels: ['Pendientes', 'Confirmadas', 'Completadas', 'Canceladas'],
    datasets: [
      {
        label: 'Estado de Citas',
        data: [
          reportData?.citas?.citasPendientes || 0,
          reportData?.citas?.citasConfirmadas || 0,
          reportData?.citas?.citasCompletadas || 0,
          reportData?.citas?.citasCanceladas || 0,
        ],
        backgroundColor: [
          'rgba(241, 196, 15, 0.6)', // Amarillo para pendientes
          'rgba(52, 152, 219, 0.6)', // Azul para confirmadas
          'rgba(46, 204, 113, 0.6)', // Verde para completadas
          'rgba(231, 76, 60, 0.6)',   // Rojo para canceladas
        ],
        borderColor: [
          'rgba(241, 196, 15, 1)',
          'rgba(52, 152, 219, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(231, 76, 60, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const newPatientsChartData = {
    labels: reportData?.pacientesPorMes ? Object.keys(reportData.pacientesPorMes).map(m => m.charAt(0).toUpperCase() + m.slice(1)) : [],
    datasets: [
      {
        label: `Nuevos Pacientes en ${new Date().getFullYear()}`,
        data: reportData?.pacientesPorMes ? Object.values(reportData.pacientesPorMes) : [],
        backgroundColor: 'rgba(155, 89, 182, 0.6)',
        borderColor: 'rgba(155, 89, 182, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          size: 16,
        },
      },
    },
  };

  if (isLoading && !reportData) {
    return <LoadingSpinner />;
  }

  if (error && !reportData) {
    return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-50 mb-6">Reportes Básicos</h1>
      
      {/* Fila de Tarjetas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-sm text-gray-500">Total de Pacientes</p><p className="text-3xl font-bold">{reportData?.totalPacientes?.total || 0}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-sm text-gray-500">Citas Pendientes</p><p className="text-3xl font-bold">{reportData?.citas?.citasPendientes || 0}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-sm text-gray-500">Citas Completadas</p><p className="text-3xl font-bold">{reportData?.citas?.citasCompletadas || 0}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-sm text-gray-500">Tratamiento Principal</p><p className="text-xl font-bold truncate">{reportData?.tratamientos?.tratamientosMasComunes[0]?.nombre || 'N/A'}</p></div>
      </div>

      {/* Fila de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="h-80">
            <Bar 
              options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Tratamientos Más Comunes' } } }} 
              data={treatmentsChartData} 
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="h-80">
            <Doughnut 
              options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Distribución de Citas' } } }} 
              data={appointmentsChartData} 
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <div className="h-80">
            <Bar 
              options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Nuevos Pacientes por Mes' } } }} 
              data={newPatientsChartData} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;