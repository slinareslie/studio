'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Chrome } from 'lucide-react';
import Link from 'next/link';

interface AuthFormProps {
  isSignUp?: boolean;
}

export default function AuthForm({ isSignUp = false }: AuthFormProps) {
  const { signUp, signIn, signInWithGoogle, loading } = useAuth();

  const formSchema = z.object({
    email: z.string().email({ message: 'Por favor ingrese un correo válido.' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
    ...(isSignUp && {
      displayName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
      passwordConfirmation: z.string(),
    }),
  }).refine(data => {
    if (isSignUp) {
      return data.password === data.passwordConfirmation;
    }
    return true;
  }, {
    message: "Las contraseñas no coinciden.",
    path: ["passwordConfirmation"], 
  });
  
  type AuthFormValues = z.infer<typeof formSchema>;

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(isSignUp && { displayName: '', passwordConfirmation: '' }),
    },
  });

  async function onSubmit(values: AuthFormValues) {
    if (isSignUp) {
      await signUp({ email: values.email, password: values.password, displayName: values.displayName });
    } else {
      await signIn({ email: values.email, password: values.password });
    }
  }

  return (
    <div className="max-w-md w-full mx-auto p-6 md:p-8 bg-card shadow-xl rounded-lg">
      <h2 className="font-headline text-2xl font-semibold text-center mb-6">
        {isSignUp ? 'Crear una Cuenta' : 'Iniciar Sesión'}
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {isSignUp && (
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@correo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isSignUp && (
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </Button>
        </form>
      </Form>
      <div className="mt-4 relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            O continuar con
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full mt-4" onClick={signInWithGoogle} disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
        Google
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignUp ? (
          <>
            ¿Ya tienes una cuenta?{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Inicia sesión
            </Link>
          </>
        ) : (
          <>
            ¿No tienes una cuenta?{' '}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              Regístrate
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
