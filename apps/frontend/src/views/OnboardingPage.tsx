"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { TextInput, Select, Radio, Checkbox, FileUpload } from "../components/Input";
import { Stepper } from "../components/Progress";
import InstitutionCombobox from "../components/InstitutionCombobox";
import { profileApi, documentsApi, verificationApi, guarantorApi } from "../lib/api/index";
import type { PageName } from "../types";
import { gu } from "date-fns/locale";

interface OnboardingPageProps {
  onNavigate: (page: PageName) => void;
}

export default function OnboardingPage({ onNavigate }: OnboardingPageProps) {
  const { t } = useTranslation();

  const steps = [
    { label: t("profile.personalIdentity"), sublabel: t("profile.identity") },
    { label: t("profile.financialProfile"), sublabel: t("profile.profile") },
    { label: t("application.stepEmployment"), sublabel: t("profile.status") },
    { label: t("profile.guarantorInfo"), sublabel: t("profile.information") },
    { label: t("onboarding.goals"), sublabel: "" },
    { label: t("onboarding.preferences"), sublabel: "" },
  ];

  const goalOptions = [
    t("onboarding.goalEducation"),
    t("onboarding.goalMedical"),
    t("onboarding.goalBusiness"),
    t("onboarding.goalHome"),
    t("onboarding.goalPersonal"),
    t("onboarding.goalDebt"),
  ];

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
    district: "",
    nidFrontUploaded: false,
    nidBackUploaded: false,
    utilityBillUploaded: false,
    incomeProofUploaded: false,
    studentIdUploaded: false,
    businessEvidenceUploaded: false,
    monthlyIncome: "",
    savingsAmount: "",
    existingLoans: "no",
    employmentType: "",
    employerName: "",
    occupation: "",
    incomeSource: "",
    institutionId: null as string | null,
    institutionName: "",
    studentId: "",
    goals: [] as string[],
    notifEmail: true,
    notifSms: true,
    language: "en",
    guarantorFullName: "",
    guarantorRelationship: "",
    guarantorPhone: "",
    guarantorEmail: "",
    guarantorGender: "",
    guarantorNidNumber: "",
    guarantorAddressLine: "",
    guarantorCity: "",
    guarantorDistrict: "",
    guarantorNidFrontUploaded: false,
    guarantorNidBackUploaded: false,
    guarantorIncomeProofUploaded: false,
  });
  useEffect(() => {
    async function init() {
      try {
        await profileApi.getProfileCompletion();
      } catch (e) {
        console.error("Failed to load profile completion", e);
      }
      try {
        const g = await guarantorApi.getGuarantor();
        if (g) {
          setData((prev) => ({
            ...prev,
            guarantorFullName: g.fullName || prev.guarantorFullName,
            guarantorRelationship: g.relationship || prev.guarantorRelationship,
            guarantorPhone: g.phone || prev.guarantorPhone,
            guarantorEmail: g.email || prev.guarantorEmail,
            guarantorNidNumber: g.nidNumber || prev.guarantorNidNumber,
            guarantorAddressLine: g.address || prev.guarantorAddressLine,
          }));
        }
      } catch (e) {
        console.error("Failed to load existing guarantor", e);
      }
    }
    init();
  }, []);
  const update = (k: string, v: string | boolean | string[] | null) =>
    setData((d) => ({ ...d, [k]: v }));
  const buildProfilePayload = (d: typeof data) => {
    const payload: Record<string, unknown> = {};
    if (d.fullName.trim()) payload.fullName = d.fullName.trim();
    if (d.dateOfBirth) payload.dateOfBirth = d.dateOfBirth;
    if (d.gender) payload.gender = d.gender;
    if (d.nidNumber) payload.nidNumber = d.nidNumber;
    if (d.addressLine) payload.addressLine = d.addressLine;
    if (d.city) payload.city = d.city;
    if (d.district) payload.district = d.district;
    if (d.monthlyIncome !== "") payload.monthlyIncome = Number(d.monthlyIncome);
    if (d.savingsAmount !== "") payload.monthlySavings = Number(d.savingsAmount);
    if (d.employmentType) payload.employmentType = d.employmentType;
    if (d.employerName) payload.employerName = d.employerName;
    if (d.occupation) payload.occupation = d.occupation;
    if (d.incomeSource) payload.incomeSource = d.incomeSource;
    if (d.institutionId !== null) payload.institutionId = d.institutionId;
    if (d.studentId) payload.studentId = d.studentId;
    return payload;
  };
  const buildGuarantorPayload = (d: typeof data) => {
    const addressParts = [d.guarantorAddressLine, d.guarantorCity, d.guarantorDistrict]
      .map((p) => (p ? p.trim() : ""))
      .filter(Boolean);
    const uniqueAddressParts = Array.from(new Set(addressParts));
    return {
      fullName: d.guarantorFullName.trim(),
      relationship: d.guarantorRelationship.trim(),
      phone: d.guarantorPhone.trim() || undefined,
      email: d.guarantorEmail.trim() || undefined,
      nidNumber: d.guarantorNidNumber.trim() || undefined,
      address: uniqueAddressParts.length ? uniqueAddressParts.join(", ") : undefined,
    };
  };
  const toggleGoal = (g: string) => {
    setData((d) => ({
      ...d,
      goals: d.goals.includes(g) ? d.goals.filter((x) => x !== g) : [...d.goals, g],
    }));
  };
  const handleFileUpload = async (type: string, files: FileList | null, key: string) => {
    if (!files || files.length === 0) {
      update(key, false);
      return;
    }

    const file = files[0];

    try {
      let requestId = doc_verif_req_id;

      if (!requestId) {
        const response = await verificationApi.createVerificationRequest("document");
        requestId = response.request_id ?? response.id ?? null;

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
    const profilePayload = buildProfilePayload(data);
    if (Object.keys(profilePayload).length > 0) {
      try {
        await profileApi.updateProfile(profilePayload);
      } catch (e) {
        console.error("Failed to update profile", e);
      }
    }
    if (step === 3 && data.guarantorFullName.trim() && data.guarantorRelationship.trim()) {
      try {
        await guarantorApi.updateGuarantor(buildGuarantorPayload(data));
      } catch (e) {
        console.error("Failed to save guarantor", e);
      }
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
      const profilePayload = buildProfilePayload(data);
      if (Object.keys(profilePayload).length > 0) {
        await profileApi.updateProfile(profilePayload);
      }
      if (step === 3 && data.guarantorFullName.trim() && data.guarantorRelationship.trim()) {
        await guarantorApi.updateGuarantor(buildGuarantorPayload(data));
      }
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
          {t("onboarding.saveAndContinueLater")}
        </Button>
      </header>
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        {}
        <div className="mb-10">
          <p className="text-xs text-stone-500 mb-4 text-center">
            {t("onboarding.stepOf", { step: step + 1, total: steps.length })} — {t("onboarding.letUsGetToKnowYou")}
          </p>
          <Stepper steps={steps} currentStep={step} />
        </div>
        <div className="bg-white border-[1.5px] border-navy rounded-[8px] shadow-nb p-6 md:p-8">
          {}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">
                {t("profile.personalIdentity")}
              </h2>
              <p className="text-sm text-stone-500 mb-6">
                {t("onboarding.identityHint")}
              </p>
              <div className="grid grid-cols-1 gap-5">
                <TextInput
                  label={t("profile.fullName")}
                  placeholder="Rahim Uddin Ahmed"
                  required
                  value={data.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  hint={t("profile.fullNameHint")}
                />
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    label={t("profile.dateOfBirth")}
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(e) => update("dateOfBirth", e.target.value)}
                    required
                  />
                  <Select
                    label={t("profile.gender")}
                    value={data.gender}
                    onChange={(e) => update("gender", e.target.value)}
                    options={[
                      { value: "male", label: t("profile.genderMale") },
                      { value: "female", label: t("profile.genderFemale") },
                      { value: "other", label: t("profile.genderOther") },
                    ]}
                    placeholder={t("common.select")}
                  />
                </div>
                <TextInput
                  label={t("profile.nidNumber")}
                  placeholder="1234567890"
                  value={data.nidNumber}
                  onChange={(e) => update("nidNumber", e.target.value)}
                  hint={t("profile.nidHint")}
                />
                <TextInput
                  label={t("profile.address")}
                  placeholder="House 12, Road 5, Block C"
                  value={data.addressLine}
                  onChange={(e) => update("addressLine", e.target.value)}
                  required
                />
                <Select
                  label={t("profile.cityDistrict")}
                  value={data.city}
                  onChange={(e) => {
                    update("city", e.target.value);
                    update("district", e.target.value);
                  }}
                  options={[
                    { value: "dhaka", label: t("profile.cityDhaka") },
                    { value: "chittagong", label: t("profile.cityChittagong") },
                    { value: "sylhet", label: t("profile.citySylhet") },
                    { value: "rajshahi", label: t("profile.cityRajshahi") },
                    { value: "khulna", label: t("profile.cityKhulna") },
                    { value: "other", label: t("profile.cityOther") },
                  ]}
                  placeholder={t("profile.selectCity")}
                />

                <div className="border-t border-stone-200 pt-5 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-navy">{t("profile.nidPhoto")}</p>
                      <p className="text-xs text-stone-500">
                        {t("profile.nidPhotoHint")}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-light text-teal border border-teal/30">
                      {t("profile.oneTimeKyc")}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FileUpload
                      label={t("profile.nidFrontPhoto")}
                      hint={t("profile.nidFrontHint")}
                      onChange={(files) => handleFileUpload("nid_front", files, "nidFrontUploaded")}
                    />
                    <FileUpload
                      label={t("profile.nidBackPhoto")}
                      hint={t("profile.nidBackHint")}
                      onChange={(files) => handleFileUpload("nid_back", files, "nidBackUploaded")}
                    />
                    <FileUpload
                      label={t("profile.utilityBill")}
                      hint={t("profile.utilityBillHint")}
                      onChange={(files) =>
                        handleFileUpload("utility_bill", files, "utilityBillUploaded")
                      }
                    />
                    <FileUpload
                      label={t("profile.incomeProof")}
                      hint={t("profile.incomeProofHint")}
                      onChange={(files) =>
                        handleFileUpload("income_proof", files, "incomeProofUploaded")
                      }
                    />
                  </div>
                  <div className="bg-sky-light/60 border border-sky/30 rounded-[6px] p-3 mt-3 flex items-start gap-2.5">
                    <span className="text-sm text-sky font-bold mt-0.5">ℹ</span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {t("profile.kycSavedSecurely")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">{t("profile.financialProfile")}</h2>
              <p className="text-sm text-stone-500 mb-6">
                {t("profile.financialProfileHint")}
              </p>
              <div className="grid grid-cols-1 gap-5">
                <TextInput
                  label={t("application.monthlyIncome")}
                  type="number"
                  placeholder="25000"
                  value={data.monthlyIncome}
                  onChange={(e) => update("monthlyIncome", e.target.value)}
                  prefix="৳"
                  hint={t("profile.monthlyIncomeHint")}
                />
                <TextInput
                  label={t("profile.monthlySavings")}
                  type="number"
                  placeholder="5000"
                  value={data.savingsAmount}
                  onChange={(e) => update("savingsAmount", e.target.value)}
                  prefix="৳"
                />
                <div>
                  <p className="text-sm font-medium text-navy mb-3">
                    {t("profile.existingLoans")}
                  </p>
                  <div className="flex gap-6">
                    <Radio
                      label={t("common.yes")}
                      name="existing-loans"
                      value="yes"
                      checked={data.existingLoans === "yes"}
                      onChange={(v) => update("existingLoans", v)}
                    />
                    <Radio
                      label={t("common.no")}
                      name="existing-loans"
                      value="no"
                      checked={data.existingLoans === "no"}
                      onChange={(v) => update("existingLoans", v)}
                    />
                  </div>
                </div>
                <div className="bg-sky-light border border-sky/30 rounded-[6px] p-4">
                  <p className="text-xs font-medium text-sky mb-1">ℹ {t("profile.whyWeAskThis")}</p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {t("profile.financialSnapshotHint")}
                  </p>
                </div>
              </div>
            </div>
          )}
          {}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">{t("application.stepEmployment")}</h2>
              <p className="text-sm text-stone-500 mb-6">
                {t("application.employmentHint")}
              </p>
              <div className="grid grid-cols-1 gap-5">
                <Select
                  label={t("application.employmentType")}
                  value={data.employmentType}
                  onChange={(e) => update("employmentType", e.target.value)}
                  options={[
                    { value: "employed-full", label: t(enumKey("employment", "employed-full")) },
                    { value: "employed-part", label: t(enumKey("employment", "employed-part")) },
                    { value: "self-employed", label: t(enumKey("employment", "self-employed")) },
                    { value: "business", label: t(enumKey("employment", "business")) },
                    { value: "student", label: t(enumKey("employment", "student")) },
                    { value: "unemployed", label: t(enumKey("employment", "unemployed")) },
                  ]}
                  placeholder={t("application.selectStatus")}
                  required
                />
                {data.employmentType === "student" && (
                  <>
                    <InstitutionCombobox
                      label={t("profile.institution")}
                      value={data.institutionName}
                      institutionId={data.institutionId}
                      onChange={({ id, name }) => {
                        update("institutionId", id || null);
                        update("institutionName", name);
                      }}
                      required
                      hint={t("profile.institutionHint")}
                    />
                    <TextInput
                      label={t("profile.studentId")}
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
                        label={t("profile.employerName")}
                        placeholder="XYZ Company Ltd."
                        value={data.employerName}
                        onChange={(e) => update("employerName", e.target.value)}
                      />
                      <TextInput
                        label={t("profile.occupation")}
                        placeholder="Software Engineer"
                        value={data.occupation}
                        onChange={(e) => update("occupation", e.target.value)}
                      />
                    </>
                  )}
                <Select
                  label={t("profile.incomeSource")}
                  value={data.incomeSource}
                  onChange={(e) => update("incomeSource", e.target.value)}
                  options={[
                    { value: "salary", label: t("profile.incomeSourceSalary") },
                    { value: "business", label: t("profile.incomeSourceBusiness") },
                    { value: "freelance", label: t("profile.incomeSourceFreelance") },
                    { value: "remittance", label: t("profile.incomeSourceRemittance") },
                    { value: "parental", label: t("profile.incomeSourceParental") },
                    { value: "other", label: t("profile.incomeSourceOther") },
                  ]}
                  placeholder={t("profile.selectIncomeSource")}
                />
                {data.employmentType === "student" && (
                  <FileUpload
                    label={t("profile.studentIdEvidence")}
                    hint={t("profile.studentIdEvidenceHint")}
                    onChange={(files) => handleFileUpload("student_id", files, "studentIdUploaded")}
                  />
                )}
                {data.employmentType === "business" && (
                  <FileUpload
                    label={t("profile.businessEvidence")}
                    hint={t("profile.businessEvidenceHint")}
                    onChange={(files) =>
                      handleFileUpload("business_evidence", files, "businessEvidenceUploaded")
                    }
                  />
                )}
              </div>
            </div>
          )}
          {}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">
                {t("profile.guarantorInfo")}
              </h2>
              <p className="text-sm text-stone-500 mb-6">
                {t("profile.guarantorHint")}
              </p>
              <div className="grid grid-cols-1 gap-5">
                <TextInput
                  label={t("profile.fullName")}
                  placeholder="Rahim Uddin Ahmed"
                  required
                  value={data.guarantorFullName}
                  onChange={(e) => update("guarantorFullName", e.target.value)}
                  hint={t("profile.guarantorFullNameHint")}
                />
                <Select
                  label={t("profile.relationship")}
                  required
                  value={data.guarantorRelationship}
                  onChange={(e) => update("guarantorRelationship", e.target.value)}
                  options={[
                    { value: "parent", label: t("profile.relParent") },
                    { value: "sibling", label: t("profile.relSibling") },
                    { value: "spouse", label: t("profile.relSpouse") },
                    { value: "relative", label: t("profile.relRelative") },
                    { value: "employer", label: t("profile.relEmployer") },
                    { value: "teacher", label: t("profile.relTeacher") },
                    { value: "friend", label: t("profile.relFriend") },
                    { value: "other", label: t("profile.relOther") },
                  ]}
                  placeholder={t("profile.selectRelationship")}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput
                    label={t("profile.guarantorPhone")}
                    placeholder="01712345678"
                    value={data.guarantorPhone}
                    onChange={(e) => update("guarantorPhone", e.target.value)}
                  />
                  <TextInput
                    label={t("profile.guarantorEmail")}
                    type="email"
                    placeholder="guarantor@example.com"
                    value={data.guarantorEmail}
                    onChange={(e) => update("guarantorEmail", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label={t("profile.gender")}
                    value={data.guarantorGender}
                    onChange={(e) => update("guarantorGender", e.target.value)}
                    options={[
                      { value: "male", label: t("profile.genderMale") },
                      { value: "female", label: t("profile.genderFemale") },
                      { value: "other", label: t("profile.genderOther") },
                    ]}
                    placeholder={t("common.select")}
                  />
                </div>
                <TextInput
                  label={t("profile.nidNumber")}
                  placeholder="1234567890"
                  value={data.guarantorNidNumber}
                  onChange={(e) => update("guarantorNidNumber", e.target.value)}
                  hint={t("profile.nidHint")}
                />
                <TextInput
                  label={t("profile.address")}
                  placeholder="House 12, Road 5, Block C"
                  value={data.guarantorAddressLine}
                  onChange={(e) => update("guarantorAddressLine", e.target.value)}
                  required
                />
                <Select
                  label={t("profile.cityDistrict")}
                  value={data.guarantorCity}
                  onChange={(e) => {
                    update("guarantorCity", e.target.value);
                    update("guarantorDistrict", e.target.value);
                  }}
                  options={[
                    { value: "dhaka", label: t("profile.cityDhaka") },
                    { value: "chittagong", label: t("profile.cityChittagong") },
                    { value: "sylhet", label: t("profile.citySylhet") },
                    { value: "rajshahi", label: t("profile.cityRajshahi") },
                    { value: "khulna", label: t("profile.cityKhulna") },
                    { value: "other", label: t("profile.cityOther") },
                  ]}
                  placeholder={t("profile.selectCity")}
                />

                <div className="border-t border-stone-200 pt-5 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-navy">{t("profile.nidPhoto")}</p>
                      <p className="text-xs text-stone-500">
                        {t("profile.guarantorNidPhotoHint")}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-light text-teal border border-teal/30">
                      {t("profile.oneTimeKyc")}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FileUpload
                      label={t("profile.nidFrontPhoto")}
                      hint={t("profile.nidFrontHint")}
                      onChange={(files) => handleFileUpload("guarantor_nid_front", files, "guarantorNidFrontUploaded")}
                    />
                    <FileUpload
                      label={t("profile.nidBackPhoto")}
                      hint={t("profile.nidBackHint")}
                      onChange={(files) => handleFileUpload("guarantor_nid_back", files, "guarantorNidBackUploaded")}
                    />
                    <FileUpload
                      label={t("profile.incomeProof")}
                      hint={t("profile.guarantorIncomeProofHint")}
                      onChange={(files) =>
                        handleFileUpload("guarantor_income_proof", files, "guarantorIncomeProofUploaded")
                      }
                    />
                  </div>
                  <div className="bg-sky-light/60 border border-sky/30 rounded-[6px] p-3 mt-3 flex items-start gap-2.5">
                    <span className="text-sm text-sky font-bold mt-0.5">ℹ</span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {t("profile.guarantorKycSavedSecurely")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">{t("onboarding.financialGoals")}</h2>
              <p className="text-sm text-stone-500 mb-6">
                {t("onboarding.financialGoalsHint")}
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
                  {t("onboarding.goalsSelected", { count: data.goals.length })}
                </p>
              )}
            </div>
          )}
          {}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-semibold text-navy mb-1">{t("onboarding.preferences")}</h2>
              <p className="text-sm text-stone-500 mb-6">
                {t("onboarding.preferencesHint")}
              </p>
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-sm font-medium text-navy mb-3">{t("onboarding.notificationPreferences")}</p>
                  <div className="flex flex-col gap-3">
                    <Checkbox
                      label={t("onboarding.emailNotifs")}
                      checked={data.notifEmail}
                      onChange={(v) => update("notifEmail", v)}
                    />
                    <Checkbox
                      label={t("onboarding.smsNotifs")}
                      checked={data.notifSms}
                      onChange={(v) => update("notifSms", v)}
                    />
                  </div>
                </div>
                <Select
                  label={t("onboarding.preferredLanguage")}
                  value={data.language}
                  onChange={(e) => update("language", e.target.value)}
                  options={[
                    { value: "en", label: t("onboarding.langEnglish") },
                    { value: "bn", label: t("onboarding.langBangla") },
                  ]}
                />
                <div className="bg-emerald-light border border-emerald/30 rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-emerald mb-1">{t("onboarding.almostReady")}</p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {t("onboarding.almostReadyHint")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        {}
        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" size="md" onClick={back} disabled={step === 0}>
            ← {t("common.back")}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 tabular-nums">
              {step + 1}/{steps.length}
            </span>
            <Button variant="primary" size="md" onClick={next}>
              {step === steps.length - 1 ? t("onboarding.finishSetup") : t("common.continue")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
