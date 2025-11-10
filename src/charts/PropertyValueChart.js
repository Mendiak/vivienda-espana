import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const PropertyValueChart = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (d3Container.current) {
      // Fetch and parse the data
      d3.text('/datasets/variacion_valor_vivienda.csv').then(text => {
        // Find the header row and the data that follows
        const header = 'PERIODO,VALOR,TIPO DATO,NOTA';
        const dataStartIndex = text.indexOf(header);
        const csvData = text.substring(dataStartIndex);


        // Clean and format the data
        let data = d3.csvParse(csvData)
          .map(d => ({
            periodo: d.PERIODO,
            variation: parseFloat(d.VALOR.replace(',', '.')) // Renamed to 'variation'
          }))
          .filter(d => d.periodo && !isNaN(d.variation)) // Ensure data is valid
          .reverse(); // Reverse to have time flowing left-to-right

        // Calculate Property Value and trend
        const initialPropertyValue = 150000;
        const indexedData = data.reduce((acc, d) => {
          let newPropertyValue;
          let trend = 'flat';

          if (acc.length === 0) {
            // This is the first element
            newPropertyValue = initialPropertyValue;
          } else {
            const previousDataPoint = acc[acc.length - 1];
            newPropertyValue = previousDataPoint.propertyValue * (1 + (d.variation / 100));
            if (newPropertyValue > previousDataPoint.propertyValue) {
              trend = 'up';
            } else if (newPropertyValue < previousDataPoint.propertyValue) {
              trend = 'down';
            }
          }
          
          acc.push({ ...d, propertyValue: newPropertyValue, trend });
          return acc;
        }, []);

        // D3 Chart
        const margin = { top: 20, right: 30, bottom: 70, left: 50 }; // Increased left margin for index values
        const width = 900 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Clear any previous SVG
        d3.select(d3Container.current).selectAll('*').remove();

        const svg = d3.select(d3Container.current)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        // X axis
        const x = d3.scalePoint()
          .domain(indexedData.map(d => d.periodo))
          .range([0, width]);
        svg.append('g')
          .attr('transform', `translate(0, ${height})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)")
            .style("font-size", "10px");

        // Y axis
        const y = d3.scaleLinear()
          .domain(d3.extent(indexedData, d => d.propertyValue))
          .range([height, 0]);
        svg.append('g')
          .call(d3.axisLeft(y).tickFormat(d => `${(d / 1000).toFixed(0)}k`)); // Format ticks as '150k'

        // Y-axis label
        svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Valor de la Vivienda (€)");

        // Line segments
        svg.selectAll(".line-segment")
          .data(indexedData.slice(1))
          .enter()
          .append("line")
            .attr("class", "line-segment")
            .attr("x1", (d, i) => x(indexedData[i].periodo))
            .attr("y1", (d, i) => y(indexedData[i].propertyValue))
            .attr("x2", d => x(d.periodo))
            .attr("y2", d => y(d.propertyValue))
            .attr("stroke", d => {
              if (d.trend === 'up') return 'green';
              if (d.trend === 'down') return 'red';
              return 'grey';
            })
            .attr("stroke-width", 2);
        
        // Tooltip
        const tooltip = d3.select(d3Container.current)
          .append("div")
          .style("opacity", 0) // Set to 0 for initial hidden state
          .attr("class", "absolute bg-white border border-gray-300 rounded-md p-2 shadow-lg text-sm z-50") // Added z-50
          .style("position", "absolute")
          .style("pointer-events", "none");

        // Crear un grupo para el círculo que sigue al mouse
        const focus = svg.append("g")
          .style("display", "none");

        focus.append("circle")
          .attr("r", 6)
          .attr("fill", "white")
          .attr("stroke", "#333")
          .attr("stroke-width", 2);

        // Add circles for visualization only (no events)
        svg.selectAll("dot")
          .data(indexedData)
          .enter()
          .append("circle")
            .attr("r", 5)
            .attr("cx", d => x(d.periodo))
            .attr("cy", d => y(d.propertyValue))
            .style("fill", d => {
              if (d.trend === 'up') return 'green';
              if (d.trend === 'down') return 'red';
              return 'grey';
            })
            .style("opacity", 0.7)
            .style("pointer-events", "none"); // Desactivar eventos en estos círculos

        // Overlay rectangle para capturar todos los eventos
        svg.append("rect")
          .attr("width", width)
          .attr("height", height)
          .style("fill", "none")
          .style("pointer-events", "all")
          .style("cursor", "crosshair")
          .on("mouseover", () => focus.style("display", null))
          .on("mouseout", () => {
            focus.style("display", "none");
            tooltip.style("opacity", 0);
          })
          .on("mousemove", function(event) {
            const [xPos] = d3.pointer(event);
            
            // Encontrar el punto más cercano
            const domain = x.domain();
            const rangePoints = domain.map(d => x(d));
            const i = d3.bisectCenter(rangePoints, xPos);
            const d = indexedData[i];
            
            if (d) {
              focus.attr("transform", `translate(${x(d.periodo)},${y(d.propertyValue)})`);
              
              const [mouseX, mouseY] = d3.pointer(event, d3Container.current);
              tooltip
                .style("opacity", 1)
                .html(`Periodo: ${d.periodo}<br>Valor: ${d.propertyValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}<br>Variación Trimestral: ${d.variation}%`)
                .style("left", (mouseX + 15) + "px")
                .style("top", (mouseY - 80) + "px"); // -80px para mostrar por encima
            }
          });
            
        // X-axis label
        svg.append("text")             
          .attr("transform", `translate(${width/2}, ${height + margin.bottom - 10})`)
          .style("text-anchor", "middle")
          .text("Periodo");

        // Annotations mejoradas
        const annotations = [
          {
            periodo: '2008T2',
            text: 'Pico burbuja',
            subtitle: 'inmobiliaria',
            color: '#dc2626'
          },
          {
            periodo: '2013T1',
            text: 'Suelo tras',
            subtitle: 'la crisis',
            color: '#2563eb'
          },
          {
            periodo: '2020T2',
            text: 'COVID-19',
            subtitle: 'Parón mercado',
            color: '#7c3aed'
          }
        ];

        annotations.forEach(ann => {
          const annData = indexedData.find(d => d.periodo === ann.periodo);
          if (annData) {
            const annX = x(annData.periodo);
            const annY = y(annData.propertyValue);
            
            // Posición del texto: siempre 50px por encima del punto
            const textY = annY - 50;
            const lineEndY = annY - 38; // Línea más larga hasta justo debajo de la etiqueta

            // Crear grupo para la anotación
            const annGroup = svg.append('g')
              .attr('class', 'annotation');

            // Línea de anotación con color
            annGroup.append('line')
              .attr('x1', annX)
              .attr('y1', lineEndY)
              .attr('x2', annX)
              .attr('y2', annY)
              .attr('stroke', ann.color)
              .attr('stroke-width', 2)
              .attr('stroke-dasharray', '5,3')
              .style('opacity', 0.7);

            // Círculo en el punto
            annGroup.append('circle')
              .attr('cx', annX)
              .attr('cy', annY)
              .attr('r', 6)
              .attr('fill', ann.color)
              .attr('stroke', 'white')
              .attr('stroke-width', 2)
              .style('opacity', 0.9);

            // Fondo del texto (rectángulo redondeado)
            const textWidth = Math.max(ann.text.length, ann.subtitle.length) * 6 + 10;
            annGroup.append('rect')
              .attr('x', annX - textWidth / 2)
              .attr('y', textY - 8)
              .attr('width', textWidth)
              .attr('height', 28)
              .attr('rx', 4)
              .attr('fill', ann.color)
              .style('opacity', 0.9);

            // Texto principal
            annGroup.append('text')
              .attr('x', annX)
              .attr('y', textY + 3)
              .style('text-anchor', 'middle')
              .style('font-size', '11px')
              .style('font-weight', 'bold')
              .style('fill', 'white')
              .text(ann.text);

            // Subtítulo
            annGroup.append('text')
              .attr('x', annX)
              .attr('y', textY + 14)
              .style('text-anchor', 'middle')
              .style('font-size', '9px')
              .style('fill', 'white')
              .text(ann.subtitle);
          }
        });
      });
    }
  }, []);

  return (
    <>
      <div ref={d3Container} className="bg-white p-6 rounded-lg shadow-md" style={{ position: 'relative' }}>
      </div>
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <p className="text-gray-700 leading-relaxed">
          El gráfico superior simula la evolución del valor de una vivienda que en 2007 costaba <strong>150.000€</strong>. Cada punto en la línea representa el valor acumulado de esa propiedad a lo largo del tiempo, reflejando cómo las variaciones trimestrales de precios afectan a una inversión real. La línea, coloreada por tendencia (verde si sube, rojo si baja), expone una realidad alarmante: a pesar de la crisis de 2008, el valor no solo se ha recuperado, sino que ha alcanzado nuevos máximos, evidenciando una barrera de acceso a la vivienda cada vez más grave para la ciudadanía.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Datos obtenidos de: <a href="https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736152838&idp=1254735976607&menu=ultiDatos" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">INE.es</a>
        </p>
      </div>
    </>
  );
}

export default PropertyValueChart;