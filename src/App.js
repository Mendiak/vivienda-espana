import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PropertyValueChart from './charts/PropertyValueChart';
import ProvincialMarketChart from './charts/ProvincialMarketChart';
import TouristHousingChart from './charts/TouristHousingChart';

// A generic component to render a chart with its title and description
const ChartPage = ({ chartComponent, title, description }) => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <header className="bg-white shadow-sm p-6 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </header>
    <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
      {chartComponent}
    </main>
  </div>
);

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6"> {/* ml-64 to offset the fixed sidebar width */}
        <Routes>
          <Route path="/" element={<Navigate to="/charts/property-value" replace />} />
          <Route 
            path="/charts/property-value" 
            element={
              <ChartPage
                chartComponent={<PropertyValueChart />}
                title="La Escalada Incesante del Precio de la Vivienda en España"
                description="Un análisis de la crisis habitacional a través del Índice de Precios de Vivienda (IPV)"
              />
            } 
          />
          <Route 
            path="/charts/housing-market-analysis" 
            element={
              <ChartPage
                chartComponent={<ProvincialMarketChart />}
                title="Mercado Inmobiliario por Provincia 2024"
                description="Análisis cruzado: Precio vs Densidad de Transacciones"
              />
            } 
          />
          <Route 
            path="/charts/tourist-housing-percentage" 
            element={
              <ChartPage
                chartComponent={<TouristHousingChart />}
                title="Número de Viviendas Turísticas por Provincia"
                description="Análisis del número de viviendas turísticas por provincia en España."
              />
            } 
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
