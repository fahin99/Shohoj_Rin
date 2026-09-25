"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "../components/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { Card, CardHeader, CardBody, DataRow } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { TextInput } from "../components/Input";
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
import { profileApi } from "../lib/api/index";
import { getDisplayName, type StoredUserProfile } from "../lib/session";
import type { PageName } from "../types";
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";

interface Props {
  onNavigate: (page: PageName) => void;
  user: StoredUserProfile;
}

const accountStatusVariant: Record<string, "success" | "warning" | "error" | "neutral"> = {
  active: "success",
  suspended: "warning",
  deactivated: "error",
};

export default function SettingsPage({ onNavigate, user }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const role = user.role ?? "borrower";
  const status = user.accountStatus ?? "active";

  const [currentUsername, setCurrentUsername] = useState(user.username?.trim() || "");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user.username?.trim() || "");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState(false);

  const userName = getDisplayName(
    user,
    currentUsername ? `@${currentUsername}` : t("settings.account"),
  );

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleSaveUsername = async () => {
    const clean = usernameInput.trim();
    if (!clean) {
      setUsernameError("Username is required");
      return;
    }
    if (clean.length < 3 || clean.length > 50 || !/^[a-zA-Z0-9_.-]+$/.test(clean)) {
      setUsernameError("Use 3-50 letters, numbers, dots, underscores, or hyphens");
      return;
    }
    setUsernameSaving(true);
    setUsernameError(null);
    try {
      await profileApi.updateUsername(clean);
      setCurrentUsername(clean);
      setIsEditingUsername(false);
      setUsernameSuccess(true);
      router.refresh();
    } catch (err) {
      console.error("Failed to update username", err);
      setUsernameError(t("common.requestFailed"));
    } finally {
      setUsernameSaving(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    setLogoutError(null);
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      setLogoutOpen(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Unable to log out", error);
      setLogoutError(t("common.requestFailed"));
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
          eyebrow={t("settings.account")}
          title={t("settings.title")}
          description={t("settings.description")}
        />

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader
              title={t("settings.account")}
              description={t("settings.accountDescription")}
              action={
                !isEditingUsername ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setUsernameInput(currentUsername);
                      setUsernameError(null);
                      setUsernameSuccess(false);
                      setIsEditingUsername(true);
                    }}
                  >
                    {currentUsername ? "Edit username" : "Set username"}
                  </Button>
                ) : null
              }
            />
            <CardBody>
              {usernameSuccess && !isEditingUsername && (
                <Alert
                  variant="success"
                  title="Username updated successfully"
                  dismissible
                  className="mb-4"
                >
                  Your username has been updated to @{currentUsername}.
                </Alert>
              )}

              {isEditingUsername ? (
                <div className="py-2 flex flex-col gap-3 border-b border-stone-100 pb-4 mb-2">
                  <TextInput
                    label={t("settings.username") || "Username"}
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    error={usernameError || undefined}
                    hint="3-50 letters, numbers, dots, underscores, or hyphens"
                    autoComplete="username"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveUsername}
                      loading={usernameSaving}
                    >
                      {t("common.save") || "Save"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditingUsername(false);
                        setUsernameError(null);
                      }}
                      disabled={usernameSaving}
                    >
                      {t("common.cancel") || "Cancel"}
                    </Button>
                  </div>
                </div>
              ) : (
                <DataRow
                  label={t("settings.username")}
                  value={currentUsername ? `@${currentUsername}` : t("common.notSet")}
                />
              )}
              <DataRow label={t("settings.email")} value={user.email || "—"} />
              <DataRow label={t("settings.phone")} value={user.phone || t("common.notSet")} />
              <DataRow label={t("settings.role")} value={t(enumKey("role", role))} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={t("settings.accountStatus")}
              description={t("settings.accountStatusDescription")}
            />
            <CardBody>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-stone-500">{t("settings.status")}</span>
                <Badge variant={accountStatusVariant[status] ?? "neutral"} dot>
                  {t(enumKey("accountStatus", status))}
                </Badge>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={t("settings.security")}
              description={t("settings.securityDescription")}
            />
            <CardBody className="flex flex-col gap-4">
              <Alert variant="info" title={t("settings.changePasswordTitle")}>
                {t("settings.changePasswordBody")}
              </Alert>

              {logoutError && (
                <Alert variant="error" title={t("settings.logoutFailedTitle")}>
                  {logoutError}
                </Alert>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy">{t("settings.logOutAction")}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{t("settings.logOutHint")}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setLogoutOpen(true)}>
                  {t("settings.logOutAction")}
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
            <AlertDialogTitle>{t("settings.logOutAction")}</AlertDialogTitle>
            <AlertDialogDescription>{t("settings.logOutHint")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={logoutLoading}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={logoutLoading}
              onClick={(event) => {
                event.preventDefault();
                void handleLogout();
              }}
            >
              {logoutLoading ? t("common.loading") : t("settings.logOutAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
