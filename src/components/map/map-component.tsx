'use client';

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import type { Alert } from '@/lib/types'; // Keep for future use
import { CircleAlert } from 'lucide-react';

// Ensure Mapbox CSS is imported, typically in layout.tsx or here if specific
// import 'mapbox-gl/dist/mapbox-gl.css';


export interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  onMapClick?: (location: LatLngLiteral) => void;
  initialCenter?: LatLngLiteral;
  zoom?: number;
  alertsToDisplay?: Alert[]; // Will be used later to display markers
}

// Tacna, Peru coordinates: [-70.2505, -18.0066] (Lng, Lat for Mapbox)
const DEFAULT_CENTER_LNG_LAT: [number, number] = [-70.2505, -18.0066];
const DEFAULT_ZOOM = 13;

export default function MapComponent({
  onMapClick,
  initialCenter,
  zoom = DEFAULT_ZOOM,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (!mapboxAccessToken || mapboxAccessToken === "pk.YOUR_MAPBOX_ACCESS_TOKEN_HERE") {
      console.error("Mapbox Access Token is not configured or is a placeholder.");
      return;
    }
    
    if (map.current || !mapContainer.current) return; // Initialize map only once and if container exists

    const LngLat: [number, number] = initialCenter
      ? [initialCenter.lng, initialCenter.lat]
      : DEFAULT_CENTER_LNG_LAT;

    mapboxgl.accessToken = mapboxAccessToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: LngLat,
      zoom: zoom,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      // TODO: Add logic to display alertsToDisplay as markers/layers
      // For now, this is where you'd iterate over `alertsToDisplay`
      // and add mapboxgl.Marker for each.
    });

    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
    }

    // Attempt to get user's current location to center map
    if (navigator.geolocation && !initialCenter) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map.current) {
            map.current.setCenter([position.coords.longitude, position.coords.latitude]);
          }
        },
        () => {
          console.warn("Failed to get user location, using default.");
        }
      );
    }
    
    // Clean up on unmount
    return () => {
      map.current?.remove();
      map.current = null;
      setMapLoaded(false);
    };
  }, [initialCenter, zoom, onMapClick, mapboxAccessToken]);


  if (!mapboxAccessToken || mapboxAccessToken === "pk.YOUR_MAPBOX_ACCESS_TOKEN_HERE") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground rounded-lg shadow-inner p-4 text-center">
        <CircleAlert className="h-12 w-12 mr-4 text-destructive" />
        <div>
          <p className="text-lg font-semibold">Mapbox Access Token no configurado.</p>
          <p>Por favor, añade tu Mapbox Public Access Token a la variable de entorno <code className="bg-destructive/20 px-1 rounded">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> en tu archivo <code className="bg-destructive/20 px-1 rounded">.env</code> y reinicia el servidor.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-lg shadow-md" 
      style={{ position: 'relative' }} // Needed for absolute positioning of map controls if any
    >
      {!mapLoaded && (
         <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
            <p className="text-muted-foreground">Cargando mapa...</p>
         </div>
      )}
    </div>
  );
}
