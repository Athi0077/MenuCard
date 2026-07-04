importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCOiNtwDkjlm_7GJiHoT6n77KYYlTbkF1w",
  authDomain: "menucard-c646a.firebaseapp.com",
  projectId: "menucard-c646a",
  storageBucket: "menucard-c646a.firebasestorage.app",
  messagingSenderId: "581040761914",
  appId: "1:581040761914:web:63fc8e61a08e5a103e9903",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/vite.svg",
  });
});