import { useState } from "react";
import { FileUpload } from "../components/Input";
import { documentsApi, verificationApi } from "../lib/api/index";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { TextInput, Select, Radio } from "../components/Input";
import { Stepper } from "../components/Progress";
import { updateInvestorProfile } from "../lib/api/investor";
import type { PageName } from "../types";

interface Props {
  onNavigate: (page: PageName) => void;
}

const steps = [
  { label: "Personal Info", sublabel: "Details" },
  { label: "Capacity", sublabel: "Funding" },
  { label: "Preferences", sublabel: "Risk" },
];

export default function InvestorOnboarding({ onNavigate }: Props) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [documentVerificationRequestId, setDocumentVerificationRequestId] = useState<string | null>(null);
  const [documents, setDocuments] = useState({
    tinCertificateUploaded: false,
    tradeLicenseUploaded: false,
    incorporationCertificateUploaded: false,
    regulatoryLicenseUploaded: false,
  });
  const [data, setData] = useState({
    fullName: "",
    phone: "",
    fundingCapacity: "",
    riskPreference: "moderate",
    investmentGoals: "growth",
  });

  const update = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));
  const handleDocumentUpload = async (
    type: string,
    files: FileList | null,
    key: keyof typeof documents,
  ) => {
    if (!files || files.length === 0) {
      setDocuments((d) => ({ ...d, [key]: false }));
      return;
    }

    const file = files[0];

    try {
      let requestId = documentVerificationRequestId;

      if (!requestId) {
        const response = await verificationApi.createVerificationRequest("document");
        requestId = response.request_id ?? response.id;

        if (!requestId) {
          throw new Error("Failed to create verification request");
        }

        setDocumentVerificationRequestId(requestId);
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

          setDocuments((d) => ({ ...d, [key]: true }));
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
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      setSaving(true);
      try {
        await updateInvestorProfile({
          fullName: data.fullName,
          phone: data.phone,
          fundingCapacity: Number(data.fundingCapacity) || 0,
          riskPreference: data.riskPreference,
          investmentGoals: data.investmentGoals,
        });
        onNavigate("lender-dashboard");
      } catch (err) {
        console.error("Failed to update profile", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const saveAndContinueLater = () => {
    onNavigate("landing");
  };

  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      <header className="border-b border-stone-200 bg-white px-6 py-3 flex items-center justify-between">
        <Logo size="sm" onClick={() => onNavigate("landing")} />
        <Button variant="ghost" size="sm" onClick={saveAndContinueLater} disabled={saving}>
          Save & continue later
        </Button>
      </header>
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <div className="mb-10">
          <p className="text-xs text-stone-500 mb-4 text-center">
            Step {step + 1} of {steps.length} — setup your lender profile
          </p>
          <Stepper steps={steps} currentStep={step} />
        </div>
        <div className="bg-white border-[1.5px] border-navy rounded-[8px] shadow-nb p-6 md:p-8">
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">Personal information</h2>
              <p className="text-sm text-stone-500 mb-6">
                Basic details for your investor profile.
              </p>
              <div className="grid grid-cols-1 gap-5">
                <TextInput
                  label="Full name"
                  placeholder="e.g., Tanvir Hossain"
                  required
                  value={data.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                />
                <TextInput
                  label="Phone number"
                  placeholder="01xxxxxxxxx"
                  required
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
                <div className="border-t border-stone-200 pt-5 mt-2">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-navy">
                      Organization Documents
                    </p>
                    <p className="text-xs text-stone-500">
                      Upload documents that establish your organization&apos;s identity,
                      registration, and legitimacy. All documents are optional for now.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FileUpload
                      label="TIN Certificate"
                      hint="Optional"
                      onChange={(files) =>
                        handleDocumentUpload(
                          "tin_certificate",
                          files,
                          "tinCertificateUploaded",
                        )
                      }
                    />

                    <FileUpload
                      label="Trade License"
                      hint="Optional"
                      onChange={(files) =>
                        handleDocumentUpload(
                          "trade_license",
                          files,
                          "tradeLicenseUploaded",
                        )
                      }
                    />

                    <FileUpload
                      label="Certificate of Incorporation / Registration"
                      hint="Optional"
                      onChange={(files) =>
                        handleDocumentUpload(
                          "incorporation_certificate",
                          files,
                          "incorporationCertificateUploaded",
                        )
                      }
                    />

                    <FileUpload
                      label="Regulatory / Operating License"
                      hint="Optional"
                      onChange={(files) =>
                        handleDocumentUpload(
                          "regulatory_license",
                          files,
                          "regulatoryLicenseUploaded",
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">Funding capacity</h2>
              <p className="text-sm text-stone-500 mb-6">
                How much capital do you plan to deploy over the next 12 months?
              </p>
              <div className="grid grid-cols-1 gap-5">
                <TextInput
                  label="Estimated funding capacity"
                  type="number"
                  placeholder="500000"
                  value={data.fundingCapacity}
                  onChange={(e) => update("fundingCapacity", e.target.value)}
                  prefix="৳"
                  hint="In BDT"
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">Risk & preferences</h2>
              <p className="text-sm text-stone-500 mb-6">
                Help us tailor investment opportunities to your goals.
              </p>
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-sm font-medium text-navy mb-3">Risk preference</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Radio
                      label="Conservative"
                      name="risk-preference"
                      value="conservative"
                      checked={data.riskPreference === "conservative"}
                      onChange={(v) => update("riskPreference", v)}
                    />
                    <Radio
                      label="Moderate"
                      name="risk-preference"
                      value="moderate"
                      checked={data.riskPreference === "moderate"}
                      onChange={(v) => update("riskPreference", v)}
                    />
                    <Radio
                      label="Aggressive"
                      name="risk-preference"
                      value="aggressive"
                      checked={data.riskPreference === "aggressive"}
                      onChange={(v) => update("riskPreference", v)}
                    />
                  </div>
                  <p className="text-xs text-stone-500 mt-2">
                    {data.riskPreference === "conservative" && "Prioritize low-risk loans with stable, lower returns."}
                    {data.riskPreference === "moderate" && "Balance between risk and returns."}
                    {data.riskPreference === "aggressive" && "Higher returns with higher risk tolerance."}
                  </p>
                </div>
                
                <Select
                  label="Primary investment goal"
                  value={data.investmentGoals}
                  onChange={(e) => update("investmentGoals", e.target.value)}
                  options={[
                    { value: "growth", label: "Capital Growth" },
                    { value: "income", label: "Regular Income" },
                    { value: "impact", label: "Social Impact" },
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" size="md" onClick={back} disabled={step === 0 || saving}>
            ← Back
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 tabular-nums">
              {step + 1}/{steps.length}
            </span>
            <Button variant="primary" size="md" onClick={next} loading={saving}>
              {step === steps.length - 1 ? "Complete Setup →" : "Continue →"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
