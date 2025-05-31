
'use client';

import React,
{
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  MapCameraChangedEvent,
  useAdvancedMarkerRef,
  Pin
} from '@vis.gl/react-google-maps';
import type { Alert } from '@/lib/types';
import { CircleAlert, Route } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AlertCard from '@/components/alerts/alert-card';

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  onMapClick?: (location: LatLngLiteral) => void;
  initialCenter?: LatLngLiteral;
  zoom?: number;
  alertsToDisplay?: Alert[];
  selectedAlertId?: string | null;
  onMarkerClick?: (alertId: string) => void;
  onInfoWindowClose?: () => void;
  directionsOrigin?: LatLngLiteral | string | null;
  directionsDestination?: LatLngLiteral | string | null;
}

const DEFAULT_CENTER_LAT_LNG: LatLngLiteral = { lat: -18.0066, lng: -70.2505 }; // Tacna, Peru
const DEFAULT_ZOOM = 13;

function DirectionsRenderer({ origin, destination }: { origin: LatLngLiteral | string, destination: LatLngLiteral | string }) {
  const map = useMap();
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [routeRendered, setRouteRendered] = useState(false);

  useEffect(() => {
    if (!map) return;
    if (!directionsService) setDirectionsService(new google.maps.DirectionsService());
    if (!directionsRenderer) {
      const renderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true, // We can add custom markers for origin/destination if needed
        polylineOptions: {
          strokeColor: '#29ABE2', // Primary blue color
          strokeOpacity: 0.8,
          strokeWeight: 6,
        },
      });
      setDirectionsRenderer(renderer);
    }

    return () => {
      if (directionsRenderer) {
        directionsRenderer.setMap(null); // Clean up renderer on component unmount
      }
    };
  }, [map, directionsService, directionsRenderer]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin || !destination || routeRendered) {
      // Clear route if origin/destination is removed or already rendered
      if ((!origin || !destination) && directionsRenderer) {
        directionsRenderer.setDirections(null);
        setRouteRendered(false);
      }
      return;
    }
    
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (response, status) => {
        if (status === google.maps.DirectionsStatus.OK && response) {
          directionsRenderer.setDirections(response);
          setRouteRendered(true); // Mark as rendered to avoid re-fetching unless props change
        } else {
          console.error('Directions request failed due to ' + status);
          // Optionally, notify user of the error
        }
      }
    );
  }, [directionsService, directionsRenderer, origin, destination, routeRendered]);

  // Effect to clear route if origin/destination becomes null/undefined
  useEffect(() => {
    if ((!origin || !destination) && directionsRenderer) {
      directionsRenderer.setDirections(null);
      setRouteRendered(false);
    }
  }, [origin, destination, directionsRenderer]);


  return null; // This component only handles rendering on the map
}


export default function MapComponent({
  onMapClick,
  initialCenter = DEFAULT_CENTER_LAT_LNG,
  zoom = DEFAULT_ZOOM,
  alertsToDisplay = [],
  selectedAlertId,
  onMarkerClick,
  onInfoWindowClose,
  directionsOrigin,
  directionsDestination,
}: MapComponentProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const rawGoogleMapsMapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID;

  const [mapCenter, setMapCenter] = useState<LatLngLiteral>(initialCenter);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [userLocation, setUserLocation] = useState<LatLngLiteral | null>(null);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          if (JSON.stringify(initialCenter) === JSON.stringify(DEFAULT_CENTER_LAT_LNG)) {
            // setMapCenter(newLocation); // Pan only if map is at default initial center
          }
        },
        () => {
          console.warn("Failed to get user location.");
        }
      );
    }
  }, [initialCenter]);

  const handleMapInternalClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng && onMapClick) {
      onMapClick({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    }
    // Close info window if map is clicked elsewhere
    if (selectedAlertId && onInfoWindowClose) {
      onInfoWindowClose();
    }
  };

  const handleCameraChange = useCallback((ev: MapCameraChangedEvent) => {
    if (ev.detail.center) setMapCenter(ev.detail.center);
    if (ev.detail.zoom) setCurrentZoom(ev.detail.zoom);
  }, []);

  const selectedAlert = alertsToDisplay.find(alert => alert.id === selectedAlertId);

  useEffect(() => {
    if (selectedAlert && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: selectedAlert.latitude, lng: selectedAlert.longitude });
    }
  }, [selectedAlert]);


  if (!googleMapsApiKey || googleMapsApiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground rounded-lg shadow-inner p-4 text-center">
        <CircleAlert className="h-12 w-12 mr-4 text-destructive" />
        <div>
          <p className="text-lg font-semibold">Google Maps API Key no configurado.</p>
          <p>
            Por favor, añade tu Google Maps API Key a la variable de entorno{' '}
            <code className="bg-destructive/20 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> en tu archivo{' '}
            <code className="bg-destructive/20 px-1 rounded">.env</code>.
          </p>
        </div>
      </div>
    );
  }
  
  const mapProps: { mapId?: string } = {};
  if (rawGoogleMapsMapId && rawGoogleMapsMapId.trim() !== '') {
    mapProps.mapId = rawGoogleMapsMapId;
  }

  return (
    <APIProvider apiKey={googleMapsApiKey} solutionChannel="GMP_devsite_samples_v3_rgmbasic">
      <div className="w-full h-full rounded-lg shadow-md relative">
        <Map
          ref={mapInstanceRef}
          defaultCenter={initialCenter}
          defaultZoom={zoom}
          center={mapCenter}
          zoom={currentZoom}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          onClick={handleMapInternalClick}
          onCameraChanged={handleCameraChange}
          className="w-full h-full"
          {...mapProps} // Spread mapId only if valid
        >
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Tu ubicación actual">
              <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
            </AdvancedMarker>
          )}

          {alertsToDisplay.map(alert => (
            <AdvancedMarker
              key={alert.id}
              position={{ lat: alert.latitude, lng: alert.longitude }}
              onClick={() => onMarkerClick && onMarkerClick(alert.id)}
              ref={alert.id === selectedAlertId ? markerRef : null}
              title={alert.description || alert.category}
            >
              {/* Basic Pin for now, can be customized based on alert.category later */}
              <Pin 
                background={alert.isResolved ? '#90EE90' : (selectedAlertId === alert.id ? '#1E90FF' : '#29ABE2')} 
                borderColor={alert.isResolved ? '#2E8B57' : '#1C75BB'}
                glyphColor={alert.isResolved ? '#2E8B57' : '#FFFFFF'} 
              />
            </AdvancedMarker>
          ))}

          {selectedAlert && marker && (
            <InfoWindow
              anchor={marker}
              onCloseClick={onInfoWindowClose}
              maxWidth={350}
            >
              <AlertCard alert={selectedAlert} isMapPopup={true} />
            </InfoWindow>
          )}
          {directionsOrigin && directionsDestination && (
            <DirectionsRenderer origin={directionsOrigin} destination={directionsDestination} />
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
 