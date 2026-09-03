import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "../components/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { Card, CardHeader, CardBody, DataRow } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { apiRequest } from "../lib/api";
import { getDisplayName, type StoredUserProfile } from "../lib/session";
import type { PageName } from "../types";

interface Props {
  onNavigate: (page: PageName) => void;
  user: StoredUserProfile;
}

const roleLabel: Record<string, string> = {
  borrower: "Borrower",
  lender: "Lender / Investor",
  admin: "Administrator",
  partner_agent: "Partner agent",
};

const accountStatusLabel: Record<string, string> = {
  active: "Active",
  suspended: "Suspended",
  deactivated: "Deactivated",
};

const accountStatusVariant: Record<string, "success" | "warning" | "error" | "neutral"> = {
  active: "success",
  suspended: "warning",
  deactivated: "error",
};

export default function SettingsPage({ onNavigate, user }: Props) {
  const router = useRouter();
  const role = user.role ?? "borrower";
  const status = user.accountStatus ?? "active";
  const userName = getDisplayName(user, user.username ? `@${user.username}` : "Account");

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLogoutLoading(true);
    setLogoutError(null);
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      setLogoutOpen(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Unable to log out. Please try again.",
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <AppLayout
      onNavigate={onNavigate}
      currentPage="settings"
      userType={role === "lender" ? "lender" : role === "admin" ? "admin" : "borrower"}
      userName={userName}
    >
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
        <PageHeader
          eyebrow="Account"
          title="Settings"
          description="Manage your account details, security, and status."
        />

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Account" description="Your basic account details." />
            <CardBody>
              <DataRow label="Username" value={user.username ? `@${user.username}` : "Not set"} />
              <DataRow label="Email" value={user.email || "—"} />
              <DataRow label="Phone" value={user.phone || "Not set"} />
              <DataRow label="Account role" value={roleLabel[role] ?? role} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Account status"
              description="The current standing of your account."
            />
            <CardBody>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-stone-500">Status</span>
                <Badge variant={accountStatusVariant[status] ?? "neutral"} dot>
                  {accountStatusLabel[status] ?? status}
                </Badge>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Security" description="Manage how you sign in to Shohoj Rin." />
            <CardBody className="flex flex-col gap-4">
              <Alert variant="info" title="Change password">
                Changing your password from this page isn&apos;t available yet. Check back soon.
              </Alert>

              {logoutError && (
                <Alert variant="error" title="Couldn't log out">
                  {logoutError}
                </Alert>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy">Log out</p>
                  <p className="text-xs text-stone-500 mt-0.5">End your session on this device.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setLogoutOpen(true)}>
                  Log out
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={logoutOpen}
        onOpenChange={(open) => {
          if (!logoutLoading) setLogoutOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log Out?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to log out?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={logoutLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={logoutLoading}
              onClick={(event) => {
                event.preventDefault();
                void handleLogout();
              }}
            >
              {logoutLoading ? "Logging out..." : "Log Out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
