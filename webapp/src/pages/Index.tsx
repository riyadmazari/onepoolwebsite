
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { FadeIn } from "../components/ui/animations";
import { generateTestCollectorLink } from "../utils/generateLinks";
import { Copy, ArrowRight, Euro } from "lucide-react";

const Index = () => {
  const [amount, setAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [testLink, setTestLink] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsCreating(true);
      // Generate a test link with the amount
      const link = generateTestCollectorLink(numAmount);
      setTestLink(link);
      setTimeout(() => {
        setIsCreating(false);
      }, 500);
    } catch (error) {
      console.error("Error creating test link:", error);
      toast({
        title: "Error",
        description: "Failed to create test link. Please try again.",
        variant: "destructive"
      });
      setIsCreating(false);
    }
  };

  const handleNavigateToLink = () => {
    if (testLink) {
      // Extract the path from the full URL
      const url = new URL(testLink);
      const path = url.pathname + url.search;
      navigate(path);
    }
  };

  const copyToClipboard = () => {
    if (testLink) {
      navigator.clipboard.writeText(testLink);
      toast({
        title: "Link copied",
        description: "Test collector link copied to clipboard"
      });
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
              <h1 className="text-4xl font-bold mb-3">B2B Checkout Solution</h1>
              <p className="text-xl text-muted-foreground">
                Create a test collector link with an amount
              </p>
            </FadeIn>
          </div>
          
          <FadeIn delay={0.1}>
            <div className="glass-card p-8 mb-6">
              <h2 className="text-2xl font-semibold mb-6">Test Collector Link</h2>
              <form onSubmit={handleCreatePool}>
                <div className="mb-6">
                  <label htmlFor="amount" className="block text-sm font-medium mb-2">
                    Total Amount
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
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      €
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
                    "Create Collector Link"
                  )}
                </button>
              </form>

              {testLink && (
                <div className="mt-6 p-4 border border-border rounded-lg bg-secondary/10">
                  <p className="font-medium mb-2">Test Link Generated:</p>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="truncate text-sm text-muted-foreground">
                      {testLink}
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={handleNavigateToLink}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    Open Collector Page
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              )}
            </div>
          </FadeIn>
          
          <FadeIn delay={0.3} className="text-center">
            <p className="text-muted-foreground">
              This page is for testing purposes only. In production, collector links will be created by merchants.
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
