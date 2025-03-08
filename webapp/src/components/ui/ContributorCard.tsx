
import { motion } from "framer-motion";
import { Check, X, User, DollarSign, Euro } from "lucide-react";
import { FadeIn, HoverScale } from "./animations";

export interface Contributor {
  id: string;
  name: string;
  amount: number;
  hasPaid?: boolean;
  hasVerified?: boolean;
  isEditing?: boolean;
}

interface ContributorCardProps {
  contributor: Contributor;
  totalAmount: number;
  onRemove?: (id: string) => void;
  onEdit?: (id: string, amount: number) => void;
  onNameChange?: (id: string, name: string) => void;
  isCollector?: boolean;
  index?: number;
}

export const ContributorCard = ({
  contributor,
  totalAmount,
  onRemove,
  onEdit,
  onNameChange,
  isCollector = true,
  index = 0,
}: ContributorCardProps) => {
  const percentage = (contributor.amount / totalAmount) * 100;

  return (
    <FadeIn delay={index * 0.1}>
      <HoverScale scale={1.02}>
        <div className="glass-card p-4 mb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User size={18} />
              </div>
              {isCollector && contributor.isEditing ? (
                <input
                  className="input-field py-1 px-2 text-sm w-[120px]"
                  value={contributor.name || ""}
                  onChange={(e) => onNameChange?.(contributor.id, e.target.value)}
                  placeholder="Name"
                  autoFocus
                />
              ) : (
                <div>
                  <p className="font-medium">{contributor.name || "Unnamed"}</p>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    {contributor.hasVerified && (
                      <div className="flex items-center text-emerald-600">
                        <Check size={12} className="mr-1" />
                        <span>Verified</span>
                      </div>
                    )}
                    {contributor.hasPaid && (
                      <div className="flex items-center text-emerald-600 ml-2">
                        <Check size={12} className="mr-1" />
                        <span>Paid</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isCollector && contributor.isEditing ? (
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field py-1 px-2 text-sm w-[100px]"
                  value={contributor.amount}
                  onChange={(e) => onEdit?.(contributor.id, parseFloat(e.target.value) || 0)}
                />
              ) : (
                <div className="flex items-center px-3 py-1.5 bg-primary/5 rounded-lg">
                  <span className="font-medium">
                    {contributor.amount.toFixed(2)}
                  </span>
                  <Euro size={14} className="ml-1 text-muted-foreground" />
                </div>
              )}
              
              {isCollector && onRemove && (
                <button
                  onClick={() => onRemove(contributor.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          
          {isCollector && (
            <div className="mt-3">
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full bg-primary"
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>{percentage.toFixed(1)}%</span>
                <span>of ${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </HoverScale>
    </FadeIn>
  );
};
