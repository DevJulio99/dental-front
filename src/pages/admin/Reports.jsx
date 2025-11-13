import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { configureCharts } from '../../config/chartjs-config';
// import UsersGroupIcon from '../../assets/icons/UsersGroupIcon';
// import CalendarDaysIcon from '../../assets/icons/CalendarDaysIcon';
// import WrenchScrewdriverIcon from '../../assets/icons/WrenchScrewdriverIcon';

// Registramos los componentes de Chart.js
configureCharts();

// Datos de ejemplo. En una aplicación real, esto vendría de la API.
const reportData = {
  patientsAttended: 124,
  pendingAppointments: 18,
  completedAppointments: 82,
  commonTreatments: [
    { name: 'Limpieza Dental', count: 45 },
    { name: 'Empaste', count: 22 },
    { name: 'Blanqueamiento', count: 15 },
  ],
};

const Reports = () => {
  const treatmentsChartData = {
    labels: reportData.commonTreatments.map(t => t.name),
    datasets: [
      {
        label: 'Número de Tratamientos',
        data: reportData.commonTreatments.map(t => t.count),
        backgroundColor: 'rgba(52, 152, 219, 0.6)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1,
      },
    ],
  };

  const appointmentsChartData = {
    labels: ['Citas Pendientes', 'Citas Completadas'],
    datasets: [
      {
        label: 'Estado de Citas',
        data: [reportData.pendingAppointments, reportData.completedAppointments],
        backgroundColor: [
          'rgba(241, 196, 15, 0.6)', // Amarillo para pendientes
          'rgba(46, 204, 113, 0.6)', // Verde para completadas
        ],
        borderColor: [
          'rgba(241, 196, 15, 1)',
          'rgba(46, 204, 113, 1)',
        ],
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reportes Básicos</h1>
      
      {/* Fila de Tarjetas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-sm text-gray-500">Pacientes Atendidos</p><p className="text-3xl font-bold">{reportData.patientsAttended}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-sm text-gray-500">Citas Pendientes</p><p className="text-3xl font-bold">{reportData.pendingAppointments}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-sm text-gray-500">Citas Completadas</p><p className="text-3xl font-bold">{reportData.completedAppointments}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-sm text-gray-500">Tratamiento Principal</p><p className="text-3xl font-bold">{reportData.commonTreatments[0].name}</p></div>
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
      </div>
    </div>
  );
};

export default Reports;