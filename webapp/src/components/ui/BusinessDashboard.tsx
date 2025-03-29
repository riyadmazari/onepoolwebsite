// webapp/src/components/ui/BusinessDashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FadeIn } from "./animations";
import { 
  CreditCard, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  ExternalLink,
  Download,
  ArrowRight
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { createLoginLink } from "@/lib/stripe";

interface BusinessDashboardProps {
  business: any;
  stats: any;
  pools: any[];
  refreshData: () => Promise<void>;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ business, stats, pools, refreshData }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleOpenStripeDashboard = async () => {
    if (!business.stripeAccountId) {
      toast({
        title: "Stripe not connected",
        description: "Please connect your Stripe account first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const loginUrl = await createLoginLink(business.stripeAccountId);
      window.open(loginUrl, "_blank");
    } catch (error) {
      console.error("Error creating login link:", error);
      toast({
        title: "Error",
        description: "Failed to access Stripe dashboard",
        variant: "destructive"
      });
    }
  };

  const exportPoolsCSV = () => {
    if (pools.length === 0) return;
    
    const headers = ["Pool ID", "Created At", "Name", "Total Amount", "Status", "Contributors", "Verified", "Paid"];
    const rows = pools.map(pool => [
      pool.id,
      pool.createdAt ? new Date(pool.createdAt.toMillis()).toLocaleDateString() : "-",
      pool.subscriptionName,
      pool.totalAmount.toFixed(2),
      pool.status || "active",
      pool.contributors.length.toString(),
      pool.contributors.filter((c: any) => c.hasVerified).length.toString(),
      pool.contributors.filter((c: any) => c.hasPaid).length.toString()
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `onepool_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{business.name} Dashboard</h1>
          <p className="text-muted-foreground">{business.email}</p>
        </div>
        
        <div className="flex mt-4 md:mt-0 gap-3">
          <button
            onClick={handleOpenStripeDashboard}
            className="flex items-center px-4 py-2 border border-input rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
          >
            <ExternalLink size={16} className="mr-2" />
            Stripe Dashboard
          </button>
          <button
            onClick={exportPoolsCSV}
            className="flex items-center px-3 py-1.5 text-sm border border-input rounded-md hover:bg-secondary transition-colors"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>
      
      {stats && (
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4">
              <div className="flex items-center">
                <div className="p-2.5 rounded-full bg-primary/10 text-primary mr-3">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pools</p>
                  <p className="text-xl font-semibold">{stats.totalPools}</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-4">
              <div className="flex items-center">
                <div className="p-2.5 rounded-full bg-blue-50 text-blue-600 mr-3">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Pools</p>
                  <p className="text-xl font-semibold">{stats.activePools}</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-4">
              <div className="flex items-center">
                <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-600 mr-3">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-semibold">{stats.totalAmount.toFixed(2)} €</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-4">
              <div className="flex items-center">
                <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-600 mr-3">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Collected Amount</p>
                  <p className="text-xl font-semibold">{stats.collectedAmount.toFixed(2)} €</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}
      
      {pools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No payment transactions found.</p>
        </div>
      ) : (
        <div className="glass-card p-6">
          <h2 className="text-lg font-medium mb-4">Payment Transactions</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pools.map(pool => (
                  <TableRow key={pool.id}>
                    <TableCell className="font-medium">{pool.subscriptionName}</TableCell>
                    <TableCell>
                      {pool.createdAt ? new Date(pool.createdAt.toMillis()).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>{pool.totalAmount.toFixed(2)} €</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pool.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {pool.status === 'completed' ? 'Completed' : 'Active'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => navigate(`/collect/${pool.id}`)}
                        className="flex items-center text-primary hover:text-primary/70 transition-colors"
                      >
                        View Details
                        <ArrowRight size={14} className="ml-1" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};
