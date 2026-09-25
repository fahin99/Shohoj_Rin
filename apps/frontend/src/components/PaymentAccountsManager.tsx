"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "../lib/language-context";
import { Card, CardHeader, CardBody } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { TextInput, Select, Checkbox } from "./Input";
import { Modal, ConfirmModal } from "./Modal";
import { Alert } from "./Alert";
import { paymentAccountsApi } from "../lib/api";
import type {
  UserPaymentAccount,
  PaymentAccountType,
  PaymentProvider,
  CreatePaymentAccountInput,
} from "@shohojrin/shared";

export function maskAccountNumber(num: string): string {
  if (!num) return "";
  const trimmed = num.trim();
  if (trimmed.length <= 4) return "****" + trimmed;
  return "****" + trimmed.slice(-4);
}

export function getProviderBadge(provider: PaymentProvider) {
  switch (provider) {
    case "bkash":
      return { label: "bKash", color: "bg-pink-100 text-pink-700 border-pink-300" };
    case "nagad":
      return { label: "Nagad", color: "bg-orange-100 text-orange-700 border-orange-300" };
    case "rocket":
      return { label: "Rocket", color: "bg-purple-100 text-purple-700 border-purple-300" };
    case "bank":
      return { label: "Bank", color: "bg-blue-100 text-blue-700 border-blue-300" };
    default:
      return { label: provider, color: "bg-stone-100 text-stone-700 border-stone-300" };
  }
}

interface PaymentAccountsManagerProps {
  onAccountsChange?: (accounts: UserPaymentAccount[]) => void;
  selectable?: boolean;
  selectedAccountId?: string | null;
  onSelectAccount?: (account: UserPaymentAccount) => void;
  defaultAccountHolderName?: string;
  className?: string;
}

export function PaymentAccountsManager({
  onAccountsChange,
  selectable = false,
  selectedAccountId,
  onSelectAccount,
  defaultAccountHolderName = "",
  className = "",
}: PaymentAccountsManagerProps) {
  const { t } = useTranslation();

  const [accounts, setAccounts] = useState<UserPaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserPaymentAccount | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form fields
  const [accountType, setAccountType] = useState<PaymentAccountType>("mobile_money");
  const [provider, setProvider] = useState<PaymentProvider>("bkash");
  const [accountName, setAccountName] = useState(defaultAccountHolderName);
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentAccountsApi.getPaymentAccounts();
      setAccounts(data);
      onAccountsChange?.(data);

      // If selectable and nothing selected yet, select default
      if (selectable && !selectedAccountId && data.length > 0) {
        const def = data.find((a) => a.isDefault) || data[0];
        onSelectAccount?.(def);
      }
    } catch (err) {
      console.error("Failed to load payment accounts", err);
      setError(t("common.requestFailed"));
    } finally {
      setLoading(false);
    }
  }, [onAccountsChange, onSelectAccount, selectable, selectedAccountId, t]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const openAddModal = () => {
    setEditingAccount(null);
    setAccountType("mobile_money");
    setProvider("bkash");
    setAccountName(defaultAccountHolderName);
    setAccountNumber("");
    setBankName("");
    setBranchName("");
    setIsDefault(accounts.length === 0);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (acc: UserPaymentAccount) => {
    setEditingAccount(acc);
    setAccountType(acc.accountType);
    setProvider(acc.provider);
    setAccountName(acc.accountName);
    setAccountNumber(acc.accountNumber);
    setBankName(acc.bankName || "");
    setBranchName(acc.branchName || "");
    setIsDefault(acc.isDefault);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!accountName.trim()) {
      errs.accountName = t("paymentAccounts.accountHolderHint");
    }
    if (!accountNumber.trim()) {
      errs.accountNumber = t("paymentAccounts.accountNumber");
    } else if (accountType === "mobile_money") {
      const clean = accountNumber.replace(/\s+/g, "");
      if (!/^01[3-9]\d{8}$/.test(clean)) {
        errs.accountNumber = t("paymentAccounts.accountNumberMobileHint");
      }
    } else if (accountType === "bank") {
      if (!bankName.trim()) {
        errs.bankName = t("paymentAccounts.bankNamePlaceholder");
      }
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAccount = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setError(null);
    try {
      if (editingAccount) {
        await paymentAccountsApi.updatePaymentAccount(editingAccount.accountId, {
          accountName: accountName.trim(),
          bankName: accountType === "bank" ? bankName.trim() : undefined,
          branchName: accountType === "bank" && branchName ? branchName.trim() : undefined,
          isDefault,
        });
      } else {
        const payload: CreatePaymentAccountInput = {
          accountType,
          provider: accountType === "bank" ? "bank" : provider,
          accountName: accountName.trim(),
          accountNumber: accountNumber.trim(),
          bankName: accountType === "bank" ? bankName.trim() : undefined,
          branchName: accountType === "bank" && branchName ? branchName.trim() : undefined,
          isDefault,
        };
        await paymentAccountsApi.createPaymentAccount(payload);
      }
      setIsModalOpen(false);
      setSuccessMsg(t("paymentAccounts.savedSuccess"));
      await loadAccounts();
    } catch (err) {
      console.error("Failed to save account", err);
      setError(t("paymentAccounts.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (acc: UserPaymentAccount) => {
    try {
      await paymentAccountsApi.setDefaultPaymentAccount(acc.accountId);
      setSuccessMsg(t("paymentAccounts.defaultSetSuccess"));
      await loadAccounts();
    } catch (err) {
      console.error("Failed to set default account", err);
      setError(t("common.requestFailed"));
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await paymentAccountsApi.deletePaymentAccount(deletingId);
      setDeletingId(null);
      setSuccessMsg(t("paymentAccounts.deletedSuccess"));
      await loadAccounts();
    } catch (err) {
      console.error("Failed to delete account", err);
      setError(t("common.requestFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {error && (
        <Alert variant="error" title={t("common.requestFailed")} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert
          variant="success"
          title={t("paymentAccounts.title")}
          onClose={() => setSuccessMsg(null)}
        >
          {successMsg}
        </Alert>
      )}

      <Card variant="plain">
        <CardHeader
          title={t("paymentAccounts.title")}
          description={t("paymentAccounts.subtitle")}
          action={
            <Button variant="primary" size="sm" onClick={openAddModal}>
              + {t("paymentAccounts.addAccount")}
            </Button>
          }
        />
        <CardBody>
          {loading ? (
            <div className="py-6 text-center text-sm text-stone-500">
              {t("common.loading")}
            </div>
          ) : accounts.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm font-medium text-navy">{t("paymentAccounts.emptyTitle")}</p>
              <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
                {t("paymentAccounts.emptyDescription")}
              </p>
              <Button variant="outline" size="sm" onClick={openAddModal} className="mt-4">
                + {t("paymentAccounts.addFirstAccount")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {accounts.map((acc) => {
                const badge = getProviderBadge(acc.provider);
                const isSelected = selectable && selectedAccountId === acc.accountId;

                return (
                  <div
                    key={acc.accountId}
                    onClick={() => selectable && onSelectAccount?.(acc)}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-[8px] border transition-all ${
                      isSelected
                        ? "border-teal bg-teal-light/40 ring-1 ring-teal"
                        : selectable
                          ? "border-stone-200 bg-white hover:border-stone-300 cursor-pointer"
                          : "border-stone-200 bg-stone-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {selectable && (
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-teal bg-teal" : "border-stone-300 bg-white"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-sm font-semibold text-navy">
                            {acc.accountName}
                          </span>
                          {acc.isDefault && (
                            <Badge variant="success" size="sm">
                              {t("paymentAccounts.defaultBadge")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-mono text-stone-600 mt-1">
                          {maskAccountNumber(acc.accountNumber)}
                          {acc.bankName ? ` • ${acc.bankName}` : ""}
                          {acc.branchName ? ` (${acc.branchName})` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {!acc.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(acc);
                          }}
                        >
                          {t("paymentAccounts.setDefault")}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(acc);
                        }}
                      >
                        {t("common.edit")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-coral hover:text-coral hover:bg-coral-light/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(acc.accountId);
                        }}
                      >
                        {t("paymentAccounts.delete")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-stone-200">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              ℹ {t("paymentAccounts.simulationNotice")}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={
          editingAccount
            ? t("paymentAccounts.editAccount")
            : t("paymentAccounts.addAccount")
        }
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleSaveAccount}>
              {t("common.save")}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {!editingAccount && (
            <>
              <div>
                <label className="text-xs font-semibold text-navy mb-1.5 block">
                  {t("paymentAccounts.accountType")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountType("mobile_money");
                      if (provider === "bank") setProvider("bkash");
                    }}
                    className={`px-3 py-2 text-xs font-semibold rounded-[6px] border text-center transition-all ${
                      accountType === "mobile_money"
                        ? "bg-teal text-white border-teal shadow-xs"
                        : "bg-white text-stone-600 border-stone-300 hover:border-stone-400"
                    }`}
                  >
                    📱 {t("paymentAccounts.mobileMoney")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountType("bank");
                      setProvider("bank");
                    }}
                    className={`px-3 py-2 text-xs font-semibold rounded-[6px] border text-center transition-all ${
                      accountType === "bank"
                        ? "bg-teal text-white border-teal shadow-xs"
                        : "bg-white text-stone-600 border-stone-300 hover:border-stone-400"
                    }`}
                  >
                    🏦 {t("paymentAccounts.bank")}
                  </button>
                </div>
              </div>

              {accountType === "mobile_money" && (
                <Select
                  label={t("paymentAccounts.provider")}
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as PaymentProvider)}
                  options={[
                    { value: "bkash", label: t("paymentAccounts.providerBkash") },
                    { value: "nagad", label: t("paymentAccounts.providerNagad") },
                    { value: "rocket", label: t("paymentAccounts.providerRocket") },
                  ]}
                />
              )}
            </>
          )}

          <TextInput
            label={t("paymentAccounts.accountHolder")}
            placeholder="e.g. Rahim Uddin Ahmed"
            required
            value={accountName}
            error={formErrors.accountName}
            hint={t("paymentAccounts.accountHolderHint")}
            onChange={(e) => setAccountName(e.target.value)}
          />

          {!editingAccount && (
            <TextInput
              label={
                accountType === "mobile_money"
                  ? t("paymentAccounts.accountNumberMobile")
                  : t("paymentAccounts.accountNumberBank")
              }
              placeholder={accountType === "mobile_money" ? "017XXXXXXXX" : "123456789012"}
              required
              value={accountNumber}
              error={formErrors.accountNumber}
              hint={
                accountType === "mobile_money"
                  ? t("paymentAccounts.accountNumberMobileHint")
                  : undefined
              }
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          )}

          {accountType === "bank" && (
            <>
              <TextInput
                label={t("paymentAccounts.bankName")}
                placeholder={t("paymentAccounts.bankNamePlaceholder")}
                required
                value={bankName}
                error={formErrors.bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
              <TextInput
                label={t("paymentAccounts.branchName")}
                placeholder={t("paymentAccounts.branchNamePlaceholder")}
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
              />
            </>
          )}

          <Checkbox
            label={t("paymentAccounts.makeDefault")}
            checked={isDefault}
            onChange={(checked) => setIsDefault(checked)}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title={t("paymentAccounts.deleteConfirmTitle")}
        message={t("paymentAccounts.deleteConfirmMessage")}
        confirmLabel={t("paymentAccounts.delete")}
        cancelLabel={t("common.cancel")}
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
