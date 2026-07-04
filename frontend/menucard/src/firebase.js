import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCOiNtwDkjlm_7GJiHoT6n77KYYlTbkF1w",
  authDomain: "menucard-c646a.firebaseapp.com",
  projectId: "menucard-c646a",
  storageBucket: "menucard-c646a.firebasestorage.app",
  messagingSenderId: "581040761914",
  appId: "1:581040761914:web:63fc8e61a08e5a103e9903",
  measurementId: "G-3GPMS5E0MG",
};

export const app = initializeApp(firebaseConfig);

export const getFirebaseMessaging = async () => {
  const supported = await isSupported();

  if (!supported) {
    return null;
  }

  return getMessaging(app);
};