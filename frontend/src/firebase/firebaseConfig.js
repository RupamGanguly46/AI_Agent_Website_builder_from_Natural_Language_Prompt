import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBKDP_aW0PgX4UmAwvEnrqdYse8wTN0G8s",
  authDomain: "nirmana-46.firebaseapp.com",
  projectId: "nirmana-46",
  storageBucket: "nirmana-46.firebasestorage.app",
  messagingSenderId: "36642397309",
  appId: "1:36642397309:web:e5a862538035e4862f6514"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
