
import React from "react";
import { Check, Clock, AlertCircle } from "lucide-react";
import { Contributor } from "./ContributorCard";

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
  const paidContributors = contributors.filter(c => c.hasPaid).length;
  const verifiedContributors = contributors.filter(c => c.hasVerified).length;
  const pendingContributors = contributors.filter(c => c.hasVerified && !c.hasPaid).length;
  const notStartedContributors = contributors.filter(c => !c.hasVerified && !c.hasPaid).length;

  const completionPercentage = totalContributors > 0 
    ? Math.round((paidContributors / totalContributors) * 100) 
    : 0;

  return (
    <div className="glass-card p-5 mb-6">
      <h3 className="font-medium mb-4">Payment Status</h3>
      
      <div className="mb-4">
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{paidContributors} of {totalContributors} paid</span>
          <span>{completionPercentage}% complete</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="px-3 py-2 bg-emerald-50 rounded-lg">
          <div className="flex items-center text-emerald-600 mb-1">
            <Check size={14} className="mr-1" />
            <span className="text-xs font-medium">Paid</span>
          </div>
          <p className="text-lg font-semibold">{paidContributors}</p>
        </div>
        
        <div className="px-3 py-2 bg-amber-50 rounded-lg">
          <div className="flex items-center text-amber-600 mb-1">
            <Clock size={14} className="mr-1" />
            <span className="text-xs font-medium">Pending</span>
          </div>
          <p className="text-lg font-semibold">{pendingContributors}</p>
        </div>
        
        <div className="px-3 py-2 bg-red-50 rounded-lg">
          <div className="flex items-center text-red-600 mb-1">
            <AlertCircle size={14} className="mr-1" />
            <span className="text-xs font-medium">Not Started</span>
          </div>
          <p className="text-lg font-semibold">{notStartedContributors}</p>
        </div>
      </div>
      
      <div className="border-t border-border pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total to be collected:</span>
          <span className="font-medium">{totalAmount.toFixed(2)} €</span>
        </div>
        
        <div className="flex justify-between text-sm mt-1">
          <span className="text-muted-foreground">Amount collected:</span>
          <span className="font-medium text-emerald-600">
            {(paidContributors / totalContributors * totalAmount).toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
};
