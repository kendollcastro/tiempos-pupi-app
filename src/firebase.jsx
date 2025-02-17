
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAS6DrNdfdul4TCs2C91wr9ClrmrcTW8to',
  authDomain: 'tiempos-pupi-app.firebaseapp.com',
  projectId: 'tiempos-pupi-app',
  storageBucket: 'TU_STORAGE_BUCKET',
  messagingSenderId: 'TU_MESSAGING_SENDER_ID',
  appId: 'TU_APP_ID',
};

// 🔥 Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Inicializar Firebase Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// 🔥 Inicializar Firestore (Base de datos)
export const db = getFirestore(app);
