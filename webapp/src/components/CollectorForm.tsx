import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Plus, Users, DollarSign, Send, Link, Euro, Copy } from "lucide-react";
import { ContributorCard, Contributor } from "@/components/ui/ContributorCard";
import { LinkShare } from "@/components/ui/LinkShare";
import { SlideTransition, StaggerChildren } from "@/components/ui/SlideTransition";
import { FadeIn, ScaleIn } from "@/components/ui/animations";
import { 
  generatePaymentLink, 
  generateUniqueId, 
  distributeAmountEvenly,
  calculateRemainingAmount
} from "@/utils/generateLinks";
import { useToast } from "@/hooks/use-toast";

interface CollectorFormProps {
  totalAmount: number;
  poolId?: string;
  subscriptionName?: string;
}

export const CollectorForm = ({ 
  totalAmount, 
  poolId = "demo",
  subscriptionName = "Payment"
}: CollectorFormProps) => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [remainingAmount, setRemainingAmount] = useState<number>(totalAmount);
  const [selectedContributor, setSelectedContributor] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    setRemainingAmount(calculateRemainingAmount(contributors, totalAmount));
  }, [contributors, totalAmount]);
  
  const addContributor = () => {
    const newContributor: Contributor = {
      id: generateUniqueId(),
      name: `Person ${contributors.length + 1}`,
      amount: 0,
      isEditing: true
    };
    
    setContributors(prev => [...prev, newContributor]);
    setSelectedContributor(newContributor.id);
    
    setTimeout(() => {
      const element = document.getElementById(`contributor-${newContributor.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };
  
  const removeContributor = (id: string) => {
    setContributors(prev => prev.filter(c => c.id !== id));
  };
  
  const updateContributorAmount = (id: string, amount: number) => {
    setContributors(prev => 
      prev.map(c => c.id === id ? { ...c, amount } : c)
    );
  };
  
  const updateContributorName = (id: string, name: string) => {
    setContributors(prev => 
      prev.map(c => c.id === id ? { ...c, name } : c)
    );
  };
  
  const distributeFairly = () => {
    if (contributors.length === 0) {
      toast({
        title: "No contributors",
        description: "Add contributors first to distribute the amount",
        variant: "destructive"
      });
      return;
    }
    
    setContributors(distributeAmountEvenly(contributors, totalAmount));
  };
  
  const sendContributorLink = () => {
    toast({
      title: "Link shared",
      description: "Payment link has been shared with contributors",
    });
  };

  const toggleEditMode = (id: string) => {
    setContributors(prev => 
      prev.map(c => c.id === id ? { ...c, isEditing: !c.isEditing } : c)
    );
  };

  const saveContributors = () => {
    if (contributors.length === 0) {
      toast({
        title: "No contributors",
        description: "Add contributors first to save",
        variant: "destructive"
      });
      return;
    }

    const missingNames = contributors.some(c => !c.name || c.name.trim() === "");
    if (missingNames) {
      toast({
        title: "Missing names",
        description: "Please provide names for all contributors",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Contributors saved",
      description: `Saved ${contributors.length} contributors to the pool`,
    });
  };

  const getContributorLink = () => {
    return generatePaymentLink(poolId);
  };
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <SlideTransition>
        <div className="mb-8">
          <div className="chip mb-2 bg-primary/10 text-primary">
            PAYMENT REQUEST
          </div>
          <h1 className="text-3xl font-semibold mb-2">Split {subscriptionName}</h1>
          <p className="text-muted-foreground">
            Add contributors and distribute the payment amount
          </p>
        </div>
        
        <div className="glass-card p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="p-2.5 rounded-full bg-primary/10 text-primary mr-3">
                <DollarSign size={18} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <div className="flex items-center">
                  <span className="text-2xl font-semibold">
                    {totalAmount.toFixed(2)}
                  </span>
                  <Euro size={16} className="ml-1 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div>
              <button 
                onClick={() => navigate(`/`)} 
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
              <div className={`text-xl font-medium ${remainingAmount !== 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {remainingAmount.toFixed(2)} €
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Contributors</h2>
          
          <div className="flex gap-2">
            <button
              onClick={distributeFairly}
              className="px-4 py-2 border border-input rounded-lg text-sm font-medium hover:bg-secondary transition-colors flex items-center"
              disabled={contributors.length === 0}
            >
              <Users size={16} className="mr-2" />
              Split Evenly
            </button>
            
            <button
              onClick={addContributor}
              className="btn-primary flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Add Person
            </button>
          </div>
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
            <StaggerChildren
              staggerDelay={0.05}
              className="mb-6"
            >
              {contributors.map((contributor, index) => (
                <div 
                  key={contributor.id}
                  id={`contributor-${contributor.id}`}
                  className="relative mb-4 group"
                  onClick={() => toggleEditMode(contributor.id)}
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
            </StaggerChildren>
            
            {remainingAmount === 0 && (
              <div className="flex justify-end mb-6">
                <button
                  onClick={saveContributors}
                  className="btn-primary"
                >
                  Save Contributors
                </button>
              </div>
            )}
          </>
        )}
        
        {contributors.length > 0 && (
          <>
            <ScaleIn className="mb-6">
              <LinkShare
                link={window.location.href}
                title="Payment Collection Link"
                description="Share this link with others to manage this payment split"
              />
            </ScaleIn>
            
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
                      {getContributorLink().substring(0, 20)}...
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getContributorLink());
                        toast({
                          title: "Link copied",
                          description: "Payment link copied to clipboard"
                        });
                      }}
                      className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          </>
        )}
      </SlideTransition>
    </div>
  );
};
