import React, { useState, useRef, useEffect } from 'react';
import molarImage from '../../assets/images/molar.png';
import premolarImage from '../../assets/images/premolar.PNG';
import caninoImage from '../../assets/images/canino.PNG';
import incisivoImage from '../../assets/images/incisivo.PNG';

// Mapeo completo de estados con colores y estilos mejorados
const statusConfig = {
  sano: { 
    fill: 'white', 
    stroke: '#9ca3af', 
    className: 'fill-white stroke-gray-400',
    label: 'Sano',
    icon: '✓'
  },
  curado: { 
    fill: '#3b82f6', 
    stroke: '#1e40af', 
    className: 'fill-blue-500 stroke-blue-700',
    label: 'Curado',
    icon: '✓'
  },
  pendiente: { 
    fill: '#facc15', 
    stroke: '#ca8a04', 
    className: 'fill-yellow-400 stroke-yellow-600',
    label: 'Pendiente',
    icon: '⏱'
  },
  caries: { 
    fill: '#a855f7', 
    stroke: '#7e22ce', 
    className: 'fill-purple-500 stroke-purple-700',
    label: 'Caries',
    icon: '⚠'
  },
  extraido: { 
    fill: '#ef4444', 
    stroke: '#b91c1c', 
    className: 'fill-red-500 stroke-red-700',
    label: 'Extraído',
    icon: '✕'
  },
  endodoncia: { 
    fill: '#06b6d4', 
    stroke: '#0891b2', 
    className: 'fill-cyan-500 stroke-cyan-600',
    label: 'Endodoncia',
    icon: '○'
  },
  corona: { 
    fill: '#f59e0b', 
    stroke: '#d97706', 
    className: 'fill-amber-500 stroke-amber-600',
    label: 'Corona',
    icon: '◼'
  },
  implante: { 
    fill: '#10b981', 
    stroke: '#059669', 
    className: 'fill-emerald-500 stroke-emerald-600',
    label: 'Implante',
    icon: '●'
  },
  fracturado: { 
    fill: '#f97316', 
    stroke: '#ea580c', 
    className: 'fill-orange-500 stroke-orange-600',
    label: 'Fracturado',
    icon: '⚡'
  },
  a_extraer: { 
    fill: '#dc2626', 
    stroke: '#991b1b', 
    className: 'fill-red-600 stroke-red-800',
    label: 'A Extraer',
    icon: '⚠'
  },
  puente: { 
    fill: '#8b5cf6', 
    stroke: '#6d28d9', 
    className: 'fill-violet-500 stroke-violet-600',
    label: 'Puente',
    icon: '═'
  },
};

// Función para determinar el tipo de diente según su número
const getToothType = (number) => {
  const lastDigit = number % 10;
  if (lastDigit === 1 || lastDigit === 2) return 'incisivo'; // Central y lateral
  if (lastDigit === 3) return 'canino';
  if (lastDigit === 4 || lastDigit === 5) return 'premolar';
  return 'molar'; // 6, 7, 8
};

const getToothName = (number) => {
  const quadrant = Math.floor(number / 10);
  const position = number % 10;

  let type = '';
  switch (position) {
    case 1: type = 'Incisivo Central'; break;
    case 2: type = 'Incisivo Lateral'; break;
    case 3: type = 'Canino'; break;
    case 4: type = 'Primer Premolar'; break;
    case 5: type = 'Segundo Premolar'; break;
    case 6: type = 'Primer Molar'; break;
    case 7: type = 'Segundo Molar'; break;
    case 8: type = 'Tercer Molar'; break;
    default: type = 'Diente';
  }

  let location = '';
  switch (quadrant) {
    case 1: location = 'Superior Derecho'; break;
    case 2: location = 'Superior Izquierdo'; break;
    case 3: location = 'Inferior Izquierdo'; break;
    case 4: location = 'Inferior Derecho'; break;
    default: location = '';
  }

  return `${type} ${location}`;
};

// Componente para renderizar diente realista
const RealisticTooth = ({ status, toothType }) => {
  const isMolar = toothType === 'molar';
  const isPremolar = toothType === 'premolar';
  const isCanino = toothType === 'canino';
  const isIncisivo = toothType === 'incisivo';

  // Base del diente - forma anatómica
  const getToothShape = () => {
    if (isMolar) {
      // Molar: forma cuadrada/rectangular con cúspides
      return (
        <image 
          href={molarImage} 
          x="10" y="10" 
          width="80" height="80" 
          preserveAspectRatio="xMidYMid meet" 
        />
      );
    } else if (isPremolar) {
      // Premolar: forma más redondeada
      return ( 
        <image 
          href={premolarImage} 
          x="10" y="10" 
          width="80" height="80" 
          preserveAspectRatio="xMidYMid meet" 
        />
      );
    } else if (isCanino) {
      // Canino: forma puntiaguda
      return (
        <image 
          href={caninoImage} 
          x="10" y="10" 
          width="80" height="80" 
          preserveAspectRatio="xMidYMid meet" 
        />
      );
    } else {
      // Incisivo: forma rectangular con borde cortante
      return (
        <image 
          href={incisivoImage} 
          x="10" y="10" 
          width="80" height="80" 
          preserveAspectRatio="xMidYMid meet" 
        />
      );
    }
  };

  // Renderizar estados de forma realista
  const renderStatus = () => {
    switch(status) {
      case 'sano':
        return (
          <g>
            {/* Brillo sano */}
            <ellipse cx="45" cy="30" rx="8" ry="12" className="fill-white opacity-60" />
            <ellipse cx="55" cy="35" rx="6" ry="8" className="fill-white opacity-40" />
          </g>
        );
      
      case 'caries':
        return (
          <g>
            {/* Caries como manchas oscuras/marrones */}
            <ellipse cx="40" cy="35" rx="6" ry="8" className="fill-[#8b4513] opacity-80" />
            <ellipse cx="60" cy="40" rx="5" ry="6" className="fill-[#654321] opacity-70" />
            <ellipse cx="50" cy="45" rx="4" ry="5" className="fill-[#8b4513] opacity-75" />
            {/* Borde de la caries */}
            <ellipse cx="40" cy="35" rx="6" ry="8" className="fill-none stroke-[#654321]" strokeWidth="1" opacity="0.5" />
          </g>
        );
      
      case 'curado':
        return (
          <g>
            {/* Empaste azul/plata */}
            <ellipse cx="50" cy="40" rx="12" ry="15" className="fill-[#3b82f6] opacity-70" />
            <ellipse cx="50" cy="40" rx="10" ry="13" className="fill-[#60a5fa] opacity-50" />
            {/* Líneas del empaste */}
            <line x1="42" y1="35" x2="58" y2="45" stroke="#1e40af" strokeWidth="1" opacity="0.6" />
            <line x1="45" y1="45" x2="55" y2="35" stroke="#1e40af" strokeWidth="1" opacity="0.6" />
          </g>
        );
      
      case 'corona':
        return (
          <g>
            {/* Corona dorada sobre el diente */}
            <path 
              d={isMolar 
                ? "M25,20 L30,15 L70,15 L75,20 L75,50 L70,55 L30,55 L25,50 Z"
                : "M30,20 Q50,12 70,20 L72,50 Q50,58 28,50 Z"
              } 
              className="fill-[#f59e0b] opacity-85" 
            />
            <path 
              d={isMolar 
                ? "M25,20 L30,15 L70,15 L75,20 L75,50 L70,55 L30,55 L25,50 Z"
                : "M30,20 Q50,12 70,20 L72,50 Q50,58 28,50 Z"
              } 
              className="fill-none stroke-[#d97706]" 
              strokeWidth="2" 
            />
            {/* Brillo de la corona */}
            <ellipse cx="45" cy="30" rx="6" ry="8" className="fill-white opacity-50" />
          </g>
        );
      
      case 'implante':
        return (
          <g>
            {/* Base del implante (tornillo) */}
            <rect x="40" y="55" width="20" height="12" rx="2" className="fill-[#10b981] opacity-90" />
            {/* Cuerpo del implante */}
            <rect x="42" y="50" width="16" height="8" rx="1" className="fill-[#059669] opacity-80" />
            {/* Rosca del implante */}
            <line x1="45" y1="58" x2="55" y2="58" stroke="#047857" strokeWidth="1.5" />
            <line x1="45" y1="62" x2="55" y2="62" stroke="#047857" strokeWidth="1.5" />
            {/* Corona sobre implante */}
            <ellipse cx="50" cy="40" rx="12" ry="15" className="fill-[#10b981] opacity-60" />
          </g>
        );
      
      case 'endodoncia':
        return (
          <g>
            {/* Punto de endodoncia en el centro */}
            <circle cx="50" cy="40" r="6" className="fill-[#06b6d4] opacity-90" />
            <circle cx="50" cy="40" r="4" className="fill-[#0891b2]" />
            <circle cx="50" cy="40" r="2" className="fill-white" />
            {/* Líneas de acceso */}
            <line x1="50" y1="30" x2="50" y2="40" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      
      case 'fracturado':
        return (
          <g>
            {/* Líneas de fractura */}
            <line x1="30" y1="25" x2="70" y2="55" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
            <line x1="35" y1="30" x2="65" y2="50" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
            {/* Fragmentos */}
            <path d="M30,25 L50,40 L35,45 Z" className="fill-[#f97316] opacity-30" />
            <path d="M50,40 L70,55 L65,50 Z" className="fill-[#f97316] opacity-30" />
          </g>
        );
      
      case 'pendiente':
        return (
          <g>
            {/* Indicador amarillo de pendiente */}
            <ellipse cx="50" cy="40" rx="15" ry="18" className="fill-[#facc15] opacity-50" />
            <ellipse cx="50" cy="40" rx="12" ry="15" className="fill-[#fde047] opacity-60" />
            {/* Signo de interrogación */}
            <text x="50" y="45" textAnchor="middle" className="fill-[#ca8a04] text-[20px] font-bold">?</text>
          </g>
        );
      
      case 'a_extraer':
        return (
          <g>
            {/* Indicador rojo de urgencia */}
            <ellipse cx="50" cy="40" rx="18" ry="22" className="fill-[#dc2626] opacity-40" />
            {/* X roja */}
            <line x1="35" y1="30" x2="65" y2="50" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
            <line x1="35" y1="50" x2="65" y2="30" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      
      case 'puente':
        return (
          <g>
            {/* Conexión del puente */}
            <rect x="20" y="45" width="60" height="8" rx="4" className="fill-[#8b5cf6] opacity-70" />
            <rect x="20" y="45" width="60" height="8" rx="4" className="fill-none stroke-[#6d28d9]" strokeWidth="2" />
            {/* Puntos de conexión */}
            <circle cx="25" cy="49" r="3" className="fill-[#6d28d9]" />
            <circle cx="50" cy="49" r="3" className="fill-[#6d28d9]" />
            <circle cx="75" cy="49" r="3" className="fill-[#6d28d9]" />
          </g>
        );
      
      default:
        return null;
    }
  };

  return (
    <g>
      {/* Sombra base */}
      <defs>
        <filter id="tooth-shadow">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.2"/>
        </filter>
      </defs>
      
      {/* Forma base del diente con sombra */}
      {getToothShape()}
      
      {/* Estado del diente */}
      {renderStatus()}
    </g>
  );
};

const Tooth = ({ number, status, onClick, onDoubleClick, hasHistory = false, className = '', isSelected = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = statusConfig[status] || statusConfig.sano;
  const baseClass = "cursor-pointer transition-all duration-300 ease-in-out";
  const toothName = getToothName(number);
  const toothType = getToothType(number);
  const isSuperior = number < 30;

  // Manejar clic simple y doble clic
  const clickTimeoutRef = useRef(null);
  
  const handleClick = (e) => {
    if (e.detail === 1) {
      // Clic simple - esperar un poco para ver si hay doble clic
      clickTimeoutRef.current = setTimeout(() => {
        if (onClick) onClick();
      }, 250);
    } else if (e.detail === 2) {
      // Doble clic - cancelar el clic simple
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      if (onDoubleClick) onDoubleClick();
    }
  };

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex flex-col items-center group relative ${className}`}
      title={`${toothName} (${number}) - ${config.label}${hasHistory ? ' (Tiene historial - Doble clic para ver)' : ''}`}
    >
      {/* Tooltip mejorado */}
      {isHovered && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
            <div className="font-bold text-blue-300">{toothName} ({number})</div>
            <div className="text-gray-200 mt-0.5">Estado: {config.label}</div>
            {hasHistory && (
              <div className="text-blue-300 mt-1">📋 Ver historial</div>
            )}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}

      <div className={`relative ${baseClass} ${isSelected ? 'ring-4 ring-blue-400 ring-offset-2 rounded-lg' : ''}`}>
        <svg 
          width="60" 
          height="75" 
          viewBox="0 0 100 100" 
          className={`transition-transform duration-200 ${isHovered ? 'scale-110' : ''} ${isSelected ? 'drop-shadow-lg' : ''}`}
          style={{ filter: isHovered || isSelected ? 'url(#tooth-shadow)' : 'none' }}
        >
          <g transform={isSuperior ? "translate(0, 100) scale(1, -1)" : ""}>
            {status === 'extraido' ? (
              <g>
                <path 
                  d="M20,60 Q50,70 80,60 Q50,75 20,60" 
                  className="fill-[#fecdd3] stroke-[#fda4af]" 
                  strokeWidth="2" 
                  opacity="0.6"
                />
                <line x1="30" y1="30" x2="70" y2="70" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
                <line x1="30" y1="70" x2="70" y2="30" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
                <ellipse cx="50" cy="65" rx="25" ry="8" className="fill-black opacity-10" />
              </g>
            ) : (
              <RealisticTooth status={status} toothType={toothType} />
            )}
          </g>
        </svg>
        
        {/* Indicador de historial mejorado */}
        {hasHistory && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">H</span>
          </div>
        )}
      </div>
      
      {/* Número del diente con mejor estilo */}
      <span className={`mt-2 text-xs font-bold transition-colors ${
        isHovered ? 'text-blue-check scale-110' : 'text-gray-700'
      }`}>
        {number}
      </span>
    </div>
  );
};

export default Tooth;