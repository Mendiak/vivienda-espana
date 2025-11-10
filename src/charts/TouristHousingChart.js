import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TouristHousingChart = () => {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]); // New state to hold all fetched data
  const [nationalData, setNationalData] = useState([]); // New state to hold aggregated national data
  const d3Container = useRef(null);
  const [error, setError] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState('Total Nacional'); // Default selected province
  const [provinces, setProvinces] = useState([]); // All available provinces

  useEffect(() => {
    const fetchData = async () => {
      try {
        const csvData = await d3.tsv('/datasets/viviendas_turisticas_por_provincia.csv');
        
        if (!csvData) {
          setError('No se pudieron cargar los datos. Verifica la ruta del archivo.');
          return;
        }

        const processedRawData = csvData
          .map(row => {
            return {
              comunidad: row['Comunidades y Ciudades Autnomas'] ? row['Comunidades y Ciudades Autnomas'].trim() : '',
              provincia: row['Provincias'] ? row['Provincias'].trim() : '',
              tipoVivienda: row['Viviendas y plazas'] ? row['Viviendas y plazas'].trim() : '',
              periodo: row['Periodo'] ? row['Periodo'].trim() : '',
              total: parseFloat(row['Total'] ? row['Total'].replace(',', '.') : '0')
            };
          })
          .filter(row => row && row.periodo); // Ensure row and periodo exist

        setAllData(processedRawData); // Store all data

        // Filter out rows that are not specific provinces (e.g., national or community totals if they exist in the raw data)
        // Assuming a province row has a non-empty 'provincia' field that doesn't contain "Total" or similar summary keywords.
        const provincialOnlyData = processedRawData.filter(d => d.provincia && !d.provincia.includes('Total'));

        // Calculate national data from provincial-only data
        const aggregatedNationalData = Array.from(d3.group(provincialOnlyData, d => d.periodo), ([key, value]) => ({
          periodo: key,
          total: Math.round(d3.sum(value, d => d.total))
        }));
        setNationalData(aggregatedNationalData);

        // Extract unique provinces and sort them, then prepend "Total Nacional"
        const uniqueProvinces = [...new Set(processedRawData.map(d => d.provincia))].sort();
        setProvinces(['Total Nacional', ...uniqueProvinces]);

        // Set initial selected province
        // setSelectedProvince(uniqueProvinces[0] || ''); // Now defaults to 'Total Nacional'

      } catch (err) {
        setError('Error al procesar los datos del CSV.');
        console.error(err);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once on mount

  // Effect to filter data based on selectedProvince
  useEffect(() => {
    if (selectedProvince === 'Total Nacional') {
      setData(nationalData);
    } else if (allData.length > 0 && selectedProvince) {
      const filteredData = allData.filter(row => row.provincia === selectedProvince);
      setData(filteredData);
    }
  }, [allData, nationalData, selectedProvince]);

  useEffect(() => {
    if (data.length > 0 && d3Container.current) {
      // Sort data by period for chronological order
      const sortedData = data.sort((a, b) => a.periodo.localeCompare(b.periodo));

      d3.select(d3Container.current).selectAll("*").remove();

      const margin = { top: 20, right: 50, bottom: 80, left: 100 }; // Adjusted bottom margin for X-axis label
      const containerWidth = d3Container.current.clientWidth;
      const width = containerWidth - margin.left - margin.right;
      const height = 420; // Increased height to accommodate larger margin

      const svg = d3.select(d3Container.current)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand()
        .domain(sortedData.map(d => d.periodo))
        .range([0, width])
        .padding(0.2);

      const y = d3.scaleLinear()
        .domain([0, d3.max(sortedData, d => d.total) || 1])
        .range([height, 0]);

      // X Axis (Periods)
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end")
          .style("font-size", "12px"); // text-xs

      // X-axis label
      svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#333")
        .text("Periodo");

      // Y Axis (Total Housing)
      svg.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}`))
        .selectAll("text")
          .style("font-size", "12px"); // text-xs

      // Y-axis label
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20) // Adjust position
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#333")
        .text("Viviendas Turísticas");

      // Tooltip setup
      const tooltip = d3.select("#tooltip");

      // Bars
      svg.selectAll('.bar')
        .data(sortedData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.periodo))
        .attr('y', d => y(d.total))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.total))
        .attr('fill', '#3b82f6') // blue-500
        .on("mouseover", function(event, d) {
          tooltip.style("opacity", 1)
                 .html(`<strong>Provincia:</strong> ${selectedProvince}<br>
                        <strong>Periodo:</strong> ${d.periodo}<br>
                        <strong>Viviendas:</strong> ${d.total}`)
                 .style("left", (event.pageX + 10) + "px")
                 .style("top", (event.pageY - 20) + "px");
          d3.select(this).attr("fill", "#2563eb"); // Darker blue on hover
        })
        .on("mouseout", function() {
          tooltip.style("opacity", 0);
          d3.select(this).attr("fill", "#3b82f6"); // Restore original color
        });

      // Value labels
      svg.selectAll('.label')
        .data(sortedData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.periodo) + x.bandwidth() / 2)
        .attr('y', d => y(d.total) - 5)
        .attr('text-anchor', 'middle')
        .text(d => `${d.total.toFixed(0)}`)
        .style('font-size', '12px') // text-xs
        .style('fill', '#1f2937'); // gray-900
    }
  }, [data]);

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div className="p-5 font-sans">
      <p className="text-justify mb-2 text-sm leading-relaxed">
        Este gráfico muestra la evolución del número de viviendas turísticas a lo largo del tiempo para la provincia seleccionada.
        Permite observar las tendencias y cambios en la oferta de alojamiento turístico en cada región.
      </p>
      <p className="text-justify mb-4 text-sm leading-relaxed">
        Utilice el selector de provincia para explorar cómo ha variado el número de viviendas destinadas al turismo en diferentes áreas geográficas de España.
      </p>
      <h2 className="text-center text-2xl font-bold mb-4">Evolución de Viviendas Turísticas en {selectedProvince}</h2>
      
      <div className="mb-4 text-center">
        <label htmlFor="province-select" className="mr-2">Seleccionar Provincia:</label>
        <select
          id="province-select"
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="p-1 rounded border border-gray-300"
        >
          {provinces.map(province => (
            <option key={province} value={province}>{province}</option>
          ))}
        </select>
      </div>
      
      <div ref={d3Container} className="w-full border border-gray-300 rounded relative" /> {/* Added relative for tooltip positioning */}
      <div id="tooltip" className="absolute bg-white p-2 border border-gray-300 rounded shadow-md pointer-events-none opacity-0 transition-opacity duration-200"></div>
      <p className="text-right mt-2 text-xs text-gray-600">
        Fuente de datos: <a href="https://www.ine.es/jaxiT3/Tabla.htm?t=39364&L=0" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">INE (Serie Experimental)</a>
      </p>
    </div>
  );
};


export default TouristHousingChart;
