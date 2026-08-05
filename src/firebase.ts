import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyBnOO11YDxsIwZJAZ2jXciHYmrQJaQ5ZXk",
  authDomain: "sayway-953c2.firebaseapp.com",
  projectId: "sayway-953c2",
  storageBucket: "sayway-953c2.firebasestorage.app",
  messagingSenderId: "779624322036",
  appId: "1:779624322036:web:774d30e460f13d0c929fa1",
  measurementId: "G-B6RKJ6P3FP"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics (browser support check)
export const analytics = typeof window !== 'undefined' ? isSupported().then(supported => supported ? getAnalytics(app) : null) : null;

// Firebase Firestore Helper Functions
export const fetchFirebaseProducts = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Firebase fetchProducts error:', err);
    return [];
  }
};

export const saveFirebaseOrder = async (orderData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      created_at: new Date().toISOString()
    });
    return { id: docRef.id, ...orderData };
  } catch (err) {
    console.error('Firebase saveOrder error:', err);
    return null;
  }
};
