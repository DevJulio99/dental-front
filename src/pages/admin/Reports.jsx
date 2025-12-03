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
        backgroundColor: 'rgba(74, 144, 226, 0.6)', // primary-500
        borderColor: 'rgba(58, 123, 200, 1)', // primary-600
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
          'rgba(245, 158, 11, 0.6)', // warning-500
          'rgba(74, 144, 226, 0.6)', // primary-500
          'rgba(16, 185, 129, 0.6)', // success-500
          'rgba(239, 68, 68, 0.6)',  // error-500
        ],
        borderColor: [
          'rgba(217, 119, 6, 1)',   // warning-600
          'rgba(58, 123, 200, 1)',     // primary-600
          'rgba(5, 150, 105, 1)',     // success-600
          'rgba(220, 38, 38, 1)',     // error-600
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
        backgroundColor: 'rgba(74, 144, 226, 0.6)', // primary-500
        borderColor: 'rgba(58, 123, 200, 1)', // primary-600
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reportes Básicos</h1>
      
      {/* Fila de Tarjetas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-soft border-l-4 border-primary-500">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Total de Pacientes</p>
          <p className="text-3xl font-bold text-gray-900">{reportData?.totalPacientes?.total || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-soft border-l-4 border-warning-500">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Citas Pendientes</p>
          <p className="text-3xl font-bold text-warning-600">{reportData?.citas?.citasPendientes || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-soft border-l-4 border-success-500">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Citas Completadas</p>
          <p className="text-3xl font-bold text-success-600">{reportData?.citas?.citasCompletadas || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-soft border-l-4 border-primary-600">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Tratamiento Principal</p>
          <p className="text-xl font-bold text-gray-900 truncate">{reportData?.tratamientos?.tratamientosMasComunes[0]?.nombre || 'N/A'}</p>
        </div>
      </div>

      {/* Fila de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-soft">
          <div className="h-80">
            <Bar 
              options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Tratamientos Más Comunes' } } }} 
              data={treatmentsChartData} 
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-soft">
          <div className="h-80">
            <Doughnut 
              options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Distribución de Citas' } } }} 
              data={appointmentsChartData} 
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-soft lg:col-span-2">
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