import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpJvtKoFBx-JrZ7Jdl92FABjAvq26zBQQ",
  authDomain: "aikyamsports-22905.firebaseapp.com",
  projectId: "aikyamsports-22905",
  storageBucket: "aikyamsports-22905.firebasestorage.app",
  messagingSenderId: "401932243496",
  appId: "1:401932243496:web:fcca906022a03295611b1d"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
