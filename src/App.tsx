import { useEffect, useState } from 'react'
import MapTile from "./components/MapTile";
import './App.css'

export type Coordinate = [number, number];

function App() {
  const [mapCenter, setMapCenter] = useState<Coordinate>([0, 0]);
  const [zoomLevel, setZoomLevel] = useState<number>(0);
  const [tileDepth, setTileDepth] = useState<number>(0);
  const [tileCoord, setTileCoord] = useState<Coordinate>([0, 0]);
  
  const handleZoomIn = () => {
    console.log("\nZOOMED IN");
    setZoomLevel((prev) => {
      if (prev === 3) return 3;
      return prev + 1;
    });
  };

  const handleZoomOut = () => {
    console.log("\nZOOMED IN");
    setZoomLevel((prev) => {
      if (prev === 0) return 0;
      return prev - 1;
    });
  };

  return (
    <>
      <div className="map-window">
        <MapTile mapCenter={mapCenter} zoomLevel={zoomLevel} tileDepth={tileDepth} tileCoord={tileCoord}/>
      </div>
      <div className="zoom-controls">
        <button onClick={handleZoomIn}>+</button>
        <button onClick={handleZoomOut}>-</button>
      </div>
    </>
  )
}

export default App
