'use client';
import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  registerables // Holt alles (Bar, Line, Doughnut, etc.)
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(...registerables);

export const HiddenChartFactory = ({ id, type, data, options, onReady }) => {
  
  // Standard-Optionen für MAXIMALE Geschwindigkeit
  const defaultOptions = {
    animation: false, // 🔥 WICHTIG: Keine Animation = Sofort fertig
    responsive: true,
    devicePixelRatio: 2, // Für scharfe PDFs (Retina Quali)
    events: [], // Keine Mouse-Events nötig (spart Ressourcen)
    plugins: {
      legend: { display: false }, // Legende bauen wir meist lieber native im PDF
      tooltip: { enabled: false }
    },
    ...options, // Deine custom options überschreiben die defaults
  };

  // Sobald die Komponente mounted, ist das Chart dank animation: false sofort fertig.
  // Wir nutzen einen kleinen useEffect, um das Bild zu extrahieren.
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      // Kleiner Timeout (0ms), um sicherzugehen, dass Canvas gerendert ist
      const timer = setTimeout(() => {
        const base64 = chartRef.current.toBase64Image();
        onReady(id, base64); // Wir senden ID und Bild zurück
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [data, type, id, onReady]); // Re-run wenn sich Daten ändern

  return (
    <div style={{ width: '600px', height: '300px' }}>
      <Chart 
        ref={chartRef}
        type={type} 
        data={data} 
        options={defaultOptions} 
      />
    </div>
  );
};