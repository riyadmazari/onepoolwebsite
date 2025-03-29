
import React from "react";
import { FadeIn } from "../components/ui/animations";
import { StripeConnect } from "../components/ui/StripeConnect";

const ConnectStripePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="py-6 px-4 border-b border-border">
        <div className="container max-w-7xl mx-auto">
          <img src="/OnePool.png" alt="OnePool Logo" className="logo-image primary-logo" />
        </div>
      </header>
      
      <main className="container max-w-7xl mx-auto px-4 py-12">
        <FadeIn>
          <StripeConnect />
        </FadeIn>
      </main>
      
      <footer className="py-6 px-4 border-t border-border">
        <div className="container max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          OnePool © {new Date().getFullYear()} — All rights reserved
        </div>
      </footer>
    </div>
  );
};

export default ConnectStripePage;
