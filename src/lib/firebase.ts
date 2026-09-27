import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { UserProfile, ServiceRequest } from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with specific database ID if available
export const db = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// Test connection on boot as mandated by Firebase integration guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firestore offline / check configuration.');
    } else {
      console.log('Firestore initialized.');
    }
    return false;
  }
}

// Google Sign-In helper
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; isNew: boolean } | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user already has a profile in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    let isNew = !userDoc.exists();
    if (isNew) {
      await setDoc(userDocRef, {
        id: user.uid,
        name: user.displayName || 'Usuário Google',
        email: user.email || '',
        role: 'client',
        avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        rating: 5.0,
        tier: 'bronze',
        facialVerified: false,
        documentVerified: false,
        createdAt: new Date().toISOString()
      });
    }

    return { user, isNew };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    throw error;
  }
}

// Sign-Out helper
export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// Sync user profile to Firestore
export async function syncUserProfileToFirestore(profile: UserProfile): Promise<void> {
  try {
    if (!profile.id) return;
    const userDocRef = doc(db, 'users', profile.id);
    await setDoc(userDocRef, {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not sync user profile to Firestore:', error);
  }
}

// Sync service request to Firestore
export async function syncServiceRequestToFirestore(request: ServiceRequest): Promise<void> {
  try {
    if (!request.id) return;
    const reqDocRef = doc(db, 'requests', request.id);
    await setDoc(reqDocRef, {
      ...request,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not sync service request to Firestore:', error);
  }
}

// Subscribe to real-time service requests from Firestore
export function subscribeToFirestoreRequests(
  callback: (requests: ServiceRequest[]) => void
): () => void {
  try {
    const reqsRef = collection(db, 'requests');
    const q = query(reqsRef, limit(25));
    return onSnapshot(
      q,
      (snapshot) => {
        const loaded: ServiceRequest[] = [];
        snapshot.forEach((doc) => {
          loaded.push(doc.data() as ServiceRequest);
        });
        if (loaded.length > 0) {
          callback(loaded);
        }
      },
      (error) => {
        console.warn('Firestore requests listener error:', error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to requests:', err);
    return () => {};
  }
}
