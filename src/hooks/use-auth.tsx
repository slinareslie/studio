'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import type { AuthContextType, SignInCredentials, SignUpCredentials, UserProfile } from '@/lib/types';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser(userDocSnap.data() as UserProfile);
        } else {
          // Create user profile if it doesn't exist (e.g. after social sign-in)
          const newUserProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          await setDoc(userDocRef, newUserProfile);
          setUser(newUserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async ({ email, password, displayName }: SignUpCredentials) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const newUserProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName || firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), newUserProfile);
      setUser(newUserProfile);
      router.push('/');
      toast({ title: "Cuenta creada", description: "¡Bienvenido a Avisa!" });
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({ title: "Error al registrarse", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
      toast({ title: "Inicio de sesión exitoso", description: "¡Bienvenido de nuevo!" });
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast({ title: "Error al iniciar sesión", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
      toast({ title: "Inicio de sesión exitoso con Google", description: "¡Bienvenido!" });
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast({ title: "Error con Google", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      router.push('/auth/login');
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión exitosamente." });
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({ title: "Error al cerrar sesión", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
