import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBj4tQdEB3KV_4udOGGgThtC7VA7sDXw4k",
  authDomain: "presenceiq-5e819.firebaseapp.com",
  projectId: "presenceiq-5e819",
  storageBucket: "presenceiq-5e819.firebasestorage.app",
  messagingSenderId: "64517216998",
  appId: "1:64517216998:web:ad97bcd6574d88f709b927",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

