import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBQ4YOUjXwawpfHeL9j2wkHYZIlCkyYjlE",
  authDomain: "control-hub-n8n.firebaseapp.com",
  projectId: "control-hub-n8n",
  storageBucket: "control-hub-n8n.firebasestorage.app",
  messagingSenderId: "393363927433",
  appId: "1:393363927433:web:709429b4d814fa14bff158"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
