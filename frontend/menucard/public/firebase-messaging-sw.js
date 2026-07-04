importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCOiNtwDkjlm_7GJiHoT6n77KYYlTbkF1w",
  authDomain: "menucard-c646a.firebaseapp.com",
  projectId: "menucard-c646a",
  storageBucket: "menucard-c646a.firebasestorage.app",
  messagingSenderId: "581040761914",
  appId: "1:581040761914:web:63fc8e61a08e5a103e9903",
  measurementId: "G-3GPMS5E0MG",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  
  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification.",
    icon: "/favicon.svg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
