'use client';

import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Alert, AlertCategory } from '@/lib/types';
import AlertCard from '@/components/alerts/alert-card'; 
import { CircleAlert, Construction, Leaf, ShieldCheck, Volume2, Users, HelpCircle } from 'lucide-react';

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  onMapClick?: (location: LatLngLiteral) => void;
  initialCenter?: LatLngLiteral;
  zoom?: number;
  alertsToDisplay?: Alert[]; // Optional: pass alerts directly
}

const categoryIcons: Record<AlertCategory, React.ElementType> = {
  Infrastructure: Construction,
  Environment: Leaf,
  Security: ShieldCheck,
  Noise: Volume2,
  PublicServices: Users,
  Other: HelpCircle,
};

const categoryColors: Record<AlertCategory, string> = {
  Infrastructure: 'bg-orange-500',
  Environment: 'bg-green-500',
  Security: 'bg-blue-500',
  Noise: 'bg-yellow-500',
  PublicServices: 'bg-purple-500',
  Other: 'bg-gray-500',
};

async function fetchActiveAlerts(): Promise<Alert[]> {
  const now = Timestamp.now();
  const alertsRef = collection(db, 'alerts');
  // Query for alerts that are not resolved and not expired
  const q = query(alertsRef, where('isResolved', '==', false), where('expiresAt', '>', now.toMillis()));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
}

export default function MapComponent({ 
  onMapClick, 
  initialCenter = { lat: -18.0146, lng: -70.2536 }, // Default to Tacna, Peru
  zoom = 13 
}: MapComponentProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID;

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngLiteral>(initialCenter);

  const { data: alerts, isLoading, error } = useQuery<Alert[]>({
    queryKey: ['activeAlerts'],
    queryFn: fetchActiveAlerts,
  });

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Failed to get location, use default
          console.warn("Failed to get user location, using default.");
        }
      );
    }
  }, []);


  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground rounded-lg shadow-inner">
        <CircleAlert className="h-12 w-12 mr-4" />
        <div>
          <p className="text-lg font-semibold">Google Maps API Key no configurada.</p>
          <p>Por favor, añada NEXT_PUBLIC_GOOGLE_MAPS_API_KEY a sus variables de entorno.</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
     return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground rounded-lg shadow-inner">
        Cargando mapa y alertas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-destructive/10 text-destructive rounded-lg shadow-inner">
        Error al cargar alertas: {error.message}
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={mapCenter}
        defaultZoom={zoom}
        center={mapCenter}
        zoom={zoom}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId={mapId || 'DEFAULT_MAP_ID'}
        onClick={(e) => {
          if (e.detail.latLng && onMapClick) {
            onMapClick(e.detail.latLng);
          }
        }}
        className="w-full h-full rounded-lg shadow-md"
      >
        {alerts?.map((alert) => {
          const IconComponent = categoryIcons[alert.category] || HelpCircle;
          const pinColor = categoryColors[alert.category] || 'bg-gray-500';
          return (
            <AdvancedMarker
              key={alert.id}
              position={{ lat: alert.latitude, lng: alert.longitude }}
              onClick={() => setSelectedAlert(alert)}
            >
              <Pin background={pinColor.replace('bg-', '')} borderColor={'white'} glyphColor={'white'}>
                 <IconComponent className="h-5 w-5" />
              </Pin>
            </AdvancedMarker>
          );
        })}

        {selectedAlert && (
          <InfoWindow
            position={{ lat: selectedAlert.latitude, lng: selectedAlert.longitude }}
            onCloseClick={() => setSelectedAlert(null)}
            maxWidth={350}
          >
            <AlertCard alert={selectedAlert} isMapPopup={true} />
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
