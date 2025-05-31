'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import type { Alert } from '@/lib/types';
import { CircleAlert } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';


export interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  onMapClick?: (location: LatLngLiteral) => void;
  initialCenter?: LatLngLiteral;
  zoom?: number;
  alertsToDisplay?: Alert[]; // For future use to display markers
}

const DEFAULT_CENTER_LAT_LNG: LatLngLiteral = { lat: -18.0066, lng: -70.2505 }; // Tacna, Peru
const DEFAULT_ZOOM = 13;

export default function MapComponent({
  onMapClick,
  initialCenter = DEFAULT_CENTER_LAT_LNG,
  zoom = DEFAULT_ZOOM,
  alertsToDisplay,
}: MapComponentProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const googleMapsMapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID;

  const [mapCenter, setMapCenter] = useState<LatLngLiteral>(initialCenter);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [userLocation, setUserLocation] = useState<LatLngLiteral | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          // Optionally, center map on user location if no initialCenter is forced
          // For now, we prioritize initialCenter prop or default Tacna
           if (initialCenter === DEFAULT_CENTER_LAT_LNG) { // Only pan if we are on default
             setMapCenter(newLocation);
           }
        },
        () => {
          console.warn("Failed to get user location, using default or provided initial center.");
        }
      );
    }
  }, [initialCenter]);


  const handleMapInternalClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng && onMapClick) {
      onMapClick({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    }
  };

  if (!googleMapsApiKey || googleMapsApiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground rounded-lg shadow-inner p-4 text-center">
        <CircleAlert className="h-12 w-12 mr-4 text-destructive" />
        <div>
          <p className="text-lg font-semibold">Google Maps API Key no configurado.</p>
          <p>
            Por favor, añade tu Google Maps API Key a la variable de entorno{' '}
            <code className="bg-destructive/20 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> en tu archivo{' '}
            <code className="bg-destructive/20 px-1 rounded">.env</code> y reinicia el servidor.
          </p>
          <p className="mt-2">También asegúrate de que la API Key esté habilitada para "Maps JavaScript API" y que la facturación esté activa en tu proyecto de Google Cloud.</p>
        </div>
      </div>
    );
  }
  
  // TODO: Implement alert markers and info windows based on alertsToDisplay prop

  return (
    <APIProvider apiKey={googleMapsApiKey} solutionChannel="GMP_devsite_samples_v3_rgmbasic">
      <div className="w-full h-full rounded-lg shadow-md relative">
        <Map
          defaultCenter={initialCenter}
          defaultZoom={zoom}
          center={mapCenter}
          zoom={currentZoom}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId={googleMapsMapId} // Optional: for custom map styling
          onClick={handleMapInternalClick}
          className="w-full h-full"
          onCameraChanged={(ev: MapCameraChangedEvent) => {
            if(ev.detail.center) setMapCenter(ev.detail.center);
            if(ev.detail.zoom) setCurrentZoom(ev.detail.zoom);
          }}
        >
          {/* Example of how you might add a marker for user's current location */}
          {userLocation && (
             <AdvancedMarker position={userLocation} title="Tu ubicación actual">
                {/* You can customize the marker icon here */}
                <span style={{ fontSize: '2rem' }}>📍</span> 
             </AdvancedMarker>
          )}

          {/* TODO: Iterate over alertsToDisplay and render AdvancedMarker for each */}
          {/* {alertsToDisplay?.map(alert => (
            <AdvancedMarker key={alert.id} position={{ lat: alert.latitude, lng: alert.longitude }}>
              // Custom marker icon based on alert.category
            </AdvancedMarker>
          ))} */}
        </Map>
         {!googleMapsApiKey && ( // This check might be redundant due to early return, but good for clarity
           <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
              <LoadingSpinner />
              <p className="ml-3 text-muted-foreground">Cargando mapa...</p>
           </div>
        )}
      </div>
    </APIProvider>
  );
}
