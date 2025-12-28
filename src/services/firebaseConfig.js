import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual Firebase config keys
const firebaseConfig = {
  apiKey: "AIzaSyCikpkoLy3lKysU5CY4SqauSQf1QehRmXU",
  authDomain: "studyvault-f6277.firebaseapp.com",
  projectId: "studyvault-f6277",
  storageBucket: "studyvault-f6277.firebasestorage.app",
  messagingSenderId: "292237298366",
  appId: "1:292237298366:web:0c89619b7005e0ec162cef",
  measurementId: "G-1J89HH0VWJ"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
