
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  addDoc,
  DocumentData,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4GUJv-M4W5ZaY-5-6yGY6um_X1EBWEQg",
  authDomain: "onepool-800e2.firebaseapp.com",
  projectId: "onepool-800e2",
  storageBucket: "onepool-800e2.appspot.com",
  messagingSenderId: "370160885219",
  appId: "1:370160885219:web:7a5c223281ab96c047d4d6",
  measurementId: "G-QSTDV4QVZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Pool interfaces
export interface Contributor {
  id: string;
  name: string;
  amount: number;
  hasVerified?: boolean;
  hasPaid?: boolean;
  isEditing?: boolean;
}

export interface Pool {
  id: string;
  createdAt: Timestamp | null;
  totalAmount: number;
  subscriptionName: string;
  contributors: Contributor[];
}

// Pool services
export const createPool = async (
  totalAmount: number, 
  subscriptionName: string = "Payment",
  contributors: Contributor[] = []
): Promise<string> => {
  try {
    // Generate a custom ID or get one from Firestore
    const poolsCollectionRef = collection(db, "pools");
    
    const poolData: Pool = {
      id: "", // Will be updated after document creation
      createdAt: Timestamp.now(),
      totalAmount,
      subscriptionName,
      contributors
    };
    
    // Add the document to get an ID
    const docRef = await addDoc(poolsCollectionRef, poolData);
    const poolId = docRef.id;
    
    // Update the pool with its ID
    await setDoc(docRef, { ...poolData, id: poolId }, { merge: true });
    
    return poolId;
  } catch (error) {
    console.error("Error creating pool:", error);
    throw error;
  }
};

export const getPool = async (poolId: string): Promise<Pool | null> => {
  try {
    const poolRef = doc(db, "pools", poolId);
    const poolSnap = await getDoc(poolRef);
    
    if (poolSnap.exists()) {
      return poolSnap.data() as Pool;
    } else {
      console.log("No such pool exists!");
      return null;
    }
  } catch (error) {
    console.error("Error getting pool:", error);
    throw error;
  }
};

export const updatePoolContributors = async (
  poolId: string, 
  contributors: Contributor[]
): Promise<void> => {
  try {
    const poolRef = doc(db, "pools", poolId);
    await setDoc(poolRef, { contributors }, { merge: true });
  } catch (error) {
    console.error("Error updating pool contributors:", error);
    throw error;
  }
};

export const updateContributorStatus = async (
  poolId: string,
  contributorId: string,
  status: { hasVerified?: boolean; hasPaid?: boolean; name?: string }
): Promise<void> => {
  try {
    // Get the current pool
    const pool = await getPool(poolId);
    if (!pool) throw new Error("Pool not found");
    
    // Find and update the contributor
    const updatedContributors = pool.contributors.map(contributor => 
      contributor.id === contributorId 
        ? { ...contributor, ...status } 
        : contributor
    );
    
    // Update the pool
    await updatePoolContributors(poolId, updatedContributors);
  } catch (error) {
    console.error("Error updating contributor status:", error);
    throw error;
  }
};

// Get all subscription templates
export const getSubscriptionTemplates = async (): Promise<Record<string, {name: string, amount: number}>> => {
  try {
    const templatesRef = collection(db, "subscriptionTemplates");
    const templatesSnap = await getDocs(templatesRef);
    
    const templates: Record<string, {name: string, amount: number}> = {};
    
    templatesSnap.forEach((doc) => {
      templates[doc.id] = doc.data() as {name: string, amount: number};
    });
    
    return templates;
  } catch (error) {
    console.error("Error getting subscription templates:", error);
    return {
      netflix: {name: "Netflix", amount: 19.99},
      spotify: {name: "Spotify", amount: 9.99},
      amazon: {name: "Amazon Prime", amount: 14.99},
      disney: {name: "Disney+", amount: 8.99}
    };
  }
};
