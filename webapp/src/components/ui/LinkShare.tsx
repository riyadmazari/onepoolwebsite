
import { useState } from "react";
import { Link, Copy, Check, Share2 } from "lucide-react";
import { ScaleIn, Pulse } from "./animations";
import { useToast } from "@/hooks/use-toast";

interface LinkShareProps {
  link: string;
  title?: string;
  description?: string;
  showCopyButton?: boolean;
  showShareButton?: boolean;
  className?: string;
}

export const LinkShare = ({
  link,
  title = "Payment Link",
  description = "Share this link with others to collect payment",
  showCopyButton = true,
  showShareButton = true,
  className = "",
}: LinkShareProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Payment link copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "OnePool Payment",
          text: "Here's your payment link",
          url: link,
        });
        
        toast({
          title: "Link shared!",
          description: "You've successfully shared the payment link",
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <ScaleIn className={`glass-card p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-full bg-primary/10">
          <Link size={16} className="text-primary" />
        </div>
        <h3 className="font-medium">{title}</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      
      <div className="flex items-center">
        <div className="flex-1 p-2.5 bg-secondary/50 rounded-l-lg border-y border-l border-border truncate text-sm">
          {link.length > 40 ? `${link.substring(0, 40)}...` : link}
        </div>
        
        {showCopyButton && (
          <button
            onClick={copyToClipboard}
            className="p-2.5 bg-secondary border-y border-r border-l-0 border-border text-primary hover:bg-secondary/80 transition-colors"
            aria-label="Copy link"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        )}
        
        {showShareButton && (
          <button
            onClick={shareLink}
            className="p-2.5 bg-primary text-primary-foreground rounded-r-lg hover:bg-primary/90 transition-colors"
            aria-label="Share link"
          >
            <Share2 size={18} />
          </button>
        )}
      </div>
    </ScaleIn>
  );
};
