import type { TranslationKey } from "../translations/en";

const aliases: Record<string, TranslationKey> = {
  "gender.male": "profile.genderMale",
  "gender.female": "profile.genderFemale",
  "gender.other": "profile.genderOther",
  "relationship.parent": "profile.relParent",
  "relationship.father": "profile.relParent",
  "relationship.mother": "profile.relParent",
  "relationship.sibling": "profile.relSibling",
  "relationship.spouse": "profile.relSpouse",
  "relationship.relative": "profile.relRelative",
  "relationship.employer": "profile.relEmployer",
  "relationship.teacher": "profile.relTeacher",
  "relationship.friend": "profile.relFriend",
  "relationship.other": "profile.relOther",
  "employment.full_time": "employment.employed-full",
  "employment.part_time": "employment.employed-part",
  "appStatus.under_review": "appStatus.under-review",
  "appStatus.info_required": "appStatus.info-required",
  "activeLoan.status.paid": "activeLoan.statusPaid",
  "activeLoan.status.due": "activeLoan.statusDue",
  "activeLoan.status.upcoming": "activeLoan.statusUpcoming",
  "activeLoan.status.overdue": "activeLoan.statusOverdue",
  "activeLoan.status.partially_paid": "activeLoan.statusPartially_paid",
  "incomeSource.salary": "profile.incomeSourceSalary",
  "incomeSource.business": "profile.incomeSourceBusiness",
  "incomeSource.freelance": "profile.incomeSourceFreelance",
  "incomeSource.remittance": "profile.incomeSourceRemittance",
  "incomeSource.parental": "profile.incomeSourceParental",
  "incomeSource.other": "profile.incomeSourceOther",
  "role.borrower": "role.borrower",
  "role.lender": "role.lender",
  "role.admin": "role.admin",
};

/** Maps backend enum values to presentation keys. Unknown values deliberately
 * resolve to a missing translation, which the translation layer renders as a
 * safe em dash instead of exposing an internal value. */
export function enumKey(prefix: string, value: string): TranslationKey {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  return aliases[`${prefix}.${normalized}`] ?? (`${prefix}.${normalized}` as TranslationKey);
}
