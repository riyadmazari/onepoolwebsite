
import React from "react";
import { Check, Clock, AlertCircle } from "lucide-react";

interface Contributor {
  id: string;
  name: string;
  amount: number;
  hasVerified?: boolean;
  hasPaid?: boolean;
  isEditing?: boolean;
}

interface ContributorStatusProps {
  contributors: Contributor[];
  totalAmount: number;
}

export const ContributorStatus: React.FC<ContributorStatusProps> = ({
  contributors,
  totalAmount,
}) => {
  if (contributors.length === 0) {
    return null;
  }

  const totalContributors = contributors.length;
  const verifiedContributors = contributors.filter(c => c.hasVerified).length;
  const paidContributors = contributors.filter(c => c.hasPaid).length;
  const pendingContributors = contributors.filter(c => !c.hasVerified).length;

  const verificationPercentage = totalContributors > 0 
    ? Math.round((verifiedContributors / totalContributors) * 100) 
    : 0;

  return (
    <div className="glass-card p-5 mb-6">
      <h3 className="font-medium mb-4">Verification Status</h3>
      
      <div className="mb-4">
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${verificationPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{verifiedContributors} of {totalContributors} verified</span>
          <span>{verificationPercentage}% complete</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="px-3 py-2 bg-emerald-50 rounded-lg">
          <div className="flex items-center text-emerald-600 mb-1">
            <Check size={14} className="mr-1" />
            <span className="text-xs font-medium">Verified</span>
          </div>
          <p className="text-lg font-semibold">{verifiedContributors}</p>
        </div>
        
        <div className="px-3 py-2 bg-amber-50 rounded-lg">
          <div className="flex items-center text-amber-600 mb-1">
            <Clock size={14} className="mr-1" />
            <span className="text-xs font-medium">Pending</span>
          </div>
          <p className="text-lg font-semibold">{pendingContributors}</p>
        </div>
        
        <div className="px-3 py-2 bg-emerald-50 rounded-lg">
          <div className="flex items-center text-emerald-600 mb-1">
            <Check size={14} className="mr-1" />
            <span className="text-xs font-medium">Ready to pay</span>
          </div>
          <p className="text-lg font-semibold">{paidContributors}</p>
        </div>
      </div>
      
      <div className="border-t border-border pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total to be collected:</span>
          <span className="font-medium">{totalAmount.toFixed(2)} €</span>
        </div>
        
        <div className="flex justify-between text-sm mt-1">
          <span className="text-muted-foreground">Cards verified:</span>
          <span className="font-medium text-emerald-600">
            {verifiedContributors} of {totalContributors}
          </span>
        </div>
      </div>
    </div>
  );
};
