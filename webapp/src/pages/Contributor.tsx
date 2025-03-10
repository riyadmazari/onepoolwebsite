
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { Euro, UserCircle, Check, ArrowRight, ChevronDown } from "lucide-react";
import { FadeIn } from "../components/ui/animations";
import { SlideTransition } from "@/components/ui/SlideTransition";
import { ContributorCard } from "../components/ui/ContributorCard";
import { VerificationPayment } from "../components/ui/VerificationPayment";
import { 
  getPool, 
  Contributor as ContributorType,
  updateContributorStatus,
  getSubscriptionTemplates
} from "../lib/firebase";

const Contributor = () => {
  const { poolId = "demo" } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<"details" | "verification" | "success">("details");
  const [selectedName, setSelectedName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [availableContributors, setAvailableContributors] = useState<ContributorType[]>([]);
  const [subscriptionName, setSubscriptionName] = useState("Payment");
  const [isLoading, setIsLoading] = useState(true);
  const [contributorId, setContributorId] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        if (!poolId) {
          navigate("/");
          return;
        }
        
        // Check if poolId matches a subscription template
        const templates = await getSubscriptionTemplates();
        const template = templates[poolId];
        
        if (template) {
          setAmount(template.amount);
          setSubscriptionName(template.name);
          
          // Create mock contributors for subscription templates
          setAvailableContributors([
            { id: "mock1", name: "Alice", amount: template.amount / 4 },
            { id: "mock2", name: "Bob", amount: template.amount / 4 },
            { id: "mock3", name: "Charlie", amount: template.amount / 4 },
            { id: "mock4", name: "Dana", amount: template.amount / 4 }
          ]);
          setIsLoading(false);
          return;
        }
        
        // Fetch real pool data from Firebase
        const pool = await getPool(poolId);
        
        if (!pool) {
          // For demo or if pool not found, use defaults
          setAmount(25);
          setAvailableContributors([
            { id: "mock1", name: "Alice", amount: 25 / 4 },
            { id: "mock2", name: "Bob", amount: 25 / 4 },
            { id: "mock3", name: "Charlie", amount: 25 / 4 },
            { id: "mock4", name: "Dana", amount: 25 / 4 }
          ]);
        } else {
          setAmount(pool.totalAmount);
          setSubscriptionName(pool.subscriptionName || "Payment");
          setAvailableContributors(pool.contributors || []);
        }
      } catch (error) {
        console.error("Error fetching pool data:", error);
        toast({
          title: "Error",
          description: "Failed to load payment details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPoolData();
  }, [poolId, navigate, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedName) {
      toast({
        title: "Name required",
        description: "Please select your name to continue",
        variant: "destructive"
      });
      return;
    }
    
    // Find matching contributor id
    const contributor = availableContributors.find(c => c.name === selectedName);
    if (contributor) {
      setContributorId(contributor.id);
    }
    
    setStep("verification");
  };

  const handleVerificationSuccess = async () => {
    try {
      // Update contributor status in Firebase if it's a real pool
      if (poolId !== "demo" && contributorId) {
        await updateContributorStatus(poolId, contributorId, {
          hasVerified: true,
          hasPaid: true
        });
      }
      
      setStep("success");
      
      toast({
        title: "Verification successful",
        description: "Your payment method has been verified"
      });
    } catch (error) {
      console.error("Error updating contributor status:", error);
      setStep("success"); // Still show success to user even if update fails
    }
  };

  const handleCancel = () => {
    setStep("details");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const selectName = (name: string) => {
    setSelectedName(name);
    setDropdownOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (amount <= 0) return null;

  const contributor: ContributorType = {
    id: contributorId || "temp-id",
    name: selectedName || "You",
    amount,
    hasVerified: step === "success",
    hasPaid: step === "success"
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {step === "details" && (
        <FadeIn>
          <div className="mb-8">
            <div className="chip mb-2 bg-primary/10 text-primary">PAYMENT REQUEST</div>
            <h1 className="text-3xl font-semibold mb-2">Your Payment</h1>
            <p className="text-muted-foreground">
              Complete the form below to make your payment
            </p>
          </div>

          <FadeIn>
            <div className="glass-card p-5 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2.5 rounded-full bg-primary/10 text-primary mr-3">
                    <Euro size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Amount</p>
                    <div className="flex items-center">
                      <span className="text-2xl font-semibold">{amount.toFixed(2)}</span>
                      <Euro size={18} className="ml-1 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="glass-card p-5">
                <h2 className="text-lg font-medium mb-4">Who Are You?</h2>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Select Your Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <UserCircle size={18} />
                    </div>
                    {availableContributors.length > 0 ? (
                      <div className="relative">
                        <button
                          type="button"
                          className="input-field pl-10 pr-10 w-full text-left flex justify-between items-center"
                          onClick={toggleDropdown}
                        >
                          {selectedName || "Select your name"}
                          <ChevronDown
                            size={18}
                            className={`transition-transform ${
                              dropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {dropdownOpen && (
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
                        value={selectedName}
                        onChange={(e) => setSelectedName(e.target.value)}
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
                  Continue to Payment
                  <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </form>
          </FadeIn>

          <FadeIn delay={0.2}>
            <ContributorCard
              contributor={contributor}
              totalAmount={amount}
              isCollector={false}
            />
          </FadeIn>
        </FadeIn>
      )}

      {step === "verification" && (
        <FadeIn>
          <div className="mb-8">
            <div className="chip mb-2 bg-primary/10 text-primary">PAYMENT VERIFICATION</div>
            <h1 className="text-3xl font-semibold mb-2">Verify Payment</h1>
            <p className="text-muted-foreground">
              Complete a 0€ verification to confirm your payment method
            </p>
          </div>
          <VerificationPayment
            onSuccess={handleVerificationSuccess}
            onCancel={handleCancel}
          />
        </FadeIn>
      )}

      {step === "success" && (
        <FadeIn>
          <div className="text-center mb-8">
            <div className="text-emerald-500 mb-4 inline-block">
              <Check className="w-20 h-20 p-4 rounded-full bg-emerald-100" />
            </div>
            <h1 className="text-3xl font-semibold mb-2">Payment Complete!</h1>
            <p className="text-muted-foreground">
              Thank you, {selectedName}. Your payment has been successfully processed.
            </p>
          </div>

          <FadeIn>
            <div className="glass-card p-5 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2.5 rounded-full bg-emerald-100 text-emerald-600 mr-3">
                    <Check size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Paid Amount</p>
                    <div className="flex items-center">
                      <span className="text-2xl font-semibold">{amount.toFixed(2)}</span>
                      <Euro size={18} className="ml-1 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <div className="chip bg-emerald-100 text-emerald-700">Complete</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <ContributorCard
              contributor={contributor}
              totalAmount={amount}
              isCollector={false}
            />
          </FadeIn>
        </FadeIn>
      )}
    </div>
  );
};

export default Contributor;
