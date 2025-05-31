'use client';

import MapComponent from '@/components/map/map-component';
import AlertFormDialog from '@/components/alerts/alert-form-dialog';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import type { LatLngLiteral } from '@/components/map/map-component'; // Adjust path as necessary

export default function HomePage() {
  const { user } = useAuth();
  const [isAlertFormOpen, setIsAlertFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LatLngLiteral | null>(null);

  const handleMapClick = (location: LatLngLiteral) => {
    if (user) {
      setSelectedLocation(location);
      setIsAlertFormOpen(true);
    } else {
      // Optionally, prompt user to log in
      alert("Debes iniciar sesión para crear una alerta.");
    }
  };

  return (
    <div className="relative h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] -my-8 -mx-4"> {/* Adjust height and negative margins */}
      <MapComponent onMapClick={handleMapClick} />
      {user && (
        <div className="absolute bottom-6 right-6 z-10">
           <Button 
            size="lg" 
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => {
              // For manual alert creation, perhaps center of current map view or user's location if available
              // For now, let's just open the form without a pre-selected location.
              // Or, ideally, this button is less prominent if map click is primary.
              // Let's make it so clicking this button also prompts a map click or uses a default.
              // For simplicity, let's assume map click is the primary way. This button could be a "Create Alert"
              // which then highlights the map and asks to click a location.
              // For now, it can open the form, and location can be manually entered or default.
              // To align with "click on any location on the map to initiate alert creation",
              // this button could be less prominent or guide the user.
              // Let's make it simple: it opens the form, location might be optional or default.
              setSelectedLocation(null); // No specific location from this button
              setIsAlertFormOpen(true);
            }}
           >
            <PlusCircle className="mr-2 h-5 w-5" />
            Crear Alerta
          </Button>
        </div>
      )}
      {selectedLocation !== undefined && ( // Check selectedLocation to ensure it's set before opening
        <AlertFormDialog
          isOpen={isAlertFormOpen}
          onOpenChange={setIsAlertFormOpen}
          location={selectedLocation}
        />
      )}
    </div>
  );
}
