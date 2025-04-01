// webapp/src/pages/BusinessDashboard.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FadeIn } from "../components/ui/animations";
import { useToast } from "../hooks/use-toast";
import { BusinessDashboard as Dashboard } from "../components/ui/BusinessDashboard";
import { getBusiness } from "../lib/firebase";

const BusinessDashboard = () => {
  const { businessId = "demo" } = useParams();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        if (businessId === "demo") {
          // Load demo business data for insights
          setBusiness({
            id: "demo",
            name: "Acme Corp Insights",
            email: "insights@acmecorp.com",
            stripeConnected: true,
            stripeAccountId: "acct_demo",
            createdAt: { toMillis: () => Date.now() }
          });
          setIsLoading(false);
          return;
        }
        
        const businessData = await getBusiness(businessId);
        if (!businessData) {
          toast({
            title: "Business not found",
            description: "The requested business could not be found",
            variant: "destructive"
          });
          navigate("/");
          return;
        }
        
        setBusiness(businessData);
      } catch (error) {
        console.error("Error fetching business:", error);
        toast({
          title: "Error",
          description: "Failed to load business data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBusiness();
  }, [businessId, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="py-6 px-4 border-b border-border">
        <div className="container max-w-7xl mx-auto">
          <img src="OnePool.png" alt="OnePool Logo" className="logo-image primary-logo" />
        </div>
      </header>
      
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <FadeIn>
          {business && <Dashboard business={business} />}
        </FadeIn>
      </main>
      
      <footer className="py-6 px-4 border-t border-border">
        <div className="container max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          OnePool © {new Date().getFullYear()} — All rights reserved
        </div>
      </footer>
    </div>
  );
};

export default BusinessDashboard;
