
import { useState } from "react";
import { Check, CreditCard, Euro } from "lucide-react";
import { motion } from "framer-motion";
import { SlideTransition, StaggerChildren } from "./SlideTransition";
import { FadeIn, SuccessCheckmark } from "./animations";
import { useToast } from "@/hooks/use-toast";

interface VerificationPaymentProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const VerificationPayment = ({ onSuccess, onCancel }: VerificationPaymentProps) => {
  const [step, setStep] = useState<"initial" | "processing" | "success">("initial");
  const { toast } = useToast();

  const handleVerify = () => {
    setStep("processing");
    
    // Simulate verification process
    setTimeout(() => {
      setStep("success");
      toast({
        title: "Verification successful",
        description: "Your payment method has been verified",
      });
      
      // Trigger success callback after showing success state
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {step === "initial" && (
        <SlideTransition>
          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <CreditCard size={24} />
            </div>
            
            <h3 className="text-xl font-medium text-center mb-2">
              Verification Payment
            </h3>
            
            <p className="text-muted-foreground text-center mb-6">
              We'll make a temporary 0€ verification charge to confirm your payment method
            </p>
            
            <div className="flex items-center justify-center mb-6">
              <div className="px-5 py-3 bg-primary/5 rounded-lg flex items-center justify-center">
                <span className="font-medium text-2xl">0.00</span>
                <Euro size={20} className="ml-1 text-muted-foreground" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2.5 border border-input rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                className="btn-primary"
              >
                Verify
              </button>
            </div>
          </div>
        </SlideTransition>
      )}
      
      {step === "processing" && (
        <SlideTransition>
          <div className="glass-card p-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/30 animate-spin mb-6" />
            <h3 className="text-xl font-medium mb-2">Processing</h3>
            <p className="text-muted-foreground text-center">
              Verifying your payment method...
            </p>
          </div>
        </SlideTransition>
      )}
      
      {step === "success" && (
        <SlideTransition>
          <div className="glass-card p-6 flex flex-col items-center">
            <div className="text-emerald-500 mb-4">
              <SuccessCheckmark size={64} />
            </div>
            <h3 className="text-xl font-medium mb-2">Verification Complete!</h3>
            <p className="text-muted-foreground text-center">
              Your payment method has been successfully verified
            </p>
          </div>
        </SlideTransition>
      )}
    </div>
  );
};
