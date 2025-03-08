
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ContributorForm } from "@/components/ContributorForm";
import { PageTransition } from "@/components/ui/SlideTransition";
import { Contributor as ContributorType } from "@/components/ui/ContributorCard";

const Contributor = () => {
  const { poolId = "demo" } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(0);
  const [availableContributors, setAvailableContributors] = useState<ContributorType[]>([]);
  const [subscriptionName, setSubscriptionName] = useState<string>("Payment");

  useEffect(() => {
    if (!poolId) {
      navigate("/");
      return;
    }
    
    // In a real app, this would fetch pool information from the API
    // For now we'll use our mock data

    // Check if this is a subscription from our mock data
    const MOCK_SUBSCRIPTIONS: Record<string, any> = {
      "netflix": { name: "Netflix", amount: 19.99 },
      "spotify": { name: "Spotify", amount: 9.99 },
      "amazon": { name: "Amazon Prime", amount: 14.99 },
      "disney": { name: "Disney+", amount: 8.99 },
    };

    const subscription = MOCK_SUBSCRIPTIONS[poolId];
    
    if (subscription) {
      setAmount(subscription.amount);
      setSubscriptionName(subscription.name);
      
      // Mock contributors that would be retrieved from the API
      setAvailableContributors([
        { id: "mock1", name: "Alice", amount: subscription.amount / 4 },
        { id: "mock2", name: "Bob", amount: subscription.amount / 4 },
        { id: "mock3", name: "Charlie", amount: subscription.amount / 4 },
        { id: "mock4", name: "Dana", amount: subscription.amount / 4 },
      ]);
      return;
    }

    // For non-subscription pools, use a default amount
    // In a real app, this would come from the API
    setAmount(25);
    
    // Mock contributors for default pool
    setAvailableContributors([
      { id: "mock1", name: "Alice", amount: 25 / 4 },
      { id: "mock2", name: "Bob", amount: 25 / 4 },
      { id: "mock3", name: "Charlie", amount: 25 / 4 },
      { id: "mock4", name: "Dana", amount: 25 / 4 },
    ]);
    
  }, [poolId, navigate]);

  if (amount <= 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <PageTransition>
      <ContributorForm 
        poolId={poolId || "demo"} 
        amount={amount}
        availableContributors={availableContributors}
      />
    </PageTransition>
  );
};

export default Contributor;
