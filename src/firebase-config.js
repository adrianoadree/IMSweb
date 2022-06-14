import { initializeApp } from "firebase/app";
import { getFirestore } from '@firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyCeYdj91EVhKDNVf4dhhJPPKJ5fVqtoT4A",
    authDomain: "inventoryapp-330808.firebaseapp.com",
    databaseURL: "https://inventoryapp-330808-default-rtdb.firebaseio.com",
    projectId: "inventoryapp-330808",
    storageBucket: "inventoryapp-330808.appspot.com",
    messagingSenderId: "568238556210",
    appId: "1:568238556210:web:6b52eb685b5723a457282b",
    measurementId: "G-3KF2NN2ZH8"
  };

  const app = initializeApp(firebaseConfig);


  export const db = getFirestore(app);