import type { User as FirebaseUser } from 'firebase/auth';

export type AlertCategory = "Infrastructure" | "Environment" | "Security" | "Noise" | "Public Services" | "Other";

export const alertCategories: AlertCategory[] = ["Infrastructure", "Environment", "Security", "Noise", "Public Services", "Other"];

export interface Alert {
  id: string;
  creatorId: string;
  creatorDisplayName?: string;
  category: AlertCategory;
  description?: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  createdAt: number; // Milliseconds since epoch
  expiresAt: number; // Milliseconds since epoch
  isResolved: boolean;
  likesCount: number;
  commentsCount: number;
}

export interface Comment {
  id: string;
  alertId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string | null;
  text: string;
  createdAt: number; // Milliseconds since epoch
}

export interface Like {
  id: string; // e.g., alertId_userId
  alertId: string;
  userId: string;
  createdAt: number; // Milliseconds since epoch
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface SignInCredentials {
  email: string;
  password?: string; // Password might be optional if only social login is used after this
}

export interface SignUpCredentials extends SignInCredentials {
  displayName?: string;
  passwordConfirmation?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export interface AlertFormData {
  category: AlertCategory;
  description?: string;
  image?: FileList | null;
}
