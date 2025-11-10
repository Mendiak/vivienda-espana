import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, BarChart } from 'lucide-react'; // Import a Lucide icon

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-100 p-5 h-screen fixed left-0 top-0 shadow-lg">
      <h2 className="text-lg font-semibold mb-5 text-gray-800">Gráficos Disponibles</h2>
      <nav>
        <ul>
          <li>
            <NavLink 
              to="/charts/property-value" 
              className={({ isActive }) => 
                `flex items-center p-3 rounded-lg mb-2 transition-colors duration-200 
                ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`
              }
            >
              <Home className="mr-3 h-5 w-5" /> {/* Lucide icon */}
              Valor Acumulado de Vivienda
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/charts/housing-market-analysis" 
              className={({ isActive }) => 
                `flex items-center p-3 rounded-lg mb-2 transition-colors duration-200 
                ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`
              }
            >
              <BarChart className="mr-3 h-5 w-5" /> {/* Lucide icon */}
              Mercado Inmobiliario Provincial
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/charts/tourist-housing-percentage" 
              className={({ isActive }) => 
                `flex items-center p-3 rounded-lg mb-2 transition-colors duration-200 
                ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`
              }
            >
              <BarChart className="mr-3 h-5 w-5" /> {/* Lucide icon */}
              Número de Viviendas Turísticas por Provincia
            </NavLink>
          </li>
          {/* Add more links here for new charts */}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
