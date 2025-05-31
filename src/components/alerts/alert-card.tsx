import type { Alert, AlertCategory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { formatDistanceToNow, fromUnixTime } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, MapPin, CalendarDays, UserCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface AlertCardProps {
  alert: Alert;
  isMapPopup?: boolean; // To adjust styling for map popups
  isTrendingItem?: boolean; // To adjust styling for trending list
  onResolve?: (alertId: string) => void; // For creator to resolve
  onLike?: (alertId: string) => void;
  onComment?: (alertId: string) => void; // Or navigate to comment section
  showResolveButton?: boolean;
}

const categoryDisplayNames: Record<AlertCategory, string> = {
  Infrastructure: "Infraestructura",
  Environment: "Medio Ambiente",
  Security: "Seguridad",
  Noise: "Ruido",
  PublicServices: "Servicios Públicos",
  Other: "Otro",
};

const categoryColors: Record<AlertCategory, string> = {
  Infrastructure: "bg-orange-100 text-orange-700 border-orange-300",
  Environment: "bg-green-100 text-green-700 border-green-300",
  Security: "bg-blue-100 text-blue-700 border-blue-300",
  Noise: "bg-yellow-100 text-yellow-700 border-yellow-300",
  PublicServices: "bg-purple-100 text-purple-700 border-purple-300",
  Other: "bg-gray-100 text-gray-700 border-gray-300",
};


export default function AlertCard({ 
  alert, 
  isMapPopup = false, 
  isTrendingItem = false,
  onResolve,
  onLike,
  onComment,
  showResolveButton = false
}: AlertCardProps) {
  const timeAgo = formatDistanceToNow(fromUnixTime(alert.createdAt / 1000), { addSuffix: true, locale: es });
  const expiryDate = fromUnixTime(alert.expiresAt / 1000);

  const cardBaseClass = isMapPopup ? "w-full max-w-sm shadow-lg rounded-lg" : "shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg";
  
  if (isTrendingItem) {
    return (
      <Card className={`${cardBaseClass} flex flex-col md:flex-row overflow-hidden`}>
        {alert.imageUrl && (
          <div className="md:w-1/3 h-48 md:h-auto relative">
            <Image src={alert.imageUrl} alt={`Alerta: ${alert.category}`} layout="fill" objectFit="cover" data-ai-hint="alert issue" />
          </div>
        )}
        <div className={`p-4 flex flex-col justify-between ${alert.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
          <div>
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline" className={`${categoryColors[alert.category]}`}>
                {categoryDisplayNames[alert.category]}
              </Badge>
              {alert.isResolved && <Badge variant="secondary" className="bg-green-600 text-white">Resuelta</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{timeAgo}</p>
            <p className="text-foreground line-clamp-2 mb-3">{alert.description || "Sin descripción detallada."}</p>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center"><ThumbsUp className="h-4 w-4 mr-1 text-primary" /> {alert.likesCount}</span>
              <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-1 text-primary" /> {alert.commentsCount}</span>
            </div>
            <Button variant="link" size="sm" asChild className="text-primary p-0 h-auto">
              <Link href={`/?alert=${alert.id}`}>
                Ver en mapa <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cardBaseClass}>
      <CardHeader className={isMapPopup ? "p-3" : "p-4"}>
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={`${categoryColors[alert.category]} text-xs px-2 py-0.5`}>
            {categoryDisplayNames[alert.category]}
          </Badge>
          {alert.isResolved && <Badge variant="secondary" className="bg-green-600 text-white text-xs px-2 py-0.5">Resuelta</Badge>}
        </div>
        {!isMapPopup && (
          <CardTitle className="font-headline text-lg mt-1 line-clamp-2">
            {alert.description ? alert.description.substring(0, 60) + (alert.description.length > 60 ? '...' : '') : 'Alerta Ciudadana'}
          </CardTitle>
        )}
        <CardDescription className={`text-xs ${isMapPopup ? 'mt-1' : ''}`}>
          <span className="flex items-center"><UserCircle className="h-3 w-3 mr-1" /> {alert.creatorDisplayName || 'Anónimo'}</span>
          <span className="flex items-center mt-0.5"><CalendarDays className="h-3 w-3 mr-1" /> {timeAgo}</span>
          {!alert.isResolved && (
            <span className="flex items-center mt-0.5 text-red-600"><CalendarDays className="h-3 w-3 mr-1" /> Expira: {formatDistanceToNow(expiryDate, { addSuffix: true, locale: es })}</span>
          )}
        </CardDescription>
      </CardHeader>
      {alert.imageUrl && (
        <div className={`relative ${isMapPopup ? 'h-32' : 'h-48'} w-full overflow-hidden`}>
          <Image src={alert.imageUrl} alt={`Alerta: ${categoryDisplayNames[alert.category]}`} layout="fill" objectFit="cover" data-ai-hint="alert issue" />
        </div>
      )}
      <CardContent className={isMapPopup ? "p-3 text-sm" : "p-4"}>
        {isMapPopup && <p className="text-foreground line-clamp-3">{alert.description || "Sin descripción detallada."}</p>}
        {!isMapPopup && !isTrendingItem && <p className="text-foreground text-sm line-clamp-4">{alert.description || "Sin descripción detallada."}</p>}
      </CardContent>
      {!isMapPopup && (
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-4 border-t">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2 sm:mb-0">
            <Button variant="ghost" size="sm" onClick={() => onLike?.(alert.id)} className="p-1 h-auto">
              <ThumbsUp className="h-4 w-4 mr-1 text-primary" /> {alert.likesCount}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onComment?.(alert.id)} className="p-1 h-auto">
              <MessageSquare className="h-4 w-4 mr-1 text-primary" /> {alert.commentsCount}
            </Button>
          </div>
          <div className="flex gap-2">
            {showResolveButton && onResolve && !alert.isResolved && (
              <Button variant="outline" size="sm" onClick={() => onResolve(alert.id)} className="border-green-500 text-green-600 hover:bg-green-50">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Marcar Resuelta
              </Button>
            )}
             {isMapPopup && (
                <Button variant="link" size="sm" asChild className="text-primary p-0 h-auto">
                  <Link href={`/alert/${alert.id}`}> {/* Assuming a dedicated alert page exists */}
                    Ver Detalles <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
