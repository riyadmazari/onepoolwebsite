
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Euro } from "lucide-react";
import { generateUniqueId } from "@/utils/generateLinks";
import { SlideTransition } from "@/components/ui/SlideTransition";
import { FadeIn, ScaleIn } from "@/components/ui/animations";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Generate a unique pool ID - in a real app, this would come from the API
    const poolId = generateUniqueId();
    
    // Navigate to collector page directly with the amount
    setTimeout(() => {
      navigate(`/collect/${poolId}?amount=${parsedAmount}`);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-4 border-b border-border">
        <div className="container max-w-6xl">
        <img src="OnePool.png" alt="OnePool Logo" className="logo-image primary-logo" />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <SlideTransition className="w-full max-w-lg">
          <div className="text-center mb-8">
            <FadeIn>
              <h1 className="text-4xl font-bold mb-3">Split Payments Simplified</h1>
              <p className="text-xl text-muted-foreground">
                Easily split payments among friends, family, or colleagues
              </p>
            </FadeIn>
          </div>
          
          <ScaleIn delay={0.1}>
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-t-white/0 border-white rounded-full animate-spin mr-2" />
                      Creating...
                    </span>
                  ) : (
                    "Create Payment Pool"
                  )}
                </button>
              </form>
            </div>
          </ScaleIn>
          
          <FadeIn delay={0.3} className="text-center">
            <p className="text-muted-foreground">
              Simple payment splitting for any occasion
            </p>
          </FadeIn>
        </SlideTransition>
      </main>
      
      <footer className="py-6 px-4 border-t border-border">
        <div className="container max-w-6xl text-center text-sm text-muted-foreground">
          OnePool &copy; {new Date().getFullYear()} — All rights reserved
        </div>
      </footer>
    </div>
  );
};

export default Index;
