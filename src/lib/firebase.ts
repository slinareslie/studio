import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC83nfiC89SiLzkScpN0KjO4HE190QQag0",
  authDomain: "tacna-alerta.firebaseapp.com",
  projectId: "tacna-alerta",
  storageBucket: "tacna-alerta.firebasestorage.app",
  messagingSenderId: "729741666654",
  appId: "1:729741666654:web:2bb98f99c80acb1eb607cf"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
