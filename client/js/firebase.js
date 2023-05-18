// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.8.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpl6dvthv0tU5tMYZ9rNTLAtwTxG24uEA",
  authDomain: "stylish-f5af8.firebaseapp.com",
  projectId: "stylish-f5af8",
  storageBucket: "stylish-f5af8.appspot.com",
  messagingSenderId: "204133122047",
  appId: "1:204133122047:web:6db29d3abe3c0387a571ca",
  measurementId: "G-Y4T0X9YW7L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
