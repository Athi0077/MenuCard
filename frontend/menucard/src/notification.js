import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

export async function requestPermission() {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("Notification permission denied");
    return;
  }

  const messaging = await getFirebaseMessaging();

  if (!messaging) return;

  try {
    const token = await getToken(messaging, {
      vapidKey: "BPQKG-9H_sukUyrUFW246eyE_RSm--0bga99NqPQf64IbtV1pM9RIb3zj1kVB0OYgLLvVJ8vmo2RQUis7umYIAk",
    });

    console.log("FCM TOKEN:", token);
    
    // Handle foreground notifications
    onMessage(messaging, (payload) => {
      console.log("Foreground Message received. ", payload);
      // You can also add custom UI like a toast here
    });

    return token;
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
    return null;
  }
}