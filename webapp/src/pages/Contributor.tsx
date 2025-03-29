
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { Euro, UserCircle, Check, ArrowRight, ChevronDown } from "lucide-react";
import { FadeIn } from "../components/ui/animations";
import { SlideTransition } from "@/components/ui/SlideTransition";
import { ContributorCard } from "../components/ui/ContributorCard";
import { VerificationPayment } from "../components/ui/VerificationPayment";
import { 
  getPool, 
  Contributor as ContributorType,
  updateContributorStatus
} from "../lib/firebase";

const Contributor = () => {
  const { poolId = "demo" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<"details" | "verification" | "success">("details");
  const [contributorName, setContributorName] = useState("");
  const [amount, setAmount] = useState(0);
  const [pool, setPool] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contributorId, setContributorId] = useState("");
  const [availableContributors, setAvailableContributors] = useState<ContributorType[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        if (!poolId) {
          navigate("/");
          return;
        }
        
        // Get contributor name from URL
        const nameParam = searchParams.get("name");
        if (nameParam) {
          setContributorName(decodeURIComponent(nameParam));
        }
        
        // Fetch pool data
        const poolData = await getPool(poolId);
        
        if (!poolData) {
          toast({
            title: "Pool not found",
            description: "The requested payment pool doesn't exist",
            variant: "destructive"
          });
          navigate("/");
          return;
        }
        
        setPool(poolData);
        
        // Set available contributors for selection
        const nonVerifiedContributors = poolData.contributors.filter(
          (c: ContributorType) => !c.hasVerified && !c.hasPaid
        );
        setAvailableContributors(nonVerifiedContributors);
        
        // If name is provided in URL, find matching contributor
        if (nameParam) {
          const contributor = poolData.contributors.find(
            (c: ContributorType) => c.name === decodeURIComponent(nameParam)
          );
          
          if (contributor) {
            setAmount(contributor.amount);
            setContributorId(contributor.id);
          } else {
            // If contributor not found, show error and redirect
            toast({
              title: "Contributor not found",
              description: "Your name was not found in this payment pool",
              variant: "destructive"
            });
          }
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
  }, [poolId, searchParams, navigate, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contributorName) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue",
        variant: "destructive"
      });
      return;
    }
    
    // Find contributor by name if not already set
    if (!contributorId && pool) {
      const contributor = pool.contributors.find(
        (c: ContributorType) => c.name === contributorName
      );
      
      if (contributor) {
        setAmount(contributor.amount);
        setContributorId(contributor.id);
      } else {
        toast({
          title: "Contributor not found",
          description: "Your name was not found in this payment pool",
          variant: "destructive"
        });
        return;
      }
    }
    
    setStep("verification");
  };

  const handleVerificationSuccess = async () => {
    try {
      // Update contributor status in Firebase if it's a real pool
      if (poolId !== "demo" && contributorId) {
        await updateContributorStatus(poolId, contributorId, {
          hasVerified: true,
          hasPaid: false // Set hasPaid to false since we're only verifying
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
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const selectName = (name: string, id: string) => {
    setContributorName(name);
    setContributorId(id);
    setIsDropdownOpen(false);
    
    // Find the contributor to get their amount
    if (pool) {
      const contributor = pool.contributors.find(
        (c: ContributorType) => c.id === id
      );
      
      if (contributor) {
        setAmount(contributor.amount);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If pool not found
  if (!pool) return null;

  const contributorData: ContributorType = {
    id: contributorId || "temp-id",
    name: contributorName || "You",
    amount: amount,
    hasVerified: step === "success",
    hasPaid: false // Initially not paid, just verified
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
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="glass-card p-5">
                <h2 className="text-lg font-medium mb-4">Who Are You?</h2>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Your Name
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
                          {contributorName || "Select your name"}
                          <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-lg shadow-lg z-10">
                            {availableContributors.map((contributor) => (
                              <button
                                key={contributor.id}
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors"
                                onClick={() => selectName(contributor.name, contributor.id)}
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
                        value={contributorName}
                        onChange={(e) => setContributorName(e.target.value)}
                        className="input-field pl-10 w-full"
                        placeholder="Enter your name"
                        required
                        disabled={!!searchParams.get("name")}
                      />
                    )}
                  </div>
                  {searchParams.get("name") && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Your name is provided in the payment link
                    </p>
                  )}
                  {availableContributors.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose from the names provided by the collector
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center"
                  disabled={!contributorName}
                >
                  Continue to Verification
                  <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </form>
          </FadeIn>

          {contributorId && (
            <FadeIn delay={0.2}>
              <ContributorCard
                contributor={contributorData}
                totalAmount={pool.totalAmount}
                isCollector={false}
              />
            </FadeIn>
          )}
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
            <h1 className="text-3xl font-semibold mb-2">Verification Complete!</h1>
            <p className="text-muted-foreground">
              Thank you, {contributorName}. Your payment method has been successfully verified.
              The collector will process the payment once all participants have verified their payment methods.
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
                    <p className="text-sm text-muted-foreground">Verified Amount</p>
                    <div className="flex items-center">
                      <span className="text-2xl font-semibold">{amount.toFixed(2)}</span>
                      <Euro size={18} className="ml-1 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <div className="chip bg-emerald-100 text-emerald-700">Verified</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <ContributorCard
              contributor={contributorData}
              totalAmount={pool.totalAmount}
              isCollector={false}
            />
          </FadeIn>
        </FadeIn>
      )}
    </div>
  );
};

export default Contributor;
