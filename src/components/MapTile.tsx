import { useEffect, useState } from "react";
import type { Coordinate } from "../App";
import { useQuery } from '@tanstack/react-query';

const fetchTiles = async (z: number, x: number, y: number) => {
  const response = await fetch(`https://challenge-tiler.services.propelleraero.com/tiles/${z}/${x}/${y}?token=${import.meta.env.VITE_API_KEY}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.blob();
};

const SCALED_TILE_HEIGHT = 256 * 2.5;

function MapTile({mapCenter, zoomLevel, tileDepth, tileCoord} : { mapCenter: Coordinate, zoomLevel: number, tileDepth: number, tileCoord: Coordinate}) {
	const [imageUrl, setImageUrl] = useState<string | null>(null);

  console.log("D: ", tileDepth, " TCoord: ", tileCoord, " ZOOM: ", zoomLevel);

  const { data: imageBlob } = useQuery({
    queryKey: ['tiles', zoomLevel, tileCoord[0], tileCoord[1]],
    queryFn: (() => fetchTiles(zoomLevel,  tileCoord[0], tileCoord[1])),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });

	 useEffect(() => {
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      setImageUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [imageBlob]);

  if (zoomLevel < tileDepth) {
    console.log("Not rendering");
  };

  const nextTileDepth = tileDepth + 1;
  const [currentX, currentY] = tileCoord;
  const childTileCoords: {
    topLeft: Coordinate;
    topRight: Coordinate;
    bottomLeft: Coordinate;
    bottomRight: Coordinate;
  } = {
    topLeft: [2 * currentX, 2 * currentY],
    topRight: [2 * currentX + 1, 2 * currentY],
    bottomLeft: [2 * currentX, 2 * currentY + 1],
    bottomRight: [2 * currentX + 1, 2 * currentY + 1]
  };

  return (
    <>
			{zoomLevel === tileDepth ? imageUrl ? <img className="tile" style={{ height: `${SCALED_TILE_HEIGHT}px` }} src={imageUrl}/> : <div className="tile"></div> : null}
      {zoomLevel > tileDepth &&  (
          <>
            <div className="map-tile-grid-container" style={{ height: `${SCALED_TILE_HEIGHT * 2 * (zoomLevel - tileDepth)}px` }}>
              <MapTile mapCenter={mapCenter} zoomLevel={zoomLevel} tileDepth={nextTileDepth} tileCoord={childTileCoords.topLeft}/>
              <MapTile mapCenter={mapCenter} zoomLevel={zoomLevel} tileDepth={nextTileDepth} tileCoord={childTileCoords.topRight}/>
              <MapTile mapCenter={mapCenter} zoomLevel={zoomLevel} tileDepth={nextTileDepth} tileCoord={childTileCoords.bottomLeft}/>
              <MapTile mapCenter={mapCenter} zoomLevel={zoomLevel} tileDepth={nextTileDepth} tileCoord={childTileCoords.bottomRight}/>
            </div>
          </>
        )
      }
    </>
  )
}

export default MapTile