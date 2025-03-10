
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "../hooks/use-toast";
import { Euro } from "lucide-react";
import { FadeIn } from "../components/ui/animations";
import { createPool } from "../lib/firebase";

const Index = () => {
  const [amount, setAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsCreating(true);
      
      // Create a new pool in Firebase
      const poolId = await createPool(amountValue);
      
      // Navigate to the collector page with the new pool ID
      navigate(`/collect/${poolId}?amount=${amountValue}`);
    } catch (error) {
      console.error("Error creating pool:", error);
      toast({
        title: "Error",
        description: "Failed to create payment pool. Please try again.",
        variant: "destructive"
      });
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-4 border-b border-border">
        <div className="container max-w-6xl">
          <img src="OnePool.png" alt="OnePool Logo" className="logo-image primary-logo" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <FadeIn className="w-full max-w-lg">
          <div className="text-center mb-8">
            <FadeIn>
              <h1 className="text-4xl font-bold mb-3">Split Payments Simplified</h1>
              <p className="text-xl text-muted-foreground">
                Easily split payments among friends, family, or colleagues
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.1}>
            <div className="glass-card p-8 mb-6">
              <h2 className="text-2xl font-semibold mb-6">Create a Payment Pool</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="amount" className="block text-sm font-medium mb-2">
                    Max Amount Spendable
                  </label>
                  <div className="relative">
                    <input
                      id="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input-field pl-12 pr-12 text-lg w-full"
                      placeholder="0.00"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Euro size={20} />
                    </div>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="btn-primary w-full text-base" 
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-t-white/0 border-white rounded-full animate-spin mr-2"></div>
                      Creating...
                    </span>
                  ) : (
                    "Create Payment Pool"
                  )}
                </button>
              </form>
            </div>
          </FadeIn>

          <FadeIn delay={0.3} className="text-center">
            <p className="text-muted-foreground">
              Simple payment splitting for any occasion
            </p>
          </FadeIn>
        </FadeIn>
      </main>

      <footer className="py-6 px-4 border-t border-border">
        <div className="container max-w-6xl text-center text-sm text-muted-foreground">
          OnePool © {new Date().getFullYear()} — All rights reserved
        </div>
      </footer>
    </div>
  );
};

export default Index;
