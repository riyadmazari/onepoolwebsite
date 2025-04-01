// webapp/src/components/ui/BusinessDashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FadeIn } from "./animations";
import { 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Users, 
  Activity, 
  ExternalLink, 
  Download, 
  ArrowRight 
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./table";
import { Pool, Business, getBusinessPools, getBusinessStats } from "@/lib/firebase";
import { createLoginLink } from "@/lib/stripe";
import { Timestamp } from "firebase/firestore";

interface BusinessDashboardProps {
  business: Business;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ business }) => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch business data if not in demo mode; demo data is loaded in the page container.
    // In demo mode, we load several pools with realistic names and contributors.
    useEffect(() => {
      const fetchBusinessData = async () => {
        try {
          setIsLoading(true);
          if (business.id === "demo") {
            // Demo pools with realistic names and larger data.
            const demoPools: Pool[] = [
              {
                id: "pool1",
                createdAt: Timestamp.fromMillis(Date.now() - 3 * 86400000 ),
                totalAmount: 299.99,
                subscriptionName: "Netflix - Monthly Payment",
                contributors: [
                  { id: "c1", name: "Alice Johnson", amount: 9.99, hasVerified: true, hasPaid: true },
                  { id: "c2", name: "Bob Smith", amount: 9.99, hasVerified: true, hasPaid: true },
                  { id: "c3", name: "Carol Lee", amount: 9.99, hasVerified: true, hasPaid: false },
                  { id: "c4", name: "David Kim", amount: 9.99, hasVerified: false, hasPaid: false },
                  { id: "c5", name: "Evelyn Garcia", amount: 9.99, hasVerified: true, hasPaid: true }
                ],
                status: "active"
              },
              {
                id: "pool2",
                createdAt: Timestamp.fromMillis(Date.now() - 7 * 86400000),
                totalAmount: 79.99,
                subscriptionName: "Spotify - Annual Subscription",
                contributors: [
                  { id: "c6", name: "Frank Miller", amount: 7.99, hasVerified: true, hasPaid: true },
                  { id: "c7", name: "Grace Wilson", amount: 7.99, hasVerified: true, hasPaid: true },
                  { id: "c8", name: "Hannah Davis", amount: 7.99, hasVerified: true, hasPaid: false }
                ],
                status: "active"
              },
              {
                id: "pool3",
                createdAt: Timestamp.fromMillis(Date.now() - 14 * 86400000),
                totalAmount: 499.99,
                subscriptionName: "Gym Membership - Monthly",
                contributors: [
                  { id: "c9", name: "Ian Thompson", amount: 49.99, hasVerified: true, hasPaid: true },
                  { id: "c10", name: "Jenny Lopez", amount: 49.99, hasVerified: true, hasPaid: true },
                  { id: "c11", name: "Kevin Brown", amount: 49.99, hasVerified: false, hasPaid: false },
                  { id: "c12", name: "Laura Martinez", amount: 49.99, hasVerified: true, hasPaid: false },
                  { id: "c13", name: "Mike Robinson", amount: 49.99, hasVerified: true, hasPaid: true },
                  { id: "c14", name: "Nina Patel", amount: 49.99, hasVerified: true, hasPaid: true }
                ],
                status: "completed"
              },
              {
                id: "pool4",
                createdAt: Timestamp.fromMillis(Date.now() - 30 * 86400000),
                totalAmount: 1299.99,
                subscriptionName: "Insurance Payment - Quarterly",
                contributors: [
                  { id: "c15", name: "Oliver Clark", amount: 324.99, hasVerified: true, hasPaid: true },
                  { id: "c16", name: "Paula Adams", amount: 324.99, hasVerified: true, hasPaid: true },
                  { id: "c17", name: "Quentin Wright", amount: 324.99, hasVerified: true, hasPaid: true },
                  { id: "c18", name: "Rachel Evans", amount: 324.99, hasVerified: true, hasPaid: true }
                ],
                status: "completed"
              }
            ];
            const demoStats = {
              totalPools: demoPools.length,
              activePools: demoPools.filter(pool => pool.status === "active").length,
              completedPools: demoPools.filter(pool => pool.status === "completed").length,
              totalAmount: demoPools.reduce((sum, pool) => sum + pool.totalAmount, 0),
              collectedAmount: demoPools.reduce((sum, pool) => {
                const poolCollected = pool.contributors.reduce((s, contributor) => 
                  contributor.hasPaid ? s + contributor.amount : s, 0);
                return sum + poolCollected;
              }, 0),
              totalContributors: demoPools.reduce((sum, pool) => sum + pool.contributors.length, 0),
              verifiedContributors: demoPools.reduce((sum, pool) => 
                sum + pool.contributors.filter(c => c.hasVerified).length, 0),
              paidContributors: demoPools.reduce((sum, pool) => 
                sum + pool.contributors.filter(c => c.hasPaid).length, 0)
            };
            setPools(demoPools);
            setStats(demoStats);
          } else {
            // For a real business, fetch data from Firebase.
            const fetchedPools = await getBusinessPools(business.id);
            setPools(fetchedPools);
            const businessStats = await getBusinessStats(business.id);
            setStats(businessStats);
          }
        } catch (error) {
          console.error("Error fetching business data:", error);
          toast({
            title: "Error",
            description: "Failed to load business data",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchBusinessData();
    }, [business.id, toast]);
  

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
      pool.contributors.filter(c => c.hasVerified).length.toString(),
      pool.contributors.filter(c => c.hasPaid).length.toString()
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
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

  // When a pool row is clicked, we set it as the selected pool.
  const handleViewPool = (pool: Pool) => {
    setSelectedPool(pool);
  };

  // Pool Details View – shown when a pool is selected.
  if (selectedPool) {
    return (
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setSelectedPool(null)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              selectedPool.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-800'
            }`}>
              {selectedPool.status === 'completed' ? 'Completed' : 'Active'}
            </span>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2">{selectedPool.subscriptionName}</h2>
        <p className="text-muted-foreground mb-6">
          Created on {selectedPool.createdAt ? new Date(selectedPool.createdAt.toMillis()).toLocaleDateString() : "-"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center">
              <div className="p-2.5 rounded-full bg-primary/10 text-primary mr-3">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-xl font-semibold">{selectedPool.totalAmount.toFixed(2)} €</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center">
              <div className="p-2.5 rounded-full bg-primary/10 text-primary mr-3">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contributors</p>
                <p className="text-xl font-semibold">{selectedPool.contributors.length}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center">
              <div className="p-2.5 rounded-full bg-primary/10 text-primary mr-3">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Payments</p>
                <p className="text-xl font-semibold">
                  {selectedPool.contributors.filter(c => c.hasPaid).length} / {selectedPool.contributors.length}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-medium mb-3">Contributors</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedPool.contributors.map((contributor) => (
                  <TableRow key={contributor.id}>
                    <TableCell>{contributor.name || "Unnamed"}</TableCell>
                    <TableCell>{contributor.amount.toFixed(2)} €</TableCell>
                    <TableCell>
                      {contributor.hasPaid ? (
                        <span className="flex items-center text-emerald-600">
                          <CheckCircle size={16} className="mr-1" />
                          Paid
                        </span>
                      ) : contributor.hasVerified ? (
                        <span className="flex items-center text-amber-600">
                          <CheckCircle size={16} className="mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{business.name} Dashboard</h1>
          <p className="text-muted-foreground">{business.email}</p>
        </div>
        <div className="flex mt-4 md:mt-0 gap-3">
          {business.stripeConnected ? (
            <button
              onClick={handleOpenStripeDashboard}
              className="flex items-center px-4 py-2 border border-input rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
            >
              <ExternalLink size={16} className="mr-2" />
              Stripe Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate("/connect-stripe", { state: { businessId: business.id } })}
              className="flex items-center px-4 py-2 border border-input rounded-lg text-sm font-medium bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
            >
              <ExternalLink size={16} className="mr-2" />
              Connect with Stripe
            </button>
          )}
          {/* In read-only mode, no pool creation or manual processing */}
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
                  <Activity size={20} />
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
      <div className="glass-card p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Payment Pools Overview</h2>
          {pools.length > 0 && (
            <button
              onClick={exportPoolsCSV}
              className="flex items-center px-3 py-1.5 text-sm border border-input rounded-md hover:bg-secondary transition-colors"
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </button>
          )}
        </div>
        {pools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No payment pools available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Contributors</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pools.map((pool) => {
                  const verifiedCount = pool.contributors.filter(c => c.hasVerified).length;
                  const paidCount = pool.contributors.filter(c => c.hasPaid).length;
                  return (
                    <TableRow key={pool.id}>
                      <TableCell className="font-medium">{pool.subscriptionName}</TableCell>
                      <TableCell>
                        {pool.createdAt ? new Date(pool.createdAt.toMillis()).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>{pool.totalAmount.toFixed(2)} €</TableCell>
                      <TableCell>{pool.contributors.length} (V:{verifiedCount} / P:{paidCount})</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pool.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {pool.status === 'completed' ? 'Completed' : 'Active'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleViewPool(pool)}
                          className="flex items-center text-primary hover:text-primary/70 transition-colors"
                        >
                          View
                          <ArrowRight size={14} className="ml-1" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};
