import { useCallback, useEffect, useState } from 'react'
import MapTile from "./components/MapTile";
import './App.css'

export type Coordinate = [number, number];

type TileStatus = {
    inView: boolean;
    isLoaded: boolean;
};

function App() {
  const [zoomLevel, setZoomLevel] = useState<number>(0);
  const [enableOutOfViewLoading, setEnableOutOfViewLoading] = useState<boolean>(false);
  const [tileStatuses, setTileStatuses] = useState<Record<string, TileStatus>>({});
  
  const handleZoomIn = () => {
    setZoomLevel((prev) => {
      if (prev === 3) return 3;
      return prev + 1;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      if (prev === 0) return 0;
      return prev - 1;
    });
  };

  useEffect(() => {
    setTileStatuses({});
    setEnableOutOfViewLoading(false);
  }, [zoomLevel]);

  const onTileStatusChange = useCallback((id: string, inView: boolean, isLoaded: boolean) => {
    setTileStatuses((prev) => {
      const existingStatus = prev[id];

      if (inView) {
        // Only update if there's a *real* change in inView or isLoaded
        if (!existingStatus || existingStatus.inView !== inView || existingStatus.isLoaded !== isLoaded) {
          return {
            ...prev,
            [id]: { inView, isLoaded },
          };
        }
      }
      else {
        // Only delete if the tile actually exists and was previously in view
        if (existingStatus && existingStatus.inView) {
          const newTileStatuses = { ...prev };
          delete newTileStatuses[id];
          return newTileStatuses;
        }
      }

      // No actual change, return the previous state to prevent re-render
      return prev;
    });
  }, []);

  useEffect(() => {
    console.log(tileStatuses);
    const currentInViewTiles = Object.values(tileStatuses).filter(status => status.inView);

    if (currentInViewTiles.length === 0) {
      setEnableOutOfViewLoading(false);
      return;
    }

    const allInViewTilesAreLoaded = currentInViewTiles.every(status => status.isLoaded);
    setEnableOutOfViewLoading(allInViewTilesAreLoaded);
  }, [tileStatuses]);

  return (
    <>
      <div className="map-window">
        <MapTile zoomLevel={zoomLevel} tileDepth={0} tileCoord={[0, 0]} onTileStatusChange={onTileStatusChange} enableOutOfViewLoading={enableOutOfViewLoading}/>
      </div>
      <div className="zoom-controls">
        <button onClick={handleZoomIn}>+</button>
        <button onClick={handleZoomOut}>-</button>
      </div>
    </>
  )
}

export default App
