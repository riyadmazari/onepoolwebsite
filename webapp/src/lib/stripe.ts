// webapp/src/lib/stripe.ts
import Stripe from "stripe";

// Initialize Stripe using your secret key
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

// Generate a Stripe Connect OAuth URL using environment variables
export const generateStripeConnectUrl = (businessId: string, redirectUri: string = process.env.STRIPE_REDIRECT_URI || ""): string => {
  const stripeClientId = process.env.STRIPE_CLIENT_ID || "";
  const state = encodeURIComponent(businessId);
  
  return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${stripeClientId}&scope=read_write&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
};

// Exchange an authorization code for a Stripe account ID (server-side)
export const handleOAuthCallback = async (code: string): Promise<{ stripeAccountId: string }> => {
  try {
    // In production, call Stripe's OAuth token endpoint
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });
    
    if (!response.stripe_user_id) {
      throw new Error("Stripe user ID not returned");
    }
    
    return {
      stripeAccountId: response.stripe_user_id,
    };
  } catch (error) {
    console.error("Error during Stripe OAuth callback:", error);
    throw error;
  }
};

// Generate a login link for the connected Stripe account
export const createLoginLink = async (stripeAccountId: string): Promise<string> => {
  try {
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    return loginLink.url;
  } catch (error) {
    console.error("Error creating Stripe login link:", error);
    throw error;
  }
};

export default stripe;
