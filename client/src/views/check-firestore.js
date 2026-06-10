import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBxMc9xhKZhLxE0V9rJ_M1QJ-VJv0SdlTs",
  authDomain: "blackyoga-2748c.firebaseapp.com",
  projectId: "blackyoga-2748c",
  storageBucket: "blackyoga-2748c.firebasestorage.app",
  messagingSenderId: "295743077337",
  appId: "1:295743077337:web:c744b590e88341970337c8"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function check() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'classTypes'))
    console.log('Exists:', snap.exists())
    if (snap.exists()) {
      console.log('Data:', JSON.stringify(snap.data(), null, 2))
    }
  } catch (err) {
    console.error('Error:', err.code, err.message)
  }
  process.exit(0)
}

check()
