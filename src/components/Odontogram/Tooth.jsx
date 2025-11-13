import React from 'react';

const statusClasses = {
  sano: 'fill-white stroke-gray-400',
  curado: 'fill-blue-500 stroke-blue-700',
  pendiente: 'fill-yellow-400 stroke-yellow-600',
  caries: 'fill-purple-500 stroke-purple-700',
  extraido: 'fill-red-500 stroke-red-700',
};

const Tooth = ({ number, status, onClick }) => {
  // Clases base para el SVG
  const baseClass = "cursor-pointer transition-all duration-200 hover:scale-110";
  // Clases de color según el estado
  const statusClass = statusClasses[status] || statusClasses.sano;

  return (
    <div onClick={onClick} className="flex flex-col items-center">
      <svg width="30" height="30" viewBox="0 0 100 100" className={`${baseClass} ${statusClass}`}>
        {status === 'extraido' ? (
          <g>
            <line x1="10" y1="10" x2="90" y2="90" strokeWidth="10" />
            <line x1="10" y1="90" x2="90" y2="10" strokeWidth="10" />
          </g>
        ) : (
          <path d="M20,30 Q50,10 80,30 L85,70 Q50,90 15,70 Z" strokeWidth="5" />
        )}
      </svg>
      <span className="mt-1 text-xs">{number}</span>
    </div>
  );
};

export default Tooth;