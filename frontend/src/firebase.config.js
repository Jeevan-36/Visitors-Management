
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
   apiKey: "AIzaSyDOyzYHG4hYqUg0iDPJCuQ_StztztYsgIA",
  authDomain: "visitor-management-d7d22.firebaseapp.com",
  projectId: "visitor-management-d7d22",
  storageBucket: "visitor-management-d7d22.firebasestorage.app",
  messagingSenderId: "1034336645079",
  appId: "1:1034336645079:web:583e7c13735c3d1fdb2592",
  measurementId: "G-59EZ9TXDWC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you need
export const auth = getAuth(app);
export const messaging = getMessaging(app);
