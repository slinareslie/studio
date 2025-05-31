'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Alert } from '@/lib/types';
import AlertCard from '@/components/alerts/alert-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertTriangle, ListChecks } from 'lucide-react';
import Link from 'next/link'; // Added import
import { Button } from '@/components/ui/button'; // Added import for Button, might be used with refetch

async function fetchTrendingAlerts(): Promise<Alert[]> {
  const now = Timestamp.now();
  const alertsRef = collection(db, 'alerts');
  // Query for alerts that are not resolved and not expired
  const q = query(
    alertsRef, 
    where('isResolved', '==', false), 
    where('expiresAt', '>', now.toMillis()),
    // Firestore does not support ordering by a sum of fields directly.
    // We fetch and sort client-side, or use a denormalized 'relevanceScore'.
    // For now, order by likesCount as primary, then commentsCount.
    orderBy('likesCount', 'desc'),
    orderBy('commentsCount', 'desc'),
    orderBy('createdAt', 'desc') // Secondary sort for tie-breaking
  );
  const querySnapshot = await getDocs(q);
  let alerts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
  
  // Custom sort by relevance (likes + comments)
  alerts.sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount));
  
  return alerts;
}

export default function TrendingPage() {
  const { data: alerts, isLoading, error, refetch } = useQuery<Alert[]>({
    queryKey: ['trendingAlerts'],
    queryFn: fetchTrendingAlerts,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <LoadingSpinner className="h-12 w-12" />
        <p className="mt-4 text-lg text-muted-foreground">Cargando alertas populares...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive">Error al Cargar Alertas</h2>
        <p className="text-muted-foreground mb-4">No se pudieron cargar las alertas populares. Inténtalo de nuevo más tarde.</p>
        <Button onClick={() => refetch()}>Reintentar</Button>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] text-center">
        <ListChecks className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">No Hay Alertas Populares</h2>
        <p className="text-muted-foreground">Parece que no hay alertas activas populares en este momento.</p>
        <p className="text-muted-foreground">¡Sé el primero en <Link href="/" className="text-primary hover:underline">crear una alerta</Link> o interactuar con existentes!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h1 className="font-headline text-3xl md:text-4xl font-bold mb-2">Tendencias en TacnaAlerta</h1>
        <p className="text-lg text-muted-foreground">Descubre los problemas más reportados y comentados por la comunidad.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} isTrendingItem={true} />
        ))}
      </div>
    </div>
  );
}
