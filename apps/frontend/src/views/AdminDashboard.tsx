import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { DataTable, type Column } from "../components/DataTable";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Tabs, TabPanel } from "../components/Tabs";
import { Alert } from "../components/Alert";
import { formatTaka, formatDate } from "../lib/format";
import { getApplications } from "../lib/api/applications";
import { getPlatformStats, getUsers, reviewApplication } from "../lib/api/admin";
import type { PageName } from "../types";
import { getDisplayName, type StoredUserProfile } from "../lib/session";

interface Props {
  onNavigate: (page: PageName) => void;
  user: StoredUserProfile;
}

interface PendingApplication {
  id: string;
  applicant: string;
  product: string;
  amount: number;
  submitted: string;
  riskScore: "Low" | "Medium" | "High";
  status: "pending" | "approved" | "rejected";
}

export default function AdminDashboard({ onNavigate, user }: Props) {
  const [liveApplications, setLiveApplications] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    applicationsToday: 27,
    approvalRate: 82,
    disbursedThisMonth: 9400000,
    overdueAccounts: 18,
  });

  const [localDecisions, setLocalDecisions] = useState<Record<string, "approved" | "rejected">>({});
  const [confirmation, setConfirmation] = useState<{
    type: "approved" | "rejected";
    applicant: string;
  } | null>(null);
  const [tab, setTab] = useState("applications");
  
  const userName = getDisplayName(user);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [appsRes, statsRes, usersRes] = await Promise.all([
          getApplications({ status: "pending" }).catch(() => ({ applications: [], total: 0 })),
          getPlatformStats().catch(() => null),
          getUsers().catch(() => ({ users: [], total: 0 })),
        ]);

        if (appsRes?.applications) {
          setLiveApplications(appsRes.applications);
        }
        
        if (statsRes) {
          setStats({
            applicationsToday: statsRes.applicationsToday || 27,
            approvalRate: statsRes.approvalRate || 82,
            disbursedThisMonth: statsRes.disbursedThisMonth || 9400000,
            overdueAccounts: statsRes.overdueAccounts || 18,
          });
        }
        
        if (usersRes?.users) {
          setUsersList(usersRes.users.length > 0 ? usersRes.users : [
            { id: "U-2201", name: "Riya Ahmed", role: "Borrower", joined: "2025-09-28", status: "active" },
            { id: "U-1987", name: "Tanvir Hossain", role: "Lender", joined: "2025-06-10", status: "active" },
          ]);
        } else {
          setUsersList([
            { id: "U-2201", name: "Riya Ahmed", role: "Borrower", joined: "2025-09-28", status: "active" },
            { id: "U-1987", name: "Tanvir Hossain", role: "Lender", joined: "2025-06-10", status: "active" },
          ]);
        }
        
        setProviders([
          { id: "P-01", name: "Bengal Microfinance Bank", products: 2, activeLoans: 142, status: "active" },
          { id: "P-02", name: "Shohoj Care Finance", products: 1, activeLoans: 67, status: "active" },
        ]);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      }
    };
    fetchAdminData();
  }, []);

  const queue = useMemo(() => {
    const liveMapped: PendingApplication[] = liveApplications.map((a) => ({
      id: a.id,
      applicant: a.phone ? `Borrower (${a.phone})` : "Borrower Application",
      product: a.product || "Standard Loan",
      amount: a.amount || a.requestedAmount || 0,
      submitted: a.submitted || a.createdAt || new Date().toISOString().split("T")[0],
      riskScore: "Low" as const,
      status:
        localDecisions[a.id] ||
        (a.status === "disbursed" || a.status === "approved"
          ? ("approved" as const)
          : a.status === "rejected"
            ? ("rejected" as const)
            : ("pending" as const)),
    }));

    return liveMapped;
  }, [liveApplications, localDecisions]);

  const handleDecision = async (id: string, decision: "approved" | "rejected") => {
    const app = queue.find((q) => q.id === id);
    if (!app) return;
    
    setLocalDecisions((prev) => ({ ...prev, [id]: decision }));
    
    try {
      await reviewApplication(id, { decision });
      setConfirmation({ type: decision, applicant: app.applicant });
    } catch (err) {
      console.error("Failed to review application", err);
      // Revert if failed
      setLocalDecisions((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const columns: Column<PendingApplication>[] = [
    {
      key: "id",
      header: "ID",
      render: (r) => <span className="tabular-nums text-xs text-stone-500">{r.id}</span>,
    },
    {
      key: "applicant",
      header: "Applicant",
      render: (r) => <span className="font-medium">{r.applicant}</span>,
    },
    {
      key: "product",
      header: "Product",
      hideBelow: "md",
      render: (r) => <span className="text-stone-500">{r.product}</span>,
    },
    { key: "amount", header: "Amount", numeric: true, render: (r) => formatTaka(r.amount) },
    {
      key: "submitted",
      header: "Submitted",
      hideBelow: "sm",
      render: (r) => formatDate(r.submitted),
    },
    {
      key: "risk",
      header: "Risk score",
      render: (r) => (
        <Badge
          variant={
            r.riskScore === "Low" ? "success" : r.riskScore === "Medium" ? "warning" : "error"
          }
          size="sm"
          dot
        >
          {r.riskScore}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) =>
        r.status === "pending" ? (
          <div className="flex items-center gap-2 justify-end">
            <Button variant="secondary" size="xs" onClick={() => handleDecision(r.id, "rejected")}>
              Reject
            </Button>
            <Button variant="primary" size="xs" onClick={() => handleDecision(r.id, "approved")}>
              Approve
            </Button>
          </div>
        ) : (
          <Badge variant={r.status === "approved" ? "success" : "error"} size="sm">
            {r.status === "approved" ? "Approved" : "Rejected"}
          </Badge>
        ),
    },
  ];

  const pendingCount = queue.filter((q) => q.status === "pending").length;

  return (
    <AppLayout onNavigate={onNavigate} currentPage="admin" userType="admin" userName={userName}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <PageHeader
          eyebrow="Platform overview"
          title="Admin dashboard"
          description="Monitor applications, users, providers, and platform health."
        />
        {confirmation && (
          <div className="mb-5">
            <Alert
              variant={confirmation.type === "approved" ? "success" : "error"}
              title={
                confirmation.type === "approved" ? "Application approved" : "Application rejected"
              }
              dismissible
            >
              {confirmation.applicant}'s application has been {confirmation.type}.
            </Alert>
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard label="Applications today" value={String(stats.applicationsToday)} hint="+4 vs yesterday" />
          <StatCard label="Pending review" value={String(pendingCount)} tone="attention" />
          <StatCard label="Approval rate" value={`${stats.approvalRate}%`} tone="positive" />
          <StatCard label="Disbursed this month" value={formatTaka(stats.disbursedThisMonth)} tone="info" />
          <StatCard label="Overdue accounts" value={String(stats.overdueAccounts)} tone="critical" />
        </div>
        <Tabs
          variant="card"
          className="mb-5"
          tabs={[
            { id: "applications", label: "Applications", count: pendingCount },
            { id: "users", label: "Users", count: usersList.length },
            { id: "providers", label: "Providers", count: providers.length },
          ]}
          activeTab={tab}
          onChange={setTab}
        />
        <TabPanel id="applications" activeTab={tab}>
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] mb-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between items-center px-5 py-4 border-b border-stone-200">
              <h2 className="text-sm font-semibold text-navy min-w-0">Review queue</h2>
              <span className="text-xs text-stone-500 shrink-0">{pendingCount} pending</span>
            </div>
            <DataTable
              caption="Pending applications"
              columns={columns}
              rows={queue}
              rowKey={(r) => r.id}
            />
          </div>
        </TabPanel>
        <TabPanel id="users" activeTab={tab}>
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] mb-6">
            <DataTable
              caption="Users"
              rowKey={(r) => r.id}
              rows={usersList}
              columns={[
                {
                  key: "name",
                  header: "Name",
                  render: (r) => <span className="font-medium">{r.name || r.id}</span>,
                },
                { key: "role", header: "Role", render: (r) => r.role || "User" },
                {
                  key: "joined",
                  header: "Joined",
                  hideBelow: "sm",
                  render: (r) => formatDate(r.joined || r.createdAt),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (r) => (
                    <Badge variant={r.status === "active" ? "success" : "error"} size="sm" dot>
                      {r.status || "active"}
                    </Badge>
                  ),
                },
              ]}
            />
          </div>
        </TabPanel>
        <TabPanel id="providers" activeTab={tab}>
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] mb-6">
            <DataTable
              caption="Providers"
              rowKey={(r) => r.id}
              rows={providers}
              columns={[
                {
                  key: "name",
                  header: "Provider",
                  render: (r) => <span className="font-medium">{r.name}</span>,
                },
                { key: "products", header: "Products", numeric: true, render: (r) => r.products },
                {
                  key: "activeLoans",
                  header: "Active loans",
                  numeric: true,
                  render: (r) => r.activeLoans,
                },
                {
                  key: "status",
                  header: "Status",
                  render: (r) => (
                    <Badge variant={r.status === "active" ? "success" : "warning"} size="sm" dot>
                      {r.status === "active" ? "Active" : "Under review"}
                    </Badge>
                  ),
                },
              ]}
            />
          </div>
        </TabPanel>
        
        <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5">
          <h2 className="text-sm font-semibold text-navy mb-4">System health</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "API uptime", value: "99.98%", status: "success" as const },
              { label: "Payment gateway", value: "Operational", status: "success" as const },
              {
                label: "Document verification queue",
                value: "3 delayed",
                status: "warning" as const,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="border border-stone-200 rounded-[6px] p-3 flex items-start justify-between gap-2 min-w-0"
              >
                <div className="min-w-0">
                  <p className="text-xs text-stone-500">{item.label}</p>
                  <p className="text-sm font-medium text-navy mt-0.5 truncate">{item.value}</p>
                </div>
                <Badge variant={item.status} size="sm" dot>
                  {item.status === "success" ? "OK" : "Watch"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
