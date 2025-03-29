// webapp/src/pages/BusinessDashboard.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FadeIn } from "../components/ui/animations";
import { useToast } from "../hooks/use-toast";
import { BusinessDashboard as DashboardUI } from "../components/ui/BusinessDashboard";
import { getBusiness, getBusinessStats, getBusinessPools } from "../lib/firebase";

const BusinessDashboard = () => {
  const { businessId = "demo" } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [pools, setPools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        if (businessId === "demo") {
          // For demo purposes, create a demo business (assumed connected)
          setBusiness({
            id: "demo",
            name: "Demo Business",
            email: "demo@example.com",
            stripeConnected: true,
            stripeAccountId: "acct_demo",
            createdAt: { toMillis: () => Date.now() }
          });
        } else {
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
          // If not connected to Stripe, force connection
          if (!businessData.stripeConnected) {
            toast({
              title: "Stripe not connected",
              description: "Please connect your Stripe account to access your dashboard",
              variant: "destructive"
            });
            navigate("/connect-stripe", { state: { businessId: businessData.id } });
            return;
          }
          setBusiness(businessData);
        }
        
        // Fetch dashboard data once business is available
        const [businessPools, businessStats] = await Promise.all([
          getBusinessPools(businessId),
          getBusinessStats(businessId)
        ]);
        setPools(businessPools);
        setStats(businessStats);
      } catch (error) {
        console.error("Error fetching business data:", error);
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
          <img src="/OnePool.png" alt="OnePool Logo" className="logo-image primary-logo" />
        </div>
      </header>
      
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <FadeIn>
          {/* Render the dashboard UI and pass down business, stats and pools */}
          {business && (
            <DashboardUI 
              business={business} 
              stats={stats} 
              pools={pools} 
              refreshData={async () => {
                const updatedPools = await getBusinessPools(business.id);
                const updatedStats = await getBusinessStats(business.id);
                setPools(updatedPools);
                setStats(updatedStats);
              }}
            />
          )}
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
