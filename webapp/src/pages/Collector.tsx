
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Euro, Users, Plus, Check, Clipboard } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { SlideTransition } from "@/components/ui/SlideTransition";
import { ContributorCard } from "@/components/ui/ContributorCard";
import { 
  getPool, 
  updatePoolContributors, 
  Contributor,
  getSubscriptionTemplates
} from "../lib/firebase";
import { generatePaymentLink } from "../utils/generateLinks";

const Collector = () => {
  const { poolId = "demo" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [totalAmount, setTotalAmount] = useState(0);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [editingContributorId, setEditingContributorId] = useState<string | null>(null);
  const [subscriptionName, setSubscriptionName] = useState("Payment");
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  // Fetch pool data on component mount
  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        if (poolId === "demo") {
          // For demo pool, use the search param amount or default
          const amountParam = searchParams.get("amount");
          const amount = amountParam ? parseFloat(amountParam) : 0;
          
          if (!amountParam || isNaN(amount) || amount <= 0) {
            navigate("/");
            return;
          }
          
          setTotalAmount(amount);
          setRemainingAmount(amount);
          setContributors([]);
        } else {
          // Fetch real pool data from Firebase
          const pool = await getPool(poolId);
          
          if (!pool) {
            toast({
              title: "Pool not found",
              description: "The requested payment pool doesn't exist",
              variant: "destructive"
            });
            navigate("/");
            return;
          }
          
          setTotalAmount(pool.totalAmount);
          setContributors(pool.contributors || []);
          setSubscriptionName(pool.subscriptionName || "Payment");
          
          // Calculate remaining amount
          const allocatedAmount = pool.contributors.reduce(
            (sum, contributor) => sum + contributor.amount, 
            0
          );
          setRemainingAmount(parseFloat((pool.totalAmount - allocatedAmount).toFixed(2)));
        }
      } catch (error) {
        console.error("Error fetching pool:", error);
        toast({
          title: "Error",
          description: "Failed to load payment pool data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check if poolId matches a subscription template
    const checkForSubscriptionTemplate = async () => {
      try {
        const templates = await getSubscriptionTemplates();
        const template = templates[poolId];
        
        if (template) {
          setTotalAmount(template.amount);
          setRemainingAmount(template.amount);
          setSubscriptionName(template.name);
        }
      } catch (error) {
        console.error("Error checking subscription templates:", error);
      }
    };
    
    checkForSubscriptionTemplate();
    fetchPoolData();
  }, [poolId, searchParams, navigate, toast]);

  // Update remaining amount when contributors change
  useEffect(() => {
    const allocated = contributors.reduce((sum, contributor) => sum + contributor.amount, 0);
    setRemainingAmount(parseFloat((totalAmount - allocated).toFixed(2)));
  }, [contributors, totalAmount]);

  const addContributor = () => {
    const newContributor: Contributor = {
      id: Math.random().toString(36).substring(2, 10),
      name: `Person ${contributors.length + 1}`,
      amount: 0,
      isEditing: true
    };
    
    setContributors([...contributors, newContributor]);
    setEditingContributorId(newContributor.id);
    
    setTimeout(() => {
      const element = document.getElementById(`contributor-${newContributor.id}`);
      element?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  const removeContributor = (id: string) => {
    setContributors(contributors.filter(c => c.id !== id));
  };

  const updateContributorAmount = (id: string, amount: number) => {
    setContributors(
      contributors.map(c => 
        c.id === id ? { ...c, amount } : c
      )
    );
  };

  const updateContributorName = (id: string, name: string) => {
    setContributors(
      contributors.map(c => 
        c.id === id ? { ...c, name } : c
      )
    );
  };

  const distributeEvenly = () => {
    if (contributors.length === 0) {
      toast({
        title: "No contributors",
        description: "Add contributors first to distribute the amount",
        variant: "destructive"
      });
      return;
    }
    
    const evenAmount = totalAmount / contributors.length;
    const updatedContributors = contributors.map(c => ({
      ...c,
      amount: parseFloat(evenAmount.toFixed(2))
    }));
    
    setContributors(updatedContributors);
  };

  const toggleEditing = (id: string) => {
    setContributors(
      contributors.map(c => 
        c.id === id ? { ...c, isEditing: !c.isEditing } : c
      )
    );
    
    setEditingContributorId(
      editingContributorId === id ? null : id
    );
  };

  const saveContributors = async () => {
    if (contributors.length === 0) {
      toast({
        title: "No contributors",
        description: "Add contributors first to save",
        variant: "destructive"
      });
      return;
    }
    
    if (contributors.some(c => !c.name || c.name.trim() === "")) {
      toast({
        title: "Missing names",
        description: "Please provide names for all contributors",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // If this is not a demo pool, save to Firebase
      if (poolId !== "demo") {
        await updatePoolContributors(poolId, contributors);
      }
      
      toast({
        title: "Contributors saved",
        description: `Saved ${contributors.length} contributors to the pool`
      });
    } catch (error) {
      console.error("Error saving contributors:", error);
      toast({
        title: "Error",
        description: "Failed to save contributors",
        variant: "destructive"
      });
    }
  };

  const getPaymentLink = () => generatePaymentLink(poolId);

  const copyPaymentLink = () => {
    navigator.clipboard.writeText(getPaymentLink());
    toast({
      title: "Link copied",
      description: "Payment link copied to clipboard"
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (totalAmount <= 0) return null;

  return (
    <SlideTransition>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <FadeIn>
          <div className="mb-8">
            <div className="chip mb-2 bg-primary/10 text-primary">PAYMENT REQUEST</div>
            <h1 className="text-3xl font-semibold mb-2">Split {subscriptionName}</h1>
            <p className="text-muted-foreground">
              Add contributors and distribute the payment amount
            </p>
          </div>

          <div className="glass-card p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="p-2.5 rounded-full bg-primary/10 text-primary mr-3">
                  <Euro size={18} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <div className="flex items-center">
                    <span className="text-2xl font-semibold">{totalAmount.toFixed(2)}</span>
                    <Euro size={16} className="ml-1 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div>
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 border border-input rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-start">
                <div className="p-2.5 rounded-full bg-primary/10 text-primary mr-3 mt-1">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contributors</p>
                  <p className="text-xl font-medium">{contributors.length}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <div
                  className={`text-xl font-medium ${
                    remainingAmount !== 0 ? "text-amber-500" : "text-emerald-500"
                  }`}
                >
                  {remainingAmount.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Contributors</h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={distributeEvenly}
              className="px-4 py-2 border border-input rounded-lg text-sm font-medium hover:bg-secondary transition-colors flex items-center"
              disabled={contributors.length === 0}
            >
              <Users size={16} className="mr-2" />
              Split Evenly
            </button>
            <button onClick={addContributor} className="btn-primary flex items-center">
              <Plus size={16} className="mr-2" />
              Add Person
            </button>
          </div>

          {contributors.length === 0 ? (
            <FadeIn>
              <div className="glass-card p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
                  <Users size={24} />
                </div>
                <h3 className="text-lg font-medium mb-2">No Contributors Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add people to split the payment amount
                </p>
                <button
                  onClick={addContributor}
                  className="btn-primary inline-flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add Person
                </button>
              </div>
            </FadeIn>
          ) : (
            <>
              <FadeIn delay={0.1} className="mb-6">
                {contributors.map((contributor, index) => (
                  <div
                    id={`contributor-${contributor.id}`}
                    key={contributor.id}
                    className="relative mb-4 group"
                    onClick={() => toggleEditing(contributor.id)}
                  >
                    <ContributorCard
                      contributor={contributor}
                      totalAmount={totalAmount}
                      onRemove={removeContributor}
                      onEdit={updateContributorAmount}
                      onNameChange={updateContributorName}
                      index={index}
                    />
                  </div>
                ))}
              </FadeIn>

              {remainingAmount === 0 && (
                <div className="flex justify-end mb-6">
                  <button onClick={saveContributors} className="btn-primary">
                    Save Contributors
                  </button>
                </div>
              )}
            </>
          )}

          {contributors.length > 0 && (
            <FadeIn>
              <div className="glass-card p-5 mb-6">
                <h3 className="font-medium mb-3">Contributor Payment Link</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share this link with all contributors to collect their payments
                </p>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="font-medium">{subscriptionName} Payment Link</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs truncate max-w-[150px] text-muted-foreground">
                      {getPaymentLink().substring(0, 20)}...
                    </div>
                    <button
                      onClick={copyPaymentLink}
                      className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Clipboard size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}
        </FadeIn>
      </div>
    </SlideTransition>
  );
};

export default Collector;
