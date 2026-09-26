import { AppLayout } from "../components/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { Card, CardHeader, CardBody, DataRow } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { TextInput, Select, CurrencyInput, Checkbox } from "../components/Input";
import { EmptyState, EmptyIcons } from "../components/EmptyState";
import { Alert } from "../components/Alert";
import InstitutionCombobox from "../components/InstitutionCombobox";
import { PaymentAccountsManager } from "../components/PaymentAccountsManager";
import { profileApi, loansApi, trustApi, investorApi, guarantorApi } from "../lib/api/index";
import type { GuarantorData } from "../lib/api/guarantor";
import { formatDate, formatTaka } from "../lib/format";
import type { PageName } from "../types";
import { getDisplayName, type StoredUserProfile } from "../lib/session";
import type { InvestorProfile, ProfileCompletionItem } from "@shohojrin/shared";
import type { TrustScoreData } from "../lib/api/trust";
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  onNavigate: (page: PageName) => void;
  user: StoredUserProfile;
}

interface ProfileRecord {
  username?: string | null;
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  nid_number: string | null;
  address_line: string | null;
  city: string | null;
  district: string | null;
  postal_code: string | null;
  occupation: string | null;
  monthly_family_income: number | string | null;
  institution_id: string | null;
  institution_name: string | null;
  student_id: string | null;
  enrollment_year: number | null;
  profile_photo_url: string | null;
  profile_completion_status: string | null;
  employment_type: string | null;
  employer_name: string | null;
  monthly_income: number | string | null;
  monthly_savings: number | string | null;
  income_source: string | null;
  email: string;
  phone: string | null;
  role: string;
}

interface FormState {
  username: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nidNumber: string;
  addressLine: string;
  city: string;
  district: string;
  postalCode: string;
  occupation: string;
  monthlyFamilyIncome: string;
  employmentType: string;
  employerName: string;
  monthlyIncome: string;
  monthlySavings: string;
  incomeSource: string;
  institutionId: string | null;
  institutionName: string;
  studentId: string;
  enrollmentYear: string;
}

interface LenderFormState {
  username: string;
  displayName: string;
  companyName: string;
  companyAddress: string;
  companyBranch: string;
  companyGoal: string;
  fundingCapacity: string;
  maxExposure: string;
  riskPreference: string;
  preferredCategories: string[];
  partnerAgentId: string;
}

const completionStatusLabel: Record<string, string> = {
  incomplete: "Incomplete",
  pending_verification: "Pending verification",
  under_review: "Under review",
  verified: "Verified",
  rejected: "Rejected",
  needs_update: "Needs update",
};

const completionStatusVariant: Record<
  string,
  "success" | "warning" | "error" | "info" | "neutral"
> = {
  incomplete: "neutral",
  pending_verification: "warning",
  under_review: "warning",
  verified: "success",
  rejected: "error",
  needs_update: "warning",
};

const trustBandLabel: Record<string, string> = {
  very_low_risk: "Very low risk",
  low_risk: "Low risk",
  moderate_risk: "Moderate risk",
  high_risk: "High risk",
  very_high_risk: "Very high risk",
};

const trustBandVariant: Record<string, "success" | "warning" | "error"> = {
  very_low_risk: "success",
  low_risk: "success",
  moderate_risk: "warning",
  high_risk: "error",
  very_high_risk: "error",
};

const factorNameLabel: Record<string, string> = {
  repayment_history: "Repayment History",
  financial_capacity: "Financial Capacity",
  financial_behavior: "Financial Behavior",
  identity_verification: "Identity & Verification",
  credit_behavior: "Credit Behavior",
};

const verificationStatusLabel: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const verificationStatusVariant: Record<string, "success" | "warning" | "error" | "neutral"> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

const riskPreferenceLabel: Record<string, string> = {
  conservative: "Conservative",
  moderate: "Moderate",
  aggressive: "Aggressive",
};

const loanCategoryLabel: Record<string, string> = {
  education: "Education",
  emergency: "Emergency / Medical",
  business: "Business",
  personal: "Personal",
  development: "Skills / Development",
};

const supportedCategories = [
  { value: "education", label: "Education" },
  { value: "emergency", label: "Emergency / Medical" },
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal" },
  { value: "development", label: "Skills / Development" },
] as const;

const riskPreferenceOptions = [
  { value: "conservative", label: "Conservative" },
  { value: "moderate", label: "Moderate" },
  { value: "aggressive", label: "Aggressive" },
];

const genderOptions = ["male", "female", "other"] as const;

const employmentOptions = [
  { value: "employed-full", label: "Employed (Full-time)" },
  { value: "employed-part", label: "Employed (Part-time)" },
  { value: "self-employed", label: "Self-employed / Freelancer" },
  { value: "business", label: "Business owner" },
  { value: "student", label: "Student" },
  { value: "unemployed", label: "Currently not working" },
];

function toFormValue(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

export default function ProfilePage({ onNavigate, user }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const isLender = user.role === "lender";
  const [currentUsername, setCurrentUsername] = useState<string>(user.username?.trim() || "");

  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [completionItems, setCompletionItems] = useState<ProfileCompletionItem[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(!isLender);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [trustScore, setTrustScore] = useState<TrustScoreData | null>(null);
  const [trustLoading, setTrustLoading] = useState(!isLender);
  const [trustError, setTrustError] = useState<string | null>(null);

  const [guarantor, setGuarantor] = useState<GuarantorData | null>(null);
  const [guarantorLoading, setGuarantorLoading] = useState(!isLender);
  const [guarantorError, setGuarantorError] = useState<string | null>(null);

  const [lenderStats, setLenderStats] = useState<{ total: number; completed: number } | null>(null);
  const [lenderStatsLoading, setLenderStatsLoading] = useState(false);
  const [lenderStatsError, setLenderStatsError] = useState<string | null>(null);

  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [investorLoading, setInvestorLoading] = useState(isLender);
  const [investorError, setInvestorError] = useState<string | null>(null);

  const [lenderIsEditing, setLenderIsEditing] = useState(false);
  const [lenderForm, setLenderForm] = useState<LenderFormState | null>(null);
  const [lenderSaving, setLenderSaving] = useState(false);
  const [lenderSaveError, setLenderSaveError] = useState<string | null>(null);
  const [lenderSaveSuccess, setLenderSaveSuccess] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError(null);

    try {
      const data = await profileApi.getProfile();
      setProfile(data.profile);
      if (data.profile?.username) {
        setCurrentUsername(data.profile.username);
      }
      setCompletionItems(data.completionItems ?? []);
    } catch (e) {
      console.error("Failed to load profile", e);
      setProfileError(t("common.requestFailed"));
    } finally {
      setLoadingProfile(false);
    }
  }, [t]);

  useEffect(() => {
    if (isLender) {
      setLoadingProfile(false);
      return;
    }

    loadProfile();
  }, [isLender, loadProfile]);

  useEffect(() => {
    if (isLender) {
      setTrustLoading(false);
      return;
    }
    async function loadTrust() {
      setTrustLoading(true);
      setTrustError(null);
      try {
        const data = await trustApi.getTrustScore();
        setTrustScore(data);
      } catch (e) {
        console.error("Failed to load trust score", e);
        setTrustError(t("common.requestFailed"));
      } finally {
        setTrustLoading(false);
      }
    }
    loadTrust();
  }, [isLender, t]);

  useEffect(() => {
    if (isLender) {
      setGuarantorLoading(false);
      return;
    }
    async function loadGuarantor() {
      setGuarantorLoading(true);
      setGuarantorError(null);
      try {
        const data = await guarantorApi.getGuarantor();
        setGuarantor(data);
      } catch (e) {
        console.error("Failed to load guarantor", e);
        setGuarantorError(t("common.requestFailed"));
      } finally {
        setGuarantorLoading(false);
      }
    }
    loadGuarantor();
  }, [isLender, t]);

  useEffect(() => {
    if (!isLender) return;
    let cancelled = false;
    async function loadInvestorProfile() {
      setInvestorLoading(true);
      setInvestorError(null);
      try {
        const data = await investorApi.getInvestorProfile();
        if (!cancelled) {
          setInvestorProfile(data);
          if (data.username) {
            setCurrentUsername(data.username);
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load investor profile", e);
          setInvestorError(t("common.requestFailed"));
        }
      } finally {
        if (!cancelled) setInvestorLoading(false);
      }
    }
    loadInvestorProfile();
    return () => {
      cancelled = true;
    };
  }, [isLender, t]);

  useEffect(() => {
    if (!isLender) return;
    setLenderStatsLoading(true);
    setLenderStatsError(null);
    (async () => {
      try {
        const [total, completed] = await Promise.all([
          loansApi.getLoansCountByStatus(),
          loansApi.getLoansCountByStatus("completed"),
        ]);
        setLenderStats({ total, completed });
      } catch (e) {
        console.error("Failed to load loan statistics", e);
        setLenderStatsError(t("common.requestFailed"));
      } finally {
        setLenderStatsLoading(false);
      }
    })();
  }, [isLender, t]);

  function startLenderEdit() {
    if (!investorProfile) return;
    setLenderForm({
      username: toFormValue(currentUsername || investorProfile.username || user.username),
      displayName: toFormValue(investorProfile.displayName),
      companyName: toFormValue(investorProfile.company?.name),
      companyAddress: toFormValue(investorProfile.company?.address),
      companyBranch: toFormValue(investorProfile.company?.branch),
      companyGoal: toFormValue(investorProfile.company?.goal),
      fundingCapacity: toFormValue(investorProfile.fundingCapacity),
      maxExposure: toFormValue(investorProfile.maxExposure),
      riskPreference: toFormValue(investorProfile.riskPreference),
      preferredCategories: investorProfile.preferredCategories ?? [],
      partnerAgentId: "",
    });
    setLenderSaveError(null);
    setLenderSaveSuccess(false);
    setLenderIsEditing(true);
  }

  function cancelLenderEdit() {
    setLenderIsEditing(false);
    setLenderForm(null);
    setLenderSaveError(null);
  }

  function updateLenderForm<K extends keyof LenderFormState>(key: K, value: LenderFormState[K]) {
    setLenderForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function togglePreferredCategory(category: string) {
    setLenderForm((f) =>
      f
        ? {
            ...f,
            preferredCategories: f.preferredCategories.includes(category)
              ? f.preferredCategories.filter((c) => c !== category)
              : [...f.preferredCategories, category],
          }
        : f,
    );
  }

  async function handleLenderSave() {
    if (!lenderForm) return;
    const cleanUsername = lenderForm.username.trim();
    if (cleanUsername) {
      if (
        cleanUsername.length < 3 ||
        cleanUsername.length > 50 ||
        !/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)
      ) {
        setLenderSaveError("Username must be 3-50 letters, numbers, dots, underscores, or hyphens");
        return;
      }
    }
    setLenderSaving(true);
    setLenderSaveError(null);
    try {
      const data = await investorApi.updateInvestorProfile({
        username: cleanUsername || undefined,
        displayName: lenderForm.displayName.trim() || undefined,
        companyName: lenderForm.companyName.trim() || undefined,
        companyAddress: lenderForm.companyAddress.trim() || undefined,
        companyBranch: lenderForm.companyBranch.trim() || undefined,
        companyGoal: lenderForm.companyGoal.trim() || undefined,
        fundingCapacity:
          lenderForm.fundingCapacity !== "" ? Number(lenderForm.fundingCapacity) : undefined,
        maxExposure: lenderForm.maxExposure !== "" ? Number(lenderForm.maxExposure) : undefined,
        riskPreference: lenderForm.riskPreference || undefined,
        preferredCategories: lenderForm.preferredCategories,
      });
      setInvestorProfile(data);
      if (cleanUsername) {
        setCurrentUsername(cleanUsername);
      }
      setLenderIsEditing(false);
      setLenderForm(null);
      setLenderSaveSuccess(true);
      router.refresh();
    } catch (e) {
      console.error("Failed to save lender profile", e);
      setLenderSaveError(t("common.requestFailed"));
    } finally {
      setLenderSaving(false);
    }
  }

  function startEdit() {
    if (!profile) return;
    setForm({
      username: toFormValue(currentUsername || profile.username || user.username),
      fullName: toFormValue(profile.full_name),
      dateOfBirth: profile.date_of_birth ? profile.date_of_birth.slice(0, 10) : "",
      gender: toFormValue(profile.gender),
      nidNumber: toFormValue(profile.nid_number),
      addressLine: toFormValue(profile.address_line),
      city: toFormValue(profile.city),
      district: toFormValue(profile.district),
      postalCode: toFormValue(profile.postal_code),
      occupation: toFormValue(profile.occupation),
      monthlyFamilyIncome: toFormValue(profile.monthly_family_income),
      employmentType: toFormValue(profile.employment_type),
      employerName: toFormValue(profile.employer_name),
      monthlyIncome: toFormValue(profile.monthly_income),
      monthlySavings: toFormValue(profile.monthly_savings),
      incomeSource: toFormValue(profile.income_source),
      institutionId: profile.institution_id,
      institutionName: toFormValue(profile.institution_name),
      studentId: toFormValue(profile.student_id),
      enrollmentYear: toFormValue(profile.enrollment_year),
    });
    setSaveError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setForm(null);
    setSaveError(null);
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSave() {
    if (!form) return;
    const cleanUsername = form.username.trim();
    if (cleanUsername) {
      if (
        cleanUsername.length < 3 ||
        cleanUsername.length > 50 ||
        !/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)
      ) {
        setSaveError("Username must be 3-50 letters, numbers, dots, underscores, or hyphens");
        return;
      }
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload: Record<string, unknown> = {
        username: cleanUsername || undefined,
        fullName: form.fullName.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        nidNumber: form.nidNumber || undefined,
        addressLine: form.addressLine || undefined,
        city: form.city || undefined,
        district: form.district || undefined,
        postalCode: form.postalCode || undefined,
        occupation: form.occupation || undefined,
        monthlyFamilyIncome:
          form.monthlyFamilyIncome !== "" ? Number(form.monthlyFamilyIncome) : undefined,
        employmentType: form.employmentType || undefined,
        employerName: form.employerName || undefined,
        monthlyIncome: form.monthlyIncome !== "" ? Number(form.monthlyIncome) : undefined,
        monthlySavings: form.monthlySavings !== "" ? Number(form.monthlySavings) : undefined,
        incomeSource: form.incomeSource || undefined,
        institutionId: form.institutionId ?? null,
        studentId: form.studentId || undefined,
        enrollmentYear: form.enrollmentYear !== "" ? parseInt(form.enrollmentYear, 10) : undefined,
      };
      await profileApi.updateProfile(payload);
      if (cleanUsername) {
        setCurrentUsername(cleanUsername);
      }
      await loadProfile();
      setIsEditing(false);
      setForm(null);
      setSaveSuccess(true);
      router.refresh();
    } catch (e) {
      console.error("Failed to save profile", e);
      setSaveError(t("common.requestFailed"));
    } finally {
      setSaving(false);
    }
  }

  const userName = getDisplayName(user, currentUsername || user.username || "Account");
  const username = currentUsername || user.username?.trim() || "Not set";
  const avatarInitials = (
    (isLender ? investorProfile?.displayName : null) ||
    profile?.full_name ||
    user.username ||
    user.email ||
    "?"
  )
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const completedCount = completionItems.filter((i) => i.completed).length;

  return (
    <AppLayout
      onNavigate={onNavigate}
      currentPage="profile"
      userType={isLender ? "lender" : user.role === "admin" ? "admin" : "borrower"}
      userName={userName}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <PageHeader
          eyebrow={t("settings.account")}
          title={t("profile.title")}
          description={t("profile.description")}
        />

        {!isLender && profileError && (
          <Alert variant="error" title={t("profile.notFoundTitle")} className="mb-5">
            {profileError}
          </Alert>
        )}

        {!isLender && saveSuccess && !isEditing && (
          <Alert variant="success" title={t("common.save")} dismissible className="mb-5">
            {t("common.save")}
          </Alert>
        )}

        {isLender && lenderSaveSuccess && !lenderIsEditing && (
          <Alert variant="success" title={t("common.save")} dismissible className="mb-5">
            {t("common.save")}
          </Alert>
        )}

        {isLender ? (
          investorLoading ? (
            <Card>
              <CardBody>
                <p className="text-sm text-stone-500">{t("common.loading")}</p>
              </CardBody>
            </Card>
          ) : investorError ? (
            <Alert variant="error" title={t("profile.notFoundTitle")}>
              {investorError}
            </Alert>
          ) : investorProfile ? (
            <div className="flex flex-col gap-5">
              <Card variant="raised">
                <CardBody className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-teal text-white flex items-center justify-center text-lg font-semibold border-[1.5px] border-navy shrink-0">
                    {avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-navy truncate">@{username}</p>
                    <p className="text-sm text-stone-500 truncate">
                      {investorProfile.displayName || t("common.notSet")}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="teal" size="sm">
                        Lender / Investor
                      </Badge>
                      <Badge
                        variant={
                          verificationStatusVariant[
                            investorProfile.verificationStatus ?? "pending"
                          ] ?? "neutral"
                        }
                        size="sm"
                        dot
                      >
                        {t(
                          enumKey("verification", investorProfile.verificationStatus ?? "pending"),
                        )}
                      </Badge>
                      <Badge
                        variant={
                          completionStatusVariant[investorProfile.kycStatus ?? "incomplete"] ??
                          "neutral"
                        }
                        size="sm"
                        dot
                      >
                        KYC: {t(enumKey("verification", investorProfile.kycStatus ?? "incomplete"))}
                      </Badge>
                    </div>
                  </div>
                  {!lenderIsEditing && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={startLenderEdit}
                      className="shrink-0"
                    >
                      {t("profile.editProfile")}
                    </Button>
                  )}
                </CardBody>
              </Card>

              {lenderSaveError && (
                <Alert variant="error" title="Couldn't save your profile">
                  {lenderSaveError}
                </Alert>
              )}

              {lenderIsEditing && lenderForm ? (
                <Card>
                  <CardHeader
                    title={t("profile.editProfile")}
                    description="Update your details below, then save your changes."
                  />
                  <CardBody className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextInput
                        label={t("auth.username") || "Username"}
                        value={lenderForm.username}
                        onChange={(e) => updateLenderForm("username", e.target.value)}
                        hint="3-50 letters, numbers, dots, underscores, or hyphens"
                        autoComplete="username"
                        required
                      />
                      <TextInput
                        label="Display name"
                        value={lenderForm.displayName}
                        onChange={(e) => updateLenderForm("displayName", e.target.value)}
                      />
                      <TextInput
                        label="Company / organization name"
                        value={lenderForm.companyName}
                        onChange={(e) => updateLenderForm("companyName", e.target.value)}
                      />
                      <TextInput
                        label="Company address"
                        value={lenderForm.companyAddress}
                        onChange={(e) => updateLenderForm("companyAddress", e.target.value)}
                      />
                      <TextInput
                        label="Branch"
                        value={lenderForm.companyBranch}
                        onChange={(e) => updateLenderForm("companyBranch", e.target.value)}
                      />
                      <TextInput
                        label="Lending goal"
                        value={lenderForm.companyGoal}
                        onChange={(e) => updateLenderForm("companyGoal", e.target.value)}
                      />
                    </div>
                    <div className="border-t border-stone-200 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <CurrencyInput
                        label={t("profile.fundingCapacity")}
                        value={lenderForm.fundingCapacity}
                        onChange={(e) => updateLenderForm("fundingCapacity", e.target.value)}
                      />
                      <CurrencyInput
                        label={t("profile.maxExposure")}
                        value={lenderForm.maxExposure}
                        onChange={(e) => updateLenderForm("maxExposure", e.target.value)}
                      />
                      <Select
                        label={t("profile.riskPreference")}
                        value={lenderForm.riskPreference}
                        onChange={(e) => updateLenderForm("riskPreference", e.target.value)}
                        options={riskPreferenceOptions.map((o) => ({
                          ...o,
                          label: t(enumKey("risk", o.value)),
                        }))}
                        placeholder="Select"
                      />
                    </div>
                    <div className="border-t border-stone-200 pt-5 flex flex-col gap-2">
                      <p className="text-sm font-medium text-navy">
                        {t("profile.preferredCategories")}
                      </p>
                      {supportedCategories.map((category) => (
                        <Checkbox
                          key={category.value}
                          label={t(enumKey("category", category.value))}
                          checked={lenderForm.preferredCategories.includes(category.value)}
                          onChange={() => togglePreferredCategory(category.value)}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-end gap-2 border-t border-stone-200 pt-5">
                      <Button variant="ghost" onClick={cancelLenderEdit} disabled={lenderSaving}>
                        {t("common.cancel")}
                      </Button>
                      <Button variant="primary" onClick={handleLenderSave} loading={lenderSaving}>
                        {t("common.save")}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : null}

              <Card>
                <CardHeader title={t("profile.company")} description={t("profile.companyHint")} />
                <CardBody>
                  <DataRow
                    label={t("auth.username") || "Username"}
                    value={currentUsername ? `@${currentUsername}` : "—"}
                  />
                  <DataRow label="Company name" value={investorProfile.company?.name || "—"} />
                  <DataRow label="Address" value={investorProfile.company?.address || "—"} />
                  <DataRow label="Branch" value={investorProfile.company?.branch || "—"} />
                  <DataRow label="Lending goal" value={investorProfile.company?.goal || "—"} />
                  <DataRow
                    label="Contact email"
                    value={investorProfile.company?.contactEmail || "—"}
                  />
                  <DataRow
                    label="Contact phone"
                    value={investorProfile.company?.contactPhone || "—"}
                  />
                </CardBody>
              </Card>

              <Card>
                <CardHeader title={t("profile.investmentProfile")} />
                <CardBody>
                  <DataRow
                    label={t("profile.fundingCapacity")}
                    value={
                      investorProfile.fundingCapacity != null
                        ? formatTaka(Number(investorProfile.fundingCapacity))
                        : "—"
                    }
                  />
                  <DataRow
                    label={t("profile.maxExposure")}
                    value={
                      investorProfile.maxExposure != null
                        ? formatTaka(Number(investorProfile.maxExposure))
                        : "—"
                    }
                  />
                  <DataRow
                    label={t("profile.riskPreference")}
                    value={
                      investorProfile.riskPreference
                        ? t(enumKey("risk", investorProfile.riskPreference))
                        : "—"
                    }
                  />
                  <DataRow
                    label={t("profile.preferredCategories")}
                    value={
                      investorProfile.preferredCategories &&
                      investorProfile.preferredCategories.length > 0
                        ? investorProfile.preferredCategories
                            .map((c) => t(enumKey("category", c)))
                            .join(", ")
                        : "—"
                    }
                  />
                </CardBody>
              </Card>

              <Card>
                <CardHeader title={t("profile.lendingStatistics")} />
                {lenderStatsLoading ? (
                  <CardBody>
                    <p className="text-sm text-stone-500">{t("common.loading")}</p>
                  </CardBody>
                ) : lenderStatsError ? (
                  <CardBody>
                    <Alert variant="error" title="Couldn't load loan statistics">
                      {lenderStatsError}
                    </Alert>
                  </CardBody>
                ) : (
                  <CardBody>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-stone-500 uppercase tracking-wide">
                          {t("profile.totalLoansFunded")}
                        </p>
                        <p className="tabular-nums text-2xl font-semibold text-navy mt-1">
                          {lenderStats?.total ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 uppercase tracking-wide">
                          {t("profile.completedLoans")}
                        </p>
                        <p className="tabular-nums text-2xl font-semibold text-navy mt-1">
                          {lenderStats?.completed ?? 0}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                )}
              </Card>
            </div>
          ) : (
            <EmptyState
              icon={EmptyIcons.error}
              title={t("profile.notFoundTitle")}
              description={t("profile.notFoundDescription")}
            />
          )
        ) : loadingProfile ? (
          <Card>
            <CardBody>
              <p className="text-sm text-stone-500">{t("common.loading")}</p>
            </CardBody>
          </Card>
        ) : profile ? (
          <div className="flex flex-col gap-5">
            <Card variant="raised">
              <CardBody className="flex flex-col sm:flex-row sm:items-center gap-4">
                {profile.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover border-[1.5px] border-navy shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-teal text-white flex items-center justify-center text-lg font-semibold border-[1.5px] border-navy shrink-0">
                    {avatarInitials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold text-navy truncate">@{username}</p>
                  <p className="text-sm text-stone-500 truncate">
                    {profile.full_name || t("common.notSet")}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="teal" size="sm" className="capitalize">
                      {t(enumKey("role", String(user.role || "borrower")))}
                    </Badge>
                    <Badge
                      variant={
                        completionStatusVariant[profile.profile_completion_status ?? "incomplete"]
                      }
                      size="sm"
                      dot
                    >
                      {t(
                        enumKey("verification", profile.profile_completion_status ?? "incomplete"),
                      )}
                    </Badge>
                    {completionItems.length > 0 && (
                      <span className="text-xs text-stone-500">
                        {completedCount}/{completionItems.length} items complete
                      </span>
                    )}
                  </div>
                </div>
                {!isEditing && (
                  <Button variant="secondary" size="sm" onClick={startEdit} className="shrink-0">
                    {t("profile.editProfile")}
                  </Button>
                )}
              </CardBody>
            </Card>

            {saveError && (
              <Alert variant="error" title="Couldn't save your profile">
                {saveError}
              </Alert>
            )}

            {isEditing && form ? (
              <Card>
                <CardHeader
                  title={t("profile.editProfile")}
                  description="Update your details below, then save your changes."
                />
                <CardBody className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                      label={t("auth.username") || "Username"}
                      value={form.username}
                      onChange={(e) => updateForm("username", e.target.value)}
                      hint="3-50 letters, numbers, dots, underscores, or hyphens"
                      autoComplete="username"
                      required
                    />
                    <TextInput
                      label="Full name"
                      value={form.fullName}
                      onChange={(e) => updateForm("fullName", e.target.value)}
                    />
                    <TextInput
                      label="Date of birth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => updateForm("dateOfBirth", e.target.value)}
                    />
                    <Select
                      label="Gender"
                      value={form.gender}
                      onChange={(e) => updateForm("gender", e.target.value)}
                      options={genderOptions.map((value) => ({
                        value,
                        label: t(enumKey("gender", value)),
                      }))}
                      placeholder="Select"
                    />
                    <TextInput
                      label="National ID number"
                      value={form.nidNumber}
                      onChange={(e) => updateForm("nidNumber", e.target.value)}
                    />
                    <TextInput
                      label="Address"
                      value={form.addressLine}
                      onChange={(e) => updateForm("addressLine", e.target.value)}
                    />
                    <TextInput
                      label="City"
                      value={form.city}
                      onChange={(e) => updateForm("city", e.target.value)}
                    />
                    <TextInput
                      label="District"
                      value={form.district}
                      onChange={(e) => updateForm("district", e.target.value)}
                    />
                    <TextInput
                      label="Postal code"
                      value={form.postalCode}
                      onChange={(e) => updateForm("postalCode", e.target.value)}
                    />
                    <TextInput
                      label="Occupation"
                      value={form.occupation}
                      onChange={(e) => updateForm("occupation", e.target.value)}
                    />
                    <CurrencyInput
                      label="Monthly family income"
                      value={form.monthlyFamilyIncome}
                      onChange={(e) => updateForm("monthlyFamilyIncome", e.target.value)}
                    />
                  </div>
                  <div className="border-t border-stone-200 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Employment type"
                      value={form.employmentType}
                      onChange={(e) => updateForm("employmentType", e.target.value)}
                      options={employmentOptions.map((o) => ({
                        ...o,
                        label: t(enumKey("employment", o.value)),
                      }))}
                      placeholder="Select"
                    />
                    <TextInput
                      label="Employer / business"
                      value={form.employerName}
                      onChange={(e) => updateForm("employerName", e.target.value)}
                    />
                    <CurrencyInput
                      label="Monthly income"
                      value={form.monthlyIncome}
                      onChange={(e) => updateForm("monthlyIncome", e.target.value)}
                    />
                    <CurrencyInput
                      label="Monthly savings"
                      value={form.monthlySavings}
                      onChange={(e) => updateForm("monthlySavings", e.target.value)}
                    />
                    <TextInput
                      label="Income source"
                      value={form.incomeSource}
                      onChange={(e) => updateForm("incomeSource", e.target.value)}
                    />
                  </div>
                  <div className="border-t border-stone-200 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InstitutionCombobox
                      label="Institution"
                      value={form.institutionName}
                      institutionId={form.institutionId}
                      onChange={({ id, name }) => {
                        updateForm("institutionId", id);
                        updateForm("institutionName", name);
                      }}
                      hint="Search for your college or university"
                    />
                    <TextInput
                      label="Student ID"
                      value={form.studentId}
                      onChange={(e) => updateForm("studentId", e.target.value)}
                    />
                    <TextInput
                      label="Enrollment year"
                      type="number"
                      value={form.enrollmentYear}
                      onChange={(e) => updateForm("enrollmentYear", e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-stone-200 pt-5">
                    <Button variant="ghost" onClick={cancelEdit} disabled={saving}>
                      {t("common.cancel")}
                    </Button>
                    <Button variant="primary" onClick={handleSave} loading={saving}>
                      {t("common.save")}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader title={t("profile.personalIdentity")} />
                  <CardBody>
                    <DataRow
                      label={t("auth.username") || "Username"}
                      value={currentUsername ? `@${currentUsername}` : "—"}
                    />
                    <DataRow label="Full name" value={profile.full_name || "—"} />
                    <DataRow
                      label="Date of birth"
                      value={profile.date_of_birth ? formatDate(profile.date_of_birth) : "—"}
                    />
                    <DataRow
                      label="Gender"
                      value={profile.gender ? t(enumKey("gender", profile.gender)) : "—"}
                    />
                    <DataRow label="National ID number" value={profile.nid_number || "—"} />
                    <DataRow label="Address" value={profile.address_line || "—"} />
                    <DataRow label="City" value={profile.city || "—"} />
                    <DataRow label="District" value={profile.district || "—"} />
                    <DataRow label="Postal code" value={profile.postal_code || "—"} />
                    <DataRow label="Email" value={profile.email} />
                    <DataRow label="Phone" value={profile.phone || "—"} />
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title={t("profile.financialProfile")} />
                  <CardBody>
                    <DataRow label="Occupation" value={profile.occupation || "—"} />
                    <DataRow
                      label="Monthly family income"
                      value={
                        profile.monthly_family_income != null
                          ? `৳${Number(profile.monthly_family_income).toLocaleString("en-IN")}`
                          : "—"
                      }
                    />
                    <DataRow
                      label="Employment type"
                      value={
                        profile.employment_type
                          ? t(enumKey("employment", profile.employment_type))
                          : "—"
                      }
                    />
                    <DataRow label="Employer / business" value={profile.employer_name || "—"} />
                    <DataRow
                      label="Monthly income"
                      value={
                        profile.monthly_income != null
                          ? `৳${Number(profile.monthly_income).toLocaleString("en-IN")}`
                          : "—"
                      }
                    />
                    <DataRow
                      label="Monthly savings"
                      value={
                        profile.monthly_savings != null
                          ? `৳${Number(profile.monthly_savings).toLocaleString("en-IN")}`
                          : "—"
                      }
                    />
                    <DataRow
                      label="Income source"
                      value={
                        profile.income_source
                          ? t(enumKey("incomeSource", profile.income_source))
                          : "—"
                      }
                    />
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title={t("profile.education")} />
                  <CardBody>
                    <DataRow label="Institution" value={profile.institution_name || "—"} />
                    <DataRow label="Student ID" value={profile.student_id || "—"} />
                    <DataRow
                      label="Enrollment year"
                      value={profile.enrollment_year ? String(profile.enrollment_year) : "—"}
                    />
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader
                    title={t("profile.guarantorInfo")}
                    description={t("profile.guarantorHint")}
                    action={
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onNavigate("onboarding")}
                      >
                        {guarantor ? t("profile.updateGuarantor") : t("profile.addGuarantor")}
                      </Button>
                    }
                  />
                  {guarantorLoading ? (
                    <CardBody>
                      <p className="text-sm text-stone-500">{t("common.loading")}</p>
                    </CardBody>
                  ) : guarantorError ? (
                    <CardBody>
                      <Alert variant="error" title="Couldn't load guarantor">
                        {guarantorError}
                      </Alert>
                    </CardBody>
                  ) : guarantor ? (
                    <CardBody>
                      <DataRow label="Full name" value={guarantor.fullName} />
                      <DataRow
                        label="Relationship"
                        value={
                          guarantor.relationship
                            ? t(enumKey("relationship", guarantor.relationship))
                            : "—"
                        }
                      />
                      <DataRow label="Phone" value={guarantor.phone || "—"} />
                      <DataRow label="Email" value={guarantor.email || "—"} />
                      <DataRow label="NID" value={guarantor.nidNumber || "—"} />
                      <DataRow label="Address" value={guarantor.address || "—"} />
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-stone-500">Verification status</span>
                        <Badge variant={guarantor.isVerified ? "success" : "warning"} size="sm" dot>
                          {guarantor.isVerified
                            ? t(enumKey("verification", "approved"))
                            : t(enumKey("verification", "pending"))}
                        </Badge>
                      </div>
                    </CardBody>
                  ) : (
                    <CardBody>
                      <EmptyState
                        size="sm"
                        title={t("profile.noGuarantor")}
                        description={t("profile.noGuarantorHint")}
                      />
                    </CardBody>
                  )}
                </Card>
              </>
            )}

            {/* Payment Accounts */}
            <PaymentAccountsManager />

            <Card>
              <CardHeader
                title={t("profile.trustScore")}
                description={t("profile.trustScoreHint")}
              />
              {trustLoading ? (
                <CardBody>
                  <p className="text-sm text-stone-500">{t("common.loading")}</p>
                </CardBody>
              ) : trustError ? (
                <CardBody>
                  <Alert variant="error" title="Couldn't load trust score">
                    {trustError}
                  </Alert>
                </CardBody>
              ) : trustScore ? (
                <CardBody className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wide">Score</p>
                      <p className="font-display tabular-nums text-3xl font-semibold text-navy">
                        {Math.round(trustScore.score)}
                        <span className="text-base text-stone-400">/100</span>
                      </p>
                    </div>
                    <Badge variant={trustBandVariant[trustScore.band] ?? "neutral"} dot>
                      {t(enumKey("trustBand", trustScore.band))}
                    </Badge>
                    {trustScore.isFirstTimeBorrower && (
                      <Badge variant="neutral" size="sm">
                        {t("profile.firstTimeBorrower")}
                      </Badge>
                    )}
                    <div className="ml-auto text-right">
                      <p className="text-xs text-stone-500">{t("profile.confidence")}</p>
                      <p className="tabular-nums text-sm font-medium text-navy">
                        {Math.round(trustScore.confidenceScore)}%
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400">
                    {t("profile.lastUpdated", { date: formatDate(trustScore.lastUpdated) })}
                  </p>
                  {trustScore.factors.length > 0 && (
                    <div className="border-t border-stone-200 pt-4 flex flex-col gap-3">
                      {trustScore.factors.map((factor) => (
                        <div key={factor.name} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-navy capitalize">
                              {factorNameLabel[factor.name] ?? "—"}
                            </span>
                            <span className="tabular-nums text-sm text-stone-500">
                              {Math.round(factor.score)}
                              {factor.weight ? ` · ${Math.round(factor.weight * 100)}% weight` : ""}
                            </span>
                          </div>
                          {factor.description && (
                            <p className="text-xs text-stone-500">{factor.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              ) : (
                <CardBody>
                  <EmptyState
                    icon={EmptyIcons.search}
                    size="sm"
                    title={t("profile.noTrustScoreTitle")}
                    description={t("profile.noTrustScoreDescription")}
                  />
                </CardBody>
              )}
            </Card>
          </div>
        ) : (
          <EmptyState
            icon={EmptyIcons.error}
            title={t("profile.notFoundTitle")}
            description={t("profile.notFoundDescription")}
          />
        )}
      </div>
    </AppLayout>
  );
}
