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

function MapTile({mapCenter, zoomLevel, tileDepth} : { mapCenter: Coordinate, zoomLevel: number, tileDepth: number}) {
	const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: imageBlob } = useQuery({
    queryKey: ['tiles', zoomLevel, mapCenter[0], mapCenter[1]],
    queryFn: (() => fetchTiles(zoomLevel,  mapCenter[0], mapCenter[1])),
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

  return (
    <>
			{zoomLevel === tileDepth && imageUrl && <img src={imageUrl}/>}
      {zoomLevel > tileDepth &&  (
        <>
          <MapTile mapCenter={mapCenter} zoomLevel={zoomLevel} tileDepth={tileDepth + 1} />
          <MapTile mapCenter={mapCenter} zoomLevel={zoomLevel} tileDepth={tileDepth + 1} />
          <MapTile mapCenter={mapCenter} zoomLevel={zoomLevel} tileDepth={tileDepth + 1} />
          <MapTile mapCenter={mapCenter} zoomLevel={zoomLevel} tileDepth={tileDepth + 1} />
        </>
      )
      }
    </>
  )
}

export default MapTile