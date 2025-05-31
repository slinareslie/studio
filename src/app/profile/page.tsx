'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ShieldAlert, Edit3, LogOut } from 'lucide-react';

// Mock data fetching functions for user's alerts and liked alerts
// In a real app, these would fetch from Firestore
async function fetchUserAlerts(userId: string) {
  // Placeholder: Replace with actual Firestore query
  console.log("Fetching alerts for user:", userId);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
  return [
    // { id: 'alert1', category: 'Infrastructure', description: 'Bache peligroso en Av. Principal', createdAt: Date.now() - 100000000, likesCount: 5, commentsCount: 2, isResolved: false },
    // { id: 'alert2', category: 'Environment', description: 'Basura acumulada en parque', createdAt: Date.now() - 200000000, likesCount: 10, commentsCount: 3, isResolved: true },
  ];
}

async function fetchUserLikedAlerts(userId: string) {
  // Placeholder: Replace with actual Firestore query
  console.log("Fetching liked alerts for user:", userId);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    // { id: 'alert3', category: 'Security', description: 'Poca iluminación en callejón', createdAt: Date.now() - 50000000, likesCount: 15, commentsCount: 7, isResolved: false },
  ];
}


export default function ProfilePage() {
  const { user, loading, signOutUser } = useAuth();
  const router = useRouter();

  // These would be useQuery hooks in a real app
  const { data: userAlerts, isLoading: isLoadingUserAlerts } = { data: [], isLoading: true }; // useQuery(['userAlerts', user?.uid], () => fetchUserAlerts(user!.uid), { enabled: !!user });
  const { data: likedAlerts, isLoading: isLoadingLikedAlerts } = { data: [], isLoading: true }; // useQuery(['likedAlerts', user?.uid], () => fetchUserLikedAlerts(user!.uid), { enabled: !!user });


  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-15rem)]">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col items-center text-center space-y-4 p-6 bg-gradient-to-br from-primary/10 to-background">
          <Avatar className="h-24 w-24 border-4 border-primary shadow-md">
            <AvatarImage src={user.photoURL || `https://placehold.co/100x100.png`} alt={user.displayName || 'Usuario'} data-ai-hint="user large_avatar" />
            <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-2xl">{user.displayName || 'Usuario Anónimo'}</CardTitle>
            <CardDescription className="text-md">{user.email}</CardDescription>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline">
              <Edit3 className="mr-2 h-4 w-4" /> Editar Perfil
            </Button>
            <Button variant="destructive" onClick={signOutUser}>
              <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <ShieldAlert className="mr-2 h-5 w-5 text-primary" /> Mis Alertas Creadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUserAlerts ? (
              <LoadingSpinner />
            ) : userAlerts && userAlerts.length > 0 ? (
              <ul className="space-y-3">
                {/* {userAlerts.map((alert: any) => (
                  <li key={alert.id} className="p-3 border rounded-md hover:bg-muted/50 text-sm">
                    <p className="font-medium">{alert.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(alert.createdAt).toLocaleDateString()}</p>
                  </li>
                ))} */}
                <p className="text-muted-foreground">Funcionalidad de "Mis Alertas" pendiente de implementación.</p>
              </ul>
            ) : (
              <p className="text-muted-foreground">No has creado ninguna alerta todavía.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <ThumbsUp className="mr-2 h-5 w-5 text-primary" /> Alertas que te Gustan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingLikedAlerts ? (
              <LoadingSpinner />
            ) : likedAlerts && likedAlerts.length > 0 ? (
              <ul className="space-y-3">
                {/* {likedAlerts.map((alert: any) => (
                  <li key={alert.id} className="p-3 border rounded-md hover:bg-muted/50 text-sm">
                    <p className="font-medium">{alert.description}</p>
                     <p className="text-xs text-muted-foreground">Categoría: {alert.category}</p>
                  </li>
                ))} */}
                <p className="text-muted-foreground">Funcionalidad de "Alertas que te gustan" pendiente de implementación.</p>
              </ul>
            ) : (
              <p className="text-muted-foreground">No te ha gustado ninguna alerta todavía.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper to get ThumbsUp icon if not already imported
const ThumbsUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 10v12"/>
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h2a2 2 0 0 1 1.92 1.45L14 9.12V5.5a.5.5 0 0 1 .29-.45l.09-.05.09-.02a.5.5 0 0 1 .34 0l.09.02.09.05.09.07.08.09.08.1.05.08.06.09.04.08.03.09.02.08.01.09V5.88c0 .27-.1.52-.29.7L15 5.88z"/>
  </svg>
);
