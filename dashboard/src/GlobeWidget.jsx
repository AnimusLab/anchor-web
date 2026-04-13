import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

export default function GlobeWidget({ recentEvents }) {
  const globeEl = useRef();
  const [ringsData, setRingsData] = useState([]);
  const [countries, setCountries] = useState([]);

  // Fetch true GeoJSON vector data to draw crisp country shapes
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => setCountries(data.features))
      .catch(err => console.error("Failed to load country shapes:", err));
  }, []);

  // Smooth, continuous rotation
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 1.2; // Slightly faster for a "live data" feel
      globeEl.current.pointOfView({ altitude: 2.2 });
    }
  }, []);

  // Map events to bright, terminal-style pulses
  useEffect(() => {
    if (!recentEvents || recentEvents.length === 0) return;

    const newRings = recentEvents.map((event) => {
      const hash = event.project.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
      const lat = (hash % 140) - 70; 
      const lng = (hash % 360) - 180; 

      return {
        lat,
        lng,
        // Bright Cyan for clean, Rose for violations
        color: event.status === 'CLEAN' ? 'rgba(34, 211, 238, 0.9)' : 'rgba(244, 63, 94, 0.9)', 
        maxR: event.status === 'CLEAN' ? 5 : 12,
        propagationSpeed: 1.5,
        repeatPeriod: 1000
      };
    });

    setRingsData(newRings);
  }, [recentEvents]);

  return (
    <div className="w-full h-full flex items-center justify-center cursor-move">
      {/* Show a subtle loading state while fetching the vector math */}
      {countries.length === 0 && (
        <div className="absolute text-cyan-500/50 font-mono text-[10px] animate-pulse z-10">
          INITIALIZING GEOSPATIAL GRID...
        </div>
      )}
      
      <Globe
        ref={globeEl}
        width={400}
        height={400}
        backgroundColor="rgba(0,0,0,0)"
        
        // THE MAGIC TRICK: Delete the solid sphere completely
        showGlobe={false} 
        
        // VECTOR COUNTRY SHAPES (The Hologram Look)
        polygonsData={countries}
        polygonAltitude={0.015}
        polygonCapColor={() => 'rgba(34, 211, 238, 0.15)'}  // Glowing translucent cyan glass
        polygonSideColor={() => 'rgba(34, 211, 238, 0.02)'} // Barely visible sides
        polygonStrokeColor={() => '#22D3EE'}                // Sharp cyan borders
        
        // Atmosphere glow
        showAtmosphere={true}
        atmosphereColor="#06b6d4" 
        atmosphereAltitude={0.25}
        
        // Telemetry Pulses
        ringsData={ringsData}
        ringColor="color"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
      />
    </div>
  );
}