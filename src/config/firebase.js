import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// IMPORTANTE: Substitua com suas credenciais do Firebase
// Você obterá essas informações no console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBBK3p52tvVa9UXl7E0xPtJ88J1Ra0Tw_A",
  authDomain: "minha-lista-leitura.firebaseapp.com",
  projectId: "minha-lista-leitura",
  storageBucket: "minha-lista-leitura.firebasestorage.app",
  messagingSenderId: "588619148437",
  appId: "1:588619148437:web:fc824d2be8f66cc6c4ff9c"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore
export const db = getFirestore(app);

// Inicializa o Auth
export const auth = getAuth(app);
