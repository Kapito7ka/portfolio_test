// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLMgJA9kPPGcDEep_BMKL1eZLgzpdPdxY",
  authDomain: "portfolio-vue-e19fc.firebaseapp.com",
  databaseURL: "https://portfolio-vue-e19fc-default-rtdb.firebaseio.com",
  projectId: "portfolio-vue-e19fc",
  storageBucket: "portfolio-vue-e19fc.firebasestorage.app",
  messagingSenderId: "174607725385",
  appId: "1:174607725385:web:35713c71d4f32325ba2098",
  measurementId: "G-NW0X3QLZNZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app)

export { db }