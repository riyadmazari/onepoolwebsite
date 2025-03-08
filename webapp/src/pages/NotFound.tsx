
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <FadeIn className="text-center">
        <h1 className="text-9xl font-bold text-primary/20">404</h1>
        <h2 className="text-2xl font-bold mt-6 mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been removed.
        </p>
        <Link 
          to="/" 
          className="btn-primary inline-flex items-center px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Home size={18} className="mr-2" />
          Return Home
        </Link>
      </FadeIn>
    </div>
  );
};

export default NotFound;
