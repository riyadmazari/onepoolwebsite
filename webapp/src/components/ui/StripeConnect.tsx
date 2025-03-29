
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FadeIn } from "./animations";
import { useToast } from "@/hooks/use-toast";
import { Link, CheckCircle } from "lucide-react";
import { generateStripeConnectUrl, handleOAuthCallback } from "@/lib/stripe";
import { updateBusinessStripeAccount } from "@/lib/firebase";

export const StripeConnect: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get businessId from location state
  const businessId = location.state?.businessId || "demo";
  
  // Check if we're processing a callback from Stripe
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    
    if (code && state) {
      // Process OAuth callback
      (async () => {
        setIsProcessingCallback(true);
        try {
          // Exchange auth code for account ID
          const { stripeAccountId } = await handleOAuthCallback(code);
          
          // Update business with Stripe account ID
          await updateBusinessStripeAccount(state, stripeAccountId);
          
          setIsConnected(true);
          toast({
            title: "Successfully connected",
            description: "Your Stripe account has been successfully connected"
          });
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate(`/dashboard/${state}`);
          }, 2000);
        } catch (error) {
          console.error("Error processing Stripe callback:", error);
          toast({
            title: "Connection failed",
            description: "Failed to connect your Stripe account",
            variant: "destructive"
          });
        } finally {
          setIsProcessingCallback(false);
        }
      })();
    }
  }, [location, toast, navigate]);
  
  const handleConnectStripe = () => {
    setIsConnecting(true);
    try {
      // Generate the connect URL
      const redirectUri = `${window.location.origin}/connect-stripe`;
      const connectUrl = generateStripeConnectUrl(businessId, redirectUri);
      
      // Redirect to Stripe
      window.location.href = connectUrl;
    } catch (error) {
      console.error("Error connecting to Stripe:", error);
      toast({
        title: "Connection failed",
        description: "Failed to initiate Stripe connection",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };
  
  if (isProcessingCallback) {
    return (
      <div className="glass-card p-8 max-w-md mx-auto text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold mb-2">Processing Connection</h2>
        <p className="text-muted-foreground">Please wait while we connect your Stripe account...</p>
      </div>
    );
  }
  
  if (isConnected) {
    return (
      <div className="glass-card p-8 max-w-md mx-auto text-center">
        <div className="w-16 h-16 text-emerald-500 mx-auto mb-6">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-xl font-semibold mb-2">Connection Successful!</h2>
        <p className="text-muted-foreground mb-6">Your Stripe account has been successfully connected to OnePool.</p>
        <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="glass-card p-8 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 mx-auto mb-4">
            <Link size={32} />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Connect with Stripe</h2>
          <p className="text-muted-foreground">Connect your Stripe account to start receiving payments directly.</p>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-3">Benefits of connecting:</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle size={18} className="text-emerald-500 mr-2 mt-0.5" />
              <span>Receive payments directly to your bank account</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={18} className="text-emerald-500 mr-2 mt-0.5" />
              <span>Access real-time payment information</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={18} className="text-emerald-500 mr-2 mt-0.5" />
              <span>Manage refunds and disputes from your Stripe dashboard</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={18} className="text-emerald-500 mr-2 mt-0.5" />
              <span>OnePool never touches your funds</span>
            </li>
          </ul>
        </div>
        
        <button
          onClick={handleConnectStripe}
          disabled={isConnecting}
          className="w-full py-3 px-4 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-medium flex items-center justify-center"
        >
          {isConnecting ? (
            <>
              <div className="w-5 h-5 border-2 border-t-white/0 border-white rounded-full animate-spin mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                alt="Stripe Logo" 
                className="h-5 mr-2" 
              />
              Connect with Stripe
            </>
          )}
        </button>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          By connecting, you agree to Stripe's Terms of Service and Privacy Policy.
        </p>
      </div>
    </FadeIn>
  );
};
