
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
  Timestamp,
  updateDoc,
  orderBy,
  limit
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
  businessId?: string;
  checkoutSessionId?: string;
  status?: 'active' | 'completed' | 'cancelled';
}

export interface Business {
  id: string;
  name: string;
  email: string;
  stripeAccountId?: string;
  stripeConnected?: boolean;
  createdAt: Timestamp | null;
}

// Pool services
export const createPool = async (
  totalAmount: number, 
  subscriptionName: string = "Payment",
  contributors: Contributor[] = [],
  businessId?: string
): Promise<string> => {
  try {
    const poolsCollectionRef = collection(db, "pools");

    // Create a base poolData object without the businessId field.
    const poolData: Partial<Pool> = {
      id: "", // Will be updated after document creation
      createdAt: Timestamp.now(),
      totalAmount,
      subscriptionName,
      contributors,
      status: 'active'
    };

    // Only add businessId if it is defined.
    if (businessId !== undefined) {
      poolData.businessId = businessId;
    }
    
    // Add the document to Firestore and get its ID.
    const docRef = await addDoc(poolsCollectionRef, poolData);
    const poolId = docRef.id;
    
    // Update the document to include its ID.
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

// Process payments for verified cards
export const processPayments = async (
  poolId: string,
  contributorIds: string[] = []
): Promise<void> => {
  try {
    // Get the current pool
    const pool = await getPool(poolId);
    if (!pool) throw new Error("Pool not found");
    
    let updatedContributors = [...pool.contributors];
    
    // If contributorIds is empty, process all verified cards
    if (contributorIds.length === 0) {
      updatedContributors = updatedContributors.map(contributor => 
        contributor.hasVerified 
          ? { ...contributor, hasPaid: true } 
          : contributor
      );
    } 
    // Otherwise, only process the specified contributors
    else {
      updatedContributors = updatedContributors.map(contributor => 
        contributorIds.includes(contributor.id) && contributor.hasVerified
          ? { ...contributor, hasPaid: true } 
          : contributor
      );
    }
    
    // Update the pool
    await updatePoolContributors(poolId, updatedContributors);
    
    // Check if all contributors have paid, update pool status if true
    const allPaid = updatedContributors.every(contributor => contributor.hasPaid);
    if (allPaid) {
      const poolRef = doc(db, "pools", poolId);
      await updateDoc(poolRef, { status: 'completed' });
    }
  } catch (error) {
    console.error("Error processing payments:", error);
    throw error;
  }
};

// Business services
export const createBusiness = async (
  name: string,
  email: string
): Promise<string> => {
  try {
    const businessesCollectionRef = collection(db, "businesses");
    
    const businessData: Business = {
      id: "",
      name,
      email,
      stripeConnected: false,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(businessesCollectionRef, businessData);
    const businessId = docRef.id;
    
    await setDoc(docRef, { ...businessData, id: businessId }, { merge: true });
    
    return businessId;
  } catch (error) {
    console.error("Error creating business:", error);
    throw error;
  }
};

export const getBusiness = async (businessId: string): Promise<Business | null> => {
  try {
    const businessRef = doc(db, "businesses", businessId);
    const businessSnap = await getDoc(businessRef);
    
    if (businessSnap.exists()) {
      return businessSnap.data() as Business;
    } else {
      console.log("No such business exists!");
      return null;
    }
  } catch (error) {
    console.error("Error getting business:", error);
    throw error;
  }
};

export const updateBusinessStripeAccount = async (
  businessId: string,
  stripeAccountId: string
): Promise<void> => {
  try {
    const businessRef = doc(db, "businesses", businessId);
    await updateDoc(businessRef, { 
      stripeAccountId,
      stripeConnected: true
    });
  } catch (error) {
    console.error("Error updating business Stripe account:", error);
    throw error;
  }
};

export const getBusinessPools = async (businessId: string): Promise<Pool[]> => {
  try {
    const poolsCollectionRef = collection(db, "pools");
    const q = query(
      poolsCollectionRef,
      where("businessId", "==", businessId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const pools: Pool[] = [];
    
    querySnapshot.forEach((doc) => {
      pools.push(doc.data() as Pool);
    });
    
    return pools;
  } catch (error) {
    console.error("Error getting business pools:", error);
    throw error;
  }
};

export const getBusinessStats = async (businessId: string) => {
  try {
    const pools = await getBusinessPools(businessId);
    
    const activePoolsCount = pools.filter(pool => pool.status === 'active').length;
    const completedPoolsCount = pools.filter(pool => pool.status === 'completed').length;
    
    const totalAmount = pools.reduce((total, pool) => total + pool.totalAmount, 0);
    const collectedAmount = pools.reduce((total, pool) => {
      const poolCollected = pool.contributors.reduce((sum, contributor) => 
        contributor.hasPaid ? sum + contributor.amount : sum, 0);
      return total + poolCollected;
    }, 0);
    
    const totalContributors = pools.reduce((total, pool) => total + pool.contributors.length, 0);
    const verifiedContributors = pools.reduce((total, pool) => {
      return total + pool.contributors.filter(c => c.hasVerified).length;
    }, 0);
    const paidContributors = pools.reduce((total, pool) => {
      return total + pool.contributors.filter(c => c.hasPaid).length;
    }, 0);
    
    return {
      totalPools: pools.length,
      activePools: activePoolsCount,
      completedPools: completedPoolsCount,
      totalAmount,
      collectedAmount,
      totalContributors,
      verifiedContributors,
      paidContributors
    };
  } catch (error) {
    console.error("Error getting business stats:", error);
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
