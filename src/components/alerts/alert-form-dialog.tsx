'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ImageUp } from 'lucide-react';
import type { AlertFormData, AlertCategory } from '@/lib/types';
import { alertCategories } from '@/lib/types';
import type { LatLngLiteral } from '@/components/map/map-component';
import Image from 'next/image';


interface AlertFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  location: LatLngLiteral | null; // Can be null if user opens form without map click
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  category: z.custom<AlertCategory>(val => alertCategories.includes(val as AlertCategory), {
    message: "Por favor seleccione una categoría válida.",
  }),
  description: z.string().max(250, { message: 'La descripción no puede exceder los 250 caracteres.' }).optional(),
  image: z.custom<FileList | null>()
    .refine(files => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `El tamaño máximo de la imagen es 5MB.`)
    .refine(files => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), "Solo se aceptan formatos .jpg, .jpeg, .png y .webp.")
    .optional(),
  latitude: z.number().optional(), // Will be injected if location is provided
  longitude: z.number().optional(), // Will be injected if location is provided
});


export default function AlertFormDialog({ isOpen, onOpenChange, location }: AlertFormDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: undefined,
      description: '',
      image: null,
      latitude: location?.lat,
      longitude: location?.lng,
    },
  });
  
  // Update default location when prop changes
  useState(() => {
    if (location) {
      form.reset({
        ...form.getValues(),
        latitude: location.lat,
        longitude: location.lng,
      });
    }
  });


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: 'Error', description: 'Debes iniciar sesión para crear una alerta.', variant: 'destructive' });
      return;
    }
    if (!location && (!values.latitude || !values.longitude)) {
      toast({ title: 'Error', description: 'Se requiere una ubicación. Por favor, haz clic en el mapa o ingresa coordenadas.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined = undefined;
      if (values.image && values.image.length > 0) {
        const file = values.image[0];
        const storageRef = ref(storage, `alerts/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const createdAt = Timestamp.now();
      const expiresAt = new Timestamp(createdAt.seconds + (14 * 24 * 60 * 60), createdAt.nanoseconds); // 2 weeks later

      await addDoc(collection(db, 'alerts'), {
        creatorId: user.uid,
        creatorDisplayName: user.displayName || user.email,
        category: values.category,
        description: values.description || '',
        imageUrl,
        latitude: location?.lat || values.latitude,
        longitude: location?.lng || values.longitude,
        createdAt: createdAt.toMillis(),
        expiresAt: expiresAt.toMillis(),
        isResolved: false,
        likesCount: 0,
        commentsCount: 0,
      });

      toast({ title: 'Alerta Creada', description: 'Tu alerta ha sido publicada exitosamente.' });
      onOpenChange(false);
      form.reset();
      setImagePreview(null);
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({ title: 'Error', description: 'No se pudo crear la alerta. Inténtalo de nuevo.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', event.target.files);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('image', null);
      setImagePreview(null);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        form.reset();
        setImagePreview(null);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Crear Nueva Alerta</DialogTitle>
          <DialogDescription>
            Completa los detalles de la alerta. La ubicación {location ? `seleccionada (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'se debe ingresar manualmente o seleccionar en el mapa'}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {alertCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe el problema (máx. 250 caracteres)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => ( // field is not directly used for file input value due to its nature
                <FormItem>
                  <FormLabel>Foto (Opcional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="outline" asChild className="relative cursor-pointer">
                        <div>
                          <ImageUp className="mr-2 h-4 w-4" />
                          Subir Imagen
                          <Input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept={ACCEPTED_IMAGE_TYPES.join(',')}
                            onChange={handleImageChange}
                          />
                        </div>
                      </Button>
                       {imagePreview && (
                        <div className="w-20 h-20 relative rounded-md overflow-hidden border">
                          <Image src={imagePreview} alt="Vista previa" layout="fill" objectFit="cover" data-ai-hint="alert image preview" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!location && ( // Show manual lat/lng input if no location from map
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitud</FormLabel>
                      <FormControl><Input type="number" step="any" placeholder="Ej: -18.0146" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitud</FormLabel>
                      <FormControl><Input type="number" step="any" placeholder="Ej: -70.2536" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { onOpenChange(false); form.reset(); setImagePreview(null); }}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Alerta
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
