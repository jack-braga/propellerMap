import { useEffect, useRef, useState, useCallback } from "react";
import type { Coordinate } from "../App";
import { useQuery } from '@tanstack/react-query';

const fetchTiles = async (z: number, x: number, y: number) => {
  const response = await fetch(`https://challenge-tiler.services.propelleraero.com/tiles/${z}/${x}/${y}?token=${import.meta.env.VITE_API_KEY}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.blob();
};

type Priority = "inView" | "outOfView" | "none";

const SCALED_TILE_HEIGHT = 256 * 2.5;

function MapTile({zoomLevel, tileDepth, tileCoord, onTileStatusChange, enableOutOfViewLoading } : { zoomLevel: number, tileDepth: number, tileCoord: Coordinate, onTileStatusChange: (id: string, inView: boolean, isLoaded: boolean) => void, enableOutOfViewLoading: boolean}) {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
  const tileWrapperRef = useRef<HTMLDivElement>(null);
  const [renderPriority, setRenderPrioity] = useState<Priority>("none");
  const [isImgLoaded, setIsImgLoaded] = useState<boolean>(false);

  const shouldRender = zoomLevel === tileDepth;
  const tileId = `${tileDepth}-${tileCoord[0]}-${tileCoord[1]}`;

  const handlePriority = useCallback((entries : IntersectionObserverEntry[]) => {
    const [ entry ] = entries;
    const newPriority = entry.isIntersecting ? "inView" : shouldRender ? "outOfView" : "none";
    setRenderPrioity(newPriority);
  }, [shouldRender, tileId, onTileStatusChange, isImgLoaded]);

  useEffect(() => {
    const observer = new IntersectionObserver(handlePriority, {root: null, rootMargin: `${SCALED_TILE_HEIGHT/2}px`, threshold: 0.5});

    if (tileWrapperRef.current) {
      observer.observe(tileWrapperRef.current);
    }

    return () => {
      if (tileWrapperRef.current) {
        observer.unobserve(tileWrapperRef.current);
      }
    };
  }, [handlePriority]);

  const canFetch = renderPriority === "inView" || (renderPriority === "outOfView" && enableOutOfViewLoading);

  const { data: imageBlob } = useQuery({
    queryKey: ['tiles', tileDepth, tileCoord[0], tileCoord[1]],
    queryFn: (() => fetchTiles(zoomLevel,  tileCoord[0], tileCoord[1])),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
    enabled: canFetch,
  });

	 useEffect(() => {
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      setImageUrl(url);
      setIsImgLoaded(true);
      return () => {
        URL.revokeObjectURL(url);
        setImageUrl(null);
        setIsImgLoaded(false);
      };
    } else {
      setImageUrl(null);
      setIsImgLoaded(false);
    }
  }, [imageBlob]);

  useEffect(() => {
        if (shouldRender && onTileStatusChange) {
            onTileStatusChange(tileId, renderPriority === "inView", isImgLoaded);
        }
    }, [renderPriority, shouldRender, onTileStatusChange, tileId, isImgLoaded]);

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
      {shouldRender &&
        <div ref={tileWrapperRef}>
          {zoomLevel === tileDepth ? imageUrl ? <img className="tile" style={{ height: `${SCALED_TILE_HEIGHT}px` }} src={imageUrl}/> : <div className="tile"></div> : null}
        </div>
      }
      {zoomLevel > tileDepth &&  (
          <div className="map-tile-grid-container" style={{ height: `${SCALED_TILE_HEIGHT * 2 * (zoomLevel - tileDepth)}px` }}>
            <MapTile zoomLevel={zoomLevel} tileDepth={nextTileDepth} tileCoord={childTileCoords.topLeft} onTileStatusChange={onTileStatusChange} enableOutOfViewLoading={enableOutOfViewLoading}/>
            <MapTile zoomLevel={zoomLevel} tileDepth={nextTileDepth} tileCoord={childTileCoords.topRight} onTileStatusChange={onTileStatusChange} enableOutOfViewLoading={enableOutOfViewLoading}/>
            <MapTile zoomLevel={zoomLevel} tileDepth={nextTileDepth} tileCoord={childTileCoords.bottomLeft} onTileStatusChange={onTileStatusChange} enableOutOfViewLoading={enableOutOfViewLoading}/>
            <MapTile zoomLevel={zoomLevel} tileDepth={nextTileDepth} tileCoord={childTileCoords.bottomRight} onTileStatusChange={onTileStatusChange} enableOutOfViewLoading={enableOutOfViewLoading}/>
          </div>
        )
      }
    </>
  )
}

export default MapTile