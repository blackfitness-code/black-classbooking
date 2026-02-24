import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCZHbBCi1Yg37YKjKRpswAoo5F98rGdlTs",
  authDomain: "blackyoga-2748c.firebaseapp.com",
  projectId: "blackyoga-2748c",
  storageBucket: "blackyoga-2748c.firebasestorage.app",
  messagingSenderId: "295743077337",
  appId: "1:295743077337:web:c744b590e88341970337c8",
  measurementId: "G-KQGMH41Z67"
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Remove auth dependency for now
export const auth = null