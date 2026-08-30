import { useEffect, useState } from "react";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { TextInput, Select, Radio, Checkbox, FileUpload } from "../components/Input";
import { Stepper } from "../components/Progress";
import InstitutionCombobox from "../components/InstitutionCombobox";
import { profileApi, documentsApi, verificationApi } from "../lib/api/index";
import type { PageName } from "../types";
interface OnboardingPageProps {
  onNavigate: (page: PageName) => void;
}

const steps = [
  { label: "Personal & ID", sublabel: "Identity" },
  { label: "Financial", sublabel: "Profile" },
  { label: "employmentType", sublabel: "Status" },
  { label: "Goals", sublabel: "" },
  { label: "Preferences", sublabel: "" },
];
const goalOptions = [
  "Pay for education or training",
  "Cover a medical emergency",
  "Start or grow a business",
  "Home repair or improvement",
  "Personal development",
  "Consolidate existing debt",
];
export default function OnboardingPage({ onNavigate }: OnboardingPageProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [doc_verif_req_id, set_doc_verif_req_id] = useState<string | null>(null);
  const [data, setData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    nidNumber: "",
    addressLine: "",
    city: "",
    nidFrontUploaded: false,
    nidBackUploaded: false,
    utilityBillUploaded: false,
    monthlyIncome: "",
    savingsAmount: "",
    existingLoans: "no",
    employmentType: "",
    employerName: "",
    jobTitle: "",
    incomeType: "",
    institutionId: null as string | null,
    institutionName: "",
    studentId: "",
    goals: [] as string[],
    notifEmail: true,
    notifSms: true,
    language: "en",
  });
  useEffect(() => {
    async function init() {
      try {
        const res = await profileApi.getProfileCompletion();
        // Here you might set step based on completion status if needed
        // console.log("Profile completion:", res.status);
      } catch (e) {
        console.error("Failed to load profile completion", e);
      }
    }
    init();
  }, []);
  const update = (k: string, v: string | boolean | string[]) => setData((d) => ({ ...d, [k]: v }));
  const toggleGoal = (g: string) => {
    setData((d) => ({
      ...d,
      goals: d.goals.includes(g) ? d.goals.filter((x) => x !== g) : [...d.goals, g],
    }));
  };
  const handleFileUpload = async (
  type: string,
  files: FileList | null,
  key: string,
) => {
  if (!files || files.length === 0) {
    update(key, false);
    return;
  }

  const file = files[0];

  try {
    let requestId = doc_verif_req_id;

    if (!requestId) {
      const response = await verificationApi.createVerificationRequest("document");
      requestId = response.request_id ?? response.id;

      if (!requestId) {
        throw new Error("Failed to create verification request");
      }

      set_doc_verif_req_id(requestId);
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const result = e.target?.result;

        if (typeof result !== "string") {
          throw new Error("Failed to read file");
        }

        const base64 = result.split(",")[1];

        await documentsApi.uploadDocument({
          documentType: type,
          verificationRequestId: requestId!,
          fileName: file.name,
          mimeType: file.type,
          fileData: base64,
        });

        update(key, true);
      } catch (err) {
        console.error("Upload failed", err);
      }
    };

    reader.readAsDataURL(file);
  } catch (err) {
    console.error("Failed to create verification request", err);
  }
};
  const next = async () => {
    try {
      await profileApi.updateProfile(data);
    } catch (e) {
      console.error("Failed to update profile", e);
    }
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      try {
        await profileApi.submitForVerification();
      } catch (e) {
        console.error("Failed to submit verification", e);
      }
      onNavigate("borrower-dashboard");
    }
  };
  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };
  const saveAndContinueLater = async () => {
    setSaving(true);
    try {
      await profileApi.updateProfile(data);
    } catch (e) {
      console.error("Failed to save profile", e);
    } finally {
      setSaving(false);
      onNavigate("landing");
    }
  };
  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      {}
      <header className="border-b border-stone-200 bg-white px-6 py-3 flex items-center justify-between">
        <Logo size="sm" onClick={() => onNavigate("landing")} />
        <Button variant="ghost" size="sm" onClick={saveAndContinueLater} loading={saving}>
          Save & continue later
        </Button>
      </header>
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        {}
        <div className="mb-10">
          <p className="text-xs text-stone-500 mb-4 text-center">
            Step {step + 1} of {steps.length} — let us get to know you
          </p>
          <Stepper steps={steps} currentStep={step} />
        </div>
        <div className="bg-white border-[1.5px] border-navy rounded-[8px] shadow-nb p-6 md:p-8">
          {}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">
                Personal information &amp; Identity
              </h2>
              <p className="text-sm text-stone-500 mb-6">
                This information helps us verify your identity once so you never have to re-enter it
                during loan applications.
              </p>
              <div className="grid grid-cols-1 gap-5">
                <TextInput
                  label="Full name"
                  placeholder="Rahim Uddin Ahmed"
                  required
                  value={data.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  hint="As it appears on your NID"
                />
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    label="Date of birth"
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(e) => update("dateOfBirth", e.target.value)}
                    required
                  />
                  <Select
                    label="Gender"
                    value={data.gender}
                    onChange={(e) => update("gender", e.target.value)}
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Prefer not to say" },
                    ]}
                    placeholder="Select"
                  />
                </div>
                <TextInput
                  label="National ID Number"
                  placeholder="1234567890"
                  value={data.nidNumber}
                  onChange={(e) => update("nidNumber", e.target.value)}
                  hint="Your 10 or 17 digit NID number"
                />
                <TextInput
                  label="addressLine"
                  placeholder="House 12, Road 5, Block C"
                  value={data.addressLine}
                  onChange={(e) => update("addressLine", e.target.value)}
                  required
                />
                <Select
                  label="City / District"
                  value={data.city}
                  onChange={(e) => update("city", e.target.value)}
                  options={[
                    { value: "dhaka", label: "Dhaka" },
                    { value: "chittagong", label: "Chittagong" },
                    { value: "sylhet", label: "Sylhet" },
                    { value: "rajshahi", label: "Rajshahi" },
                    { value: "khulna", label: "Khulna" },
                    { value: "other", label: "Other" },
                  ]}
                  placeholder="Select city"
                />

                <div className="border-t border-stone-200 pt-5 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-navy">National ID (NID) Photo</p>
                      <p className="text-xs text-stone-500">
                        Upload clear photos or scans of your original NID card for one-time
                        verification.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-light text-teal border border-teal/30">
                      One-time KYC
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FileUpload
                      label="NID Front Photo"
                      hint="Front side with photo and NID no"
                      onChange={(files) => handleFileUpload("nid_front", files, "nidFrontUploaded")}
                    />
                    <FileUpload
                      label="NID Back Photo"
                      hint="Back side with addressLine"
                      onChange={(files) => handleFileUpload("nid_back", files, "nidBackUploaded")}
                    />
                    <FileUpload
                      label="Utility Bill"
                      hint="Optional proof of addressLine"
                      onChange={(files) =>
                        handleFileUpload("utility_bill", files, "utilityBillUploaded")
                      }
                    />
                  </div>
                  <div className="bg-sky-light/60 border border-sky/30 rounded-[6px] p-3 mt-3 flex items-start gap-2.5">
                    <span className="text-sm text-sky font-bold mt-0.5">ℹ</span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Your identity verification is saved securely. When applying for loans in the
                      future, you will not need to provide your NID photo, full name, or addressLine
                      again.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">Financial profile</h2>
              <p className="text-sm text-stone-500 mb-6">
                This helps us match you to loans you are likely to qualify for. It does not affect
                your credit score.
              </p>
              <div className="grid grid-cols-1 gap-5">
                <TextInput
                  label="Monthly income (approx.)"
                  type="number"
                  placeholder="25000"
                  value={data.monthlyIncome}
                  onChange={(e) => update("monthlyIncome", e.target.value)}
                  prefix="৳"
                  hint="After tax, in BDT"
                />
                <TextInput
                  label="Monthly savings (approx.)"
                  type="number"
                  placeholder="5000"
                  value={data.savingsAmount}
                  onChange={(e) => update("savingsAmount", e.target.value)}
                  prefix="৳"
                />
                <div>
                  <p className="text-sm font-medium text-navy mb-3">
                    Do you have any existing loans?
                  </p>
                  <div className="flex gap-6">
                    <Radio
                      label="Yes"
                      name="existing-loans"
                      value="yes"
                      checked={data.existingLoans === "yes"}
                      onChange={(v) => update("existingLoans", v)}
                    />
                    <Radio
                      label="No"
                      name="existing-loans"
                      value="no"
                      checked={data.existingLoans === "no"}
                      onChange={(v) => update("existingLoans", v)}
                    />
                  </div>
                </div>
                <div className="bg-sky-light border border-sky/30 rounded-[6px] p-4">
                  <p className="text-xs font-medium text-sky mb-1">ℹ Why we ask this</p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    This financial snapshot helps loan providers assess your application. We never
                    sell your data, and this does not impact your credit report.
                  </p>
                </div>
              </div>
            </div>
          )}
          {}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">employmentType & income</h2>
              <p className="text-sm text-stone-500 mb-6">
                Tell us about your current work or study status.
              </p>
              <div className="grid grid-cols-1 gap-5">
                <Select
                  label="employmentType status"
                  value={data.employmentType}
                  onChange={(e) => update("employmentType", e.target.value)}
                  options={[
                    { value: "employed-full", label: "Employed (Full-time)" },
                    { value: "employed-part", label: "Employed (Part-time)" },
                    { value: "self-employed", label: "Self-employed / Freelancer" },
                    { value: "business", label: "Business owner" },
                    { value: "student", label: "Student" },
                    { value: "unemployed", label: "Currently not working" },
                  ]}
                  placeholder="Select status"
                  required
                />
                {data.employmentType === "student" && (
                  <>
                    <InstitutionCombobox
                      label="Institution"
                      value={data.institutionName}
                      institutionId={data.institutionId}
                      onChange={({ id, name }) => {
                        update("institutionId", id || "");
                        update("institutionName", name);
                      }}
                      required
                      hint="Search for your college or university"
                    />
                    <TextInput
                      label="Student ID"
                      placeholder="e.g., 2021-1-60-001"
                      value={data.studentId}
                      onChange={(e) => update("studentId", e.target.value)}
                    />
                  </>
                )}
                {data.employmentType &&
                  data.employmentType !== "student" &&
                  data.employmentType !== "unemployed" && (
                    <>
                      <TextInput
                        label="employerName / Business name"
                        placeholder="XYZ Company Ltd."
                        value={data.employerName}
                        onChange={(e) => update("employerName", e.target.value)}
                      />
                      <TextInput
                        label="Job title / Role"
                        placeholder="Software Engineer"
                        value={data.jobTitle}
                        onChange={(e) => update("jobTitle", e.target.value)}
                      />
                    </>
                  )}
                <Select
                  label="Primary income type"
                  value={data.incomeType}
                  onChange={(e) => update("incomeType", e.target.value)}
                  options={[
                    { value: "salary", label: "Monthly salary" },
                    { value: "business", label: "Business income" },
                    { value: "freelance", label: "Freelance / Contract" },
                    { value: "remittance", label: "Remittance" },
                    { value: "parental", label: "Parental support" },
                    { value: "other", label: "Other" },
                  ]}
                  placeholder="Select income type"
                />
              </div>
            </div>
          )}
          {}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">Your financial goals</h2>
              <p className="text-sm text-stone-500 mb-6">
                What are you hoping to use a loan for? Select all that apply. This helps us show you
                the most relevant products.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goalOptions.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={`text-left px-4 py-3 border-[1.5px] rounded-[6px] text-sm font-medium transition-all ${
                      data.goals.includes(g)
                        ? "bg-teal-light border-teal text-teal"
                        : "bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:text-navy"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {data.goals.length > 0 && (
                <p className="mt-4 text-xs text-teal">
                  {data.goals.length} goal{data.goals.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}
          {/* Step 4: Preferences */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">Your preferences</h2>
              <p className="text-sm text-stone-500 mb-6">
                Almost done — just a few last preferences to personalise your experience.
              </p>
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-sm font-medium text-navy mb-3">Notification preferences</p>
                  <div className="flex flex-col gap-3">
                    <Checkbox
                      label="Email notifications for repayment reminders and updates"
                      checked={data.notifEmail}
                      onChange={(v) => update("notifEmail", v)}
                    />
                    <Checkbox
                      label="SMS reminders for upcoming payments"
                      checked={data.notifSms}
                      onChange={(v) => update("notifSms", v)}
                    />
                  </div>
                </div>
                <Select
                  label="Preferred language"
                  value={data.language}
                  onChange={(e) => update("language", e.target.value)}
                  options={[
                    { value: "en", label: "English" },
                    { value: "bn", label: "বাংলা (Bangla)" },
                  ]}
                />
                <div className="bg-emerald-light border border-emerald/30 rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-emerald mb-1">You are almost ready!</p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    After completing setup, you will be taken to your personalised dashboard where
                    you can explore loan products matched to your profile.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        {}
        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" size="md" onClick={back} disabled={step === 0}>
            ← Back
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 tabular-nums">
              {step + 1}/{steps.length}
            </span>
            <Button variant="primary" size="md" onClick={next}>
              {step === steps.length - 1 ? "Finish Setup →" : "Continue →"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
