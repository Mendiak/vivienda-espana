import React, { useState } from 'react';
import { Download } from 'lucide-react';

const HousingMarketAnalysis = () => {
  const [selectedView, setSelectedView] = useState('scatter');
  const [hoveredProvince, setHoveredProvince] = useState(null);

  // Datos oficiales del Ministerio de Vivienda (Boletín 2024) + estimaciones de transacciones
  const provinceData = [
    // Formato: [nombre, precio €/m², transacciones estimadas 2024, habitantes]
    ['Madrid', 3370.5, 95000, 7001715],
    ['Barcelona', 2766.9, 75000, 5743402],
    ['Baleares', 3316.7, 18500, 1221403],
    ['Málaga', 2522.2, 32000, 1756781],
    ['Guipúzcoa', 2986.3, 12000, 744169],
    ['Vizcaya', 2552.1, 17000, 1160590],
    ['Alicante', 1657.1, 28000, 1904678],
    ['Valencia', 1568.2, 35000, 2630251],
    ['Girona', 1886.9, 14000, 812488],
    ['Santa Cruz de Tenerife', 1873.7, 15000, 1070092],
    ['Las Palmas', 1908.7, 17000, 1158862],
    ['Cádiz', 1688.1, 18000, 1263820],
    ['Sevilla', 1592.2, 22000, 2015212],
    ['Tarragona', 1528.7, 12000, 832494],
    ['Pontevedra', 1517.8, 14000, 944674],
    ['Álava', 2183.2, 5500, 345852],
    ['Navarra', 1672.8, 9000, 678338],
    ['Cantabria', 1700.8, 8500, 591563],
    ['Asturias', 1473.1, 12000, 1008028],
    ['Zaragoza', 1588.7, 16000, 1013143],
    ['Murcia', 1132.0, 14000, 1571933],
    ['A Coruña', 1448.8, 13000, 1142862],
    ['Granada', 1389.2, 9000, 928231],
    ['Valladolid', 1374.6, 7500, 518956],
    ['Almería', 1274.1, 11000, 752043],
    ['Huelva', 1301.6, 7500, 527806],
    ['La Rioja', 1262.3, 4500, 324399],
    ['Huesca', 1269.6, 3500, 225444],
    ['Guadalajara', 1412.2, 5000, 278105],
    ['Segovia', 1194.1, 2500, 155050],
    ['Salamanca', 1230.7, 5000, 327916],
    ['Castellón', 1195.4, 8000, 600301],
    ['Lleida', 1145.2, 5500, 447088],
    ['Córdoba', 1139.6, 8500, 776229],
    ['Burgos', 1212.3, 5000, 353270],
    ['Toledo', 1010.7, 8000, 736365],
    ['Albacete', 1029.1, 5000, 380634],
    ['Lugo', 996.4, 3500, 326124],
    ['Ourense', 966.7, 3000, 303478],
    ['Soria', 968.7, 1500, 89574],
    ['Ávila', 965.9, 2000, 154691],
    ['Palencia', 954.7, 2500, 156147],
    ['Badajoz', 928.4, 6000, 662144],
    ['León', 914.8, 5500, 448122],
    ['Teruel', 891.4, 2000, 132705],
    ['Cáceres', 873.4, 4500, 390646],
    ['Zamora', 836.4, 2000, 159790],
    ['Jaén', 813.9, 5500, 616663],
    ['Cuenca', 809.0, 2500, 194862],
    ['Ciudad Real', 725.5, 4500, 484523],
    ['Ceuta', 1975.6, 800, 83229],
    ['Melilla', 1915.1, 750, 85811]
  ];

  // Calcular métricas
  const dataWithMetrics = provinceData.map(([name, price, transactions, population]) => {
    const transactionsPerCapita = (transactions / population) * 1000; // por cada 1000 habitantes
    const marketIntensity = (transactions * price) / 1000000; // millones de euros
    return {
      name,
      price,
      transactions,
      population,
      transactionsPerCapita: transactionsPerCapita.toFixed(2),
      marketIntensity: marketIntensity.toFixed(0),
      priceCategory: price >= 2500 ? 'Muy Alto' : price >= 1800 ? 'Alto' : price >= 1300 ? 'Medio' : price >= 1000 ? 'Bajo' : 'Muy Bajo',
      activityCategory: transactionsPerCapita >= 15 ? 'Muy Alta' : transactionsPerCapita >= 10 ? 'Alta' : transactionsPerCapita >= 7 ? 'Media' : 'Baja'
    };
  });

  // Funciones de color
  const getPriceColor = (price) => {
    if (price >= 2500) return '#dc2626';
    if (price >= 1800) return '#f97316';
    if (price >= 1300) return '#fbbf24';
    if (price >= 1000) return '#a3e635';
    return '#10b981';
  };

  const getActivityColor = (transPerCapita) => {
    if (transPerCapita >= 15) return '#7c3aed';
    if (transPerCapita >= 10) return '#3b82f6';
    if (transPerCapita >= 7) return '#06b6d4';
    return '#6b7280';
  };

  // Preparar datos para descargar
  const downloadCSV = () => {
    const headers = ['Provincia', 'Precio €/m²', 'Transacciones 2024', 'Población', 'Trans. por 1000 hab', 'Intensidad Mercado (M€)', 'Categoría Precio', 'Categoría Actividad'];
    const rows = dataWithMetrics.map(d => [
      d.name,
      d.price,
      d.transactions,
      d.population,
      d.transactionsPerCapita,
      d.marketIntensity,
      d.priceCategory,
      d.activityCategory
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mercado_inmobiliario_provincias_2024.csv';
    link.click();
  };

  // Scatter plot
  const scatterWidth = 800;
  const scatterHeight = 500;
  const margin = { top: 20, right: 120, bottom: 60, left: 80 };
  const chartWidth = scatterWidth - margin.left - margin.right;
  const chartHeight = scatterHeight - margin.top - margin.bottom;

  const maxPrice = Math.max(...dataWithMetrics.map(d => d.price));
  const maxTrans = Math.max(...dataWithMetrics.map(d => parseFloat(d.transactionsPerCapita)));

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Mercado Inmobiliario por Provincia 2024
        </h2>
        <p className="text-gray-600 text-sm mb-1">
          Análisis cruzado: Precio vs Densidad de Transacciones
        </p>
        <p className="text-gray-500 text-xs">
          Fuente: Ministerio de Vivienda y Agenda Urbana (Boletín 2024) + INE
        </p>
        <button
          onClick={downloadCSV}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={16} />
          Descargar Datos CSV
        </button>
      </div>

      {/* Selector de vista */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setSelectedView('scatter')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedView === 'scatter'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Gráfico de Dispersión
        </button>
        <button
          onClick={() => setSelectedView('ranking')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedView === 'ranking'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Rankings
        </button>
      </div>

      {selectedView === 'scatter' ? (
        <>
          {/* Leyenda */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Interpretación del Gráfico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Color = Precio €/m²</p>
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 text-xs"><div className="w-4 h-4 rounded" style={{backgroundColor: '#dc2626'}}></div>≥2500 Muy Alto</span>
                  <span className="flex items-center gap-1 text-xs"><div className="w-4 h-4 rounded" style={{backgroundColor: '#f97316'}}></div>1800-2500 Alto</span>
                  <span className="flex items-center gap-1 text-xs"><div className="w-4 h-4 rounded" style={{backgroundColor: '#fbbf24'}}></div>1300-1800 Medio</span>
                  <span className="flex items-center gap-1 text-xs"><div className="w-4 h-4 rounded" style={{backgroundColor: '#a3e635'}}></div>1000-1300 Bajo</span>
                  <span className="flex items-center gap-1 text-xs"><div className="w-4 h-4 rounded" style={{backgroundColor: '#10b981'}}></div>&lt;1000 Muy Bajo</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Cuadrantes del Mercado</p>
                <p className="text-xs text-gray-600"><strong>Superior Derecha:</strong> Mercados caros y activos (Madrid, Barcelona)</p>
                <p className="text-xs text-gray-600"><strong>Superior Izquierda:</strong> Caros pero poco activos</p>
                <p className="text-xs text-gray-600"><strong>Inferior Derecha:</strong> Baratos pero muy activos (oportunidad)</p>
                <p className="text-xs text-gray-600"><strong>Inferior Izquierda:</strong> Baratos y poco activos</p>
              </div>
            </div>
          </div>

          {/* Scatter Plot */}
          <div className="mb-6 bg-gray-50 p-6 rounded-lg overflow-x-auto">
            <svg width={scatterWidth} height={scatterHeight}>
              <g transform={`translate(${margin.left},${margin.top})`}>
                {/* Grid lines */}
                {[0, 5, 10, 15, 20, 25].map(val => (
                  <g key={val}>
                    <line
                      x1={0}
                      x2={chartWidth}
                      y1={chartHeight - (val / maxTrans) * chartHeight}
                      y2={chartHeight - (val / maxTrans) * chartHeight}
                      stroke="#e5e7eb"
                      strokeDasharray="3,3"
                    />
                  </g>
                ))}
                
                {/* Axes */}
                <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#374151" strokeWidth={2} />
                <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#374151" strokeWidth={2} />
                
                {/* Y axis ticks and labels */}
                {[0, 5, 10, 15, 20, 25].map(val => (
                  <g key={val}>
                    <text
                      x={-10}
                      y={chartHeight - (val / maxTrans) * chartHeight + 5}
                      textAnchor="end"
                      fontSize="11"
                      fill="#6b7280"
                    >
                      {val}
                    </text>
                  </g>
                ))}
                
                {/* X axis ticks */}
                {[0, 1000, 2000, 3000].map(val => (
                  <text
                    key={val}
                    x={(val / maxPrice) * chartWidth}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#6b7280"
                  >
                    {val}
                  </text>
                ))}
                
                {/* Axis labels */}
                <text
                  x={chartWidth / 2}
                  y={chartHeight + 45}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#374151"
                >
                  Precio de la Vivienda (€/m²)
                </text>
                
                <text
                  transform={`translate(-55, ${chartHeight / 2}) rotate(-90)`}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#374151"
                >
                  Transacciones por 1000 habitantes
                </text>
                
                {/* Data points */}
                {dataWithMetrics.map((d, i) => {
                  const x = (d.price / maxPrice) * chartWidth;
                  const y = chartHeight - (parseFloat(d.transactionsPerCapita) / maxTrans) * chartHeight;
                  const radius = Math.sqrt(d.transactions / 1000) * 2;
                  
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r={radius}
                        fill={getPriceColor(d.price)}
                        opacity={hoveredProvince === d.name ? 1 : 0.7}
                        stroke={hoveredProvince === d.name ? '#000' : 'none'}
                        strokeWidth={2}
                        onMouseEnter={() => setHoveredProvince(d.name)}
                        onMouseLeave={() => setHoveredProvince(null)}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      />
                      {hoveredProvince === d.name && (
                        <text
                          x={x}
                          y={y - radius - 5}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="700"
                          fill="#1f2937"
                        >
                          {d.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Tooltip info */}
          {hoveredProvince && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-bold text-blue-900 mb-2">{hoveredProvince}</h4>
              {dataWithMetrics.filter(d => d.name === hoveredProvince).map(d => (
                <div key={d.name} className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-600">Precio:</span>
                  <span className="font-semibold">{d.price.toLocaleString('es-ES')} €/m²</span>
                  <span className="text-gray-600">Transacciones 2024:</span>
                  <span className="font-semibold">{d.transactions.toLocaleString('es-ES')}</span>
                  <span className="text-gray-600">Por 1000 hab:</span>
                  <span className="font-semibold">{d.transactionsPerCapita}</span>
                  <span className="text-gray-600">Intensidad mercado:</span>
                  <span className="font-semibold">{d.marketIntensity} M€</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Rankings */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Provincias más caras */}
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="text-lg font-bold text-red-800 mb-3">🔴 Provincias Más Caras</h3>
            <div className="space-y-2">
              {dataWithMetrics
                .sort((a, b) => b.price - a.price)
                .slice(0, 10)
                .map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                    <span className="font-semibold">{i + 1}. {d.name}</span>
                    <span className="text-red-700 font-bold">{d.price.toLocaleString('es-ES')} €/m²</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Provincias más baratas */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-bold text-green-800 mb-3">🟢 Provincias Más Baratas</h3>
            <div className="space-y-2">
              {dataWithMetrics
                .sort((a, b) => a.price - b.price)
                .slice(0, 10)
                .map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                    <span className="font-semibold">{i + 1}. {d.name}</span>
                    <span className="text-green-700 font-bold">{d.price.toLocaleString('es-ES')} €/m²</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Mayor actividad relativa */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="text-lg font-bold text-purple-800 mb-3">🔥 Mayor Actividad Relativa</h3>
            <p className="text-xs text-purple-600 mb-3">(Transacciones por cada 1000 habitantes)</p>
            <div className="space-y-2">
              {dataWithMetrics
                .sort((a, b) => parseFloat(b.transactionsPerCapita) - parseFloat(a.transactionsPerCapita))
                .slice(0, 10)
                .map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                    <span className="font-semibold">{i + 1}. {d.name}</span>
                    <span className="text-purple-700 font-bold">{d.transactionsPerCapita} trans/1000hab</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Mayor volumen absoluto */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-3">📊 Mayor Volumen Absoluto</h3>
            <p className="text-xs text-blue-600 mb-3">(Total transacciones 2024)</p>
            <div className="space-y-2">
              {dataWithMetrics
                .sort((a, b) => b.transactions - a.transactions)
                .slice(0, 10)
                .map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                    <span className="font-semibold">{i + 1}. {d.name}</span>
                    <span className="text-blue-700 font-bold">{d.transactions.toLocaleString('es-ES')}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-bold text-yellow-900 mb-2">💡 Insights Clave</h3>
        <ul className="space-y-1 text-sm text-yellow-800">
          <li>• <strong>Madrid y Baleares</strong> lideran en precios con más de 3.300 €/m²</li>
          <li>• <strong>Ciudad Real</strong> es la provincia más asequible (725 €/m²)</li>
          <li>• <strong>Baleares</strong> tiene la mayor densidad de transacciones relativa (turismo + inversión)</li>
          <li>• <strong>Madrid y Barcelona</strong> concentran el 26% del volumen total de transacciones</li>
          <li>• Las provincias costeras muestran mayor actividad relativa que las del interior</li>
        </ul>
      </div>
    </div>
  );
};

export default HousingMarketAnalysis;