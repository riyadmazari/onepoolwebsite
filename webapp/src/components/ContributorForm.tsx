
import { useState, useEffect } from "react";
import { User, CreditCard, Check, ArrowRight, DollarSign, Euro, ChevronDown } from "lucide-react";
import { SlideTransition } from "@/components/ui/SlideTransition";
import { VerificationPayment } from "@/components/ui/VerificationPayment";
import { FadeIn, ScaleIn, SuccessCheckmark } from "@/components/ui/animations";
import { ContributorCard, Contributor } from "@/components/ui/ContributorCard";
import { useToast } from "@/hooks/use-toast";

interface ContributorFormProps {
  contributorId: string;
  poolId: string;
  amount: number;
  availableContributors?: Contributor[];
}

export const ContributorForm = ({
  contributorId,
  poolId,
  amount,
  availableContributors = [],
}: ContributorFormProps) => {
  const [step, setStep] = useState<"details" | "verification" | "success">("details");
  const [name, setName] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { toast } = useToast();
  
  const contributor = {
    id: contributorId,
    name: name || "You",
    amount: amount,
    hasVerified: step === "success",
    hasPaid: false,  // Only verified, not paid yet
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Name required",
        description: "Please select your name to continue",
        variant: "destructive",
      });
      return;
    }
    
    setStep("verification");
  };
  
  const handleVerificationSuccess = () => {
    setStep("success");
  };
  
  const handleVerificationCancel = () => {
    setStep("details");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectName = (selectedName: string) => {
    setName(selectedName);
    setIsDropdownOpen(false);
  };
  
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {step === "details" && (
        <SlideTransition>
          <div className="mb-8">
            <div className="chip mb-2 bg-primary/10 text-primary">
              PAYMENT REQUEST
            </div>
            <h1 className="text-3xl font-semibold mb-2">Your Payment</h1>
            <p className="text-muted-foreground">
              Complete the form below to make your payment
            </p>
          </div>
          
          <ScaleIn>
            <div className="glass-card p-5 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2.5 rounded-full bg-primary/10 text-primary mr-3">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Amount</p>
                    <div className="flex items-center">
                      <span className="text-2xl font-semibold">
                        {amount.toFixed(2)}
                      </span>
                      <Euro size={18} className="ml-1 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScaleIn>
          
          <ScaleIn delay={0.1}>
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="glass-card p-5">
                <h2 className="text-lg font-medium mb-4">Who Are You?</h2>
                
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Select Your Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <User size={18} />
                    </div>
                    
                    {availableContributors.length > 0 ? (
                      <div className="relative">
                        <button
                          type="button"
                          className="input-field pl-10 pr-10 w-full text-left flex justify-between items-center"
                          onClick={toggleDropdown}
                        >
                          {name || "Select your name"}
                          <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-lg shadow-lg z-10">
                            {availableContributors.map((contributor) => (
                              <button
                                key={contributor.id}
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors"
                                onClick={() => selectName(contributor.name)}
                              >
                                {contributor.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field pl-10 w-full"
                        placeholder="Enter your name"
                        required
                      />
                    )}
                  </div>
                  
                  {availableContributors.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose from the names provided by the collector
                    </p>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center"
                >
                  Continue to Verification
                  <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </form>
          </ScaleIn>
          
          <FadeIn delay={0.2}>
            <ContributorCard
              contributor={contributor}
              totalAmount={amount}
              isCollector={false}
            />
          </FadeIn>
        </SlideTransition>
      )}
      
      {step === "verification" && (
        <SlideTransition>
          <div className="mb-8">
            <div className="chip mb-2 bg-primary/10 text-primary">
              PAYMENT VERIFICATION
            </div>
            <h1 className="text-3xl font-semibold mb-2">Verify Payment</h1>
            <p className="text-muted-foreground">
              Complete a 0€ verification to confirm your payment method
            </p>
          </div>
          
          <VerificationPayment
            onSuccess={handleVerificationSuccess}
            onCancel={handleVerificationCancel}
          />
        </SlideTransition>
      )}
      
      {step === "success" && (
        <SlideTransition>
          <div className="text-center mb-8">
            <div className="text-emerald-500 mb-4 inline-block">
              <SuccessCheckmark size={80} />
            </div>
            <h1 className="text-3xl font-semibold mb-2">Verification Complete!</h1>
            <p className="text-muted-foreground">
              Thank you, {name}. Your payment method has been successfully verified.
              The collector will process the payment once all participants have verified their payment methods.
            </p>
          </div>
          
          <ScaleIn>
            <div className="glass-card p-5 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2.5 rounded-full bg-emerald-100 text-emerald-600 mr-3">
                    <Check size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verified Amount</p>
                    <div className="flex items-center">
                      <span className="text-2xl font-semibold">
                        {amount.toFixed(2)}
                      </span>
                      <Euro size={18} className="ml-1 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                
                <div className="chip bg-emerald-100 text-emerald-700">
                  Verified
                </div>
              </div>
            </div>
          </ScaleIn>
          
          <FadeIn delay={0.2}>
            <ContributorCard
              contributor={contributor}
              totalAmount={amount}
              isCollector={false}
            />
          </FadeIn>
        </SlideTransition>
      )}
    </div>
  );
};
