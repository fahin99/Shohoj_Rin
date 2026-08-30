import { pool } from "../lib/db.js";
import type { ProfileCompletionItem, ProfileUpdateInput } from "@shohojrin/shared";
const docu_verific_flag=false;
export const auto_verify_docs=true;
const profileColumnByField = {
  fullName: "full_name",
  dateOfBirth: "date_of_birth",
  gender: "gender",
  nidNumber: "nid_number",
  addressLine: "address_line",
  city: "city",
  district: "district",
  postalCode: "postal_code",
  occupation: "occupation",
  monthlyFamilyIncome: "monthly_family_income",
  employmentType: "employment_type",
  employerName: "employer_name",
  monthlyIncome: "monthly_income",
  incomeSource: "income_source",
  institutionId: "institution_id",
  studentId: "student_id",
  enrollmentYear: "enrollment_year",
} as const satisfies Record<keyof ProfileUpdateInput, string>;

export async function getProfileWithCompletion(userId: string) {
  const result = await pool.query(
    `SELECT p.*, u.email, u.phone, u.role 
     FROM user_profiles p
     JOIN users u ON u.user_id = p.user_id
     WHERE p.user_id = $1`,
    [userId]
  );
  const profile = result.rows[0];
  if (!profile) return null;

  const verifications = await pool.query(
    `SELECT document_type, document_status
     FROM verification_requests vr
     JOIN verification_documents vd ON vd.request_id = vr.request_id
     WHERE vr.user_id = $1`,
    [userId]
  );

  const completionItems = calculateCompletionStatus(profile, verifications.rows);
  return { profile, completionItems };
}

export async function updateProfile(userId: string, data: ProfileUpdateInput) {
  const fields = (Object.keys(data) as Array<keyof ProfileUpdateInput>).filter(
    (field) => data[field] !== undefined,
  );
  if (fields.length === 0) return null;
  const setClause = fields
    .map((field, index) => `${profileColumnByField[field]} = $${index + 2}`)
    .join(", ");
  const values = [userId, ...fields.map((field) => data[field])];

  const result = await pool.query(
    `UPDATE user_profiles 
     SET ${setClause}, updated_at = NOW() 
     WHERE user_id = $1 
     RETURNING *`,
    values
  );
  
  return result.rows[0];
}

export function getDocumentRequirements(
  role: string,
  occupationType: string | null | undefined,
) {
  if (role === "lender") {
    return [
      { type: "tin_certificate", required: docu_verific_flag },
      { type: "trade_license", required: docu_verific_flag },
      {
        type: "incorporation_certificate",
        required: docu_verific_flag,
      },
      {
        type: "regulatory_license",
        required: docu_verific_flag,
      },
    ];
  }

  switch (occupationType) {
    case "student":
      return [
        { type: "nid_front", required: docu_verific_flag },
        { type: "nid_back", required: docu_verific_flag },
        { type: "student_id", required: docu_verific_flag },
        { type: "utility_bill", required: docu_verific_flag },
      ];

    default:
      return [
        { type: "nid_front", required: docu_verific_flag },
        { type: "nid_back", required: docu_verific_flag },
        { type: "utility_bill", required: docu_verific_flag },
      ];
  }
}

export function calculateCompletionStatus(profile: any, verifications: any[]): ProfileCompletionItem[] {
  const doc_require = getDocumentRequirements(profile.role, profile.occupation);
  
  const items: ProfileCompletionItem[] = [];
  
  // Basic info check
  const hasBasicInfo = !!(profile.full_name && profile.date_of_birth && profile.city && profile.district);
  items.push({
    key: 'basic_info',
    label: 'Basic Information',
    completed: hasBasicInfo,
    required: true
  });
  
  for (const doc of doc_require) {
    const docVer = verifications.find(
      v => v.document_type === doc.type
    );

    const verified =
      !!docVer &&
      (
        docVer.document_status === "verified" ||
        docVer.document_status === "demo_verified"
      );

    items.push({
      key: doc.type,
      label: doc.type.replace("_", " ").toUpperCase(),
      completed: verified,
      required: doc.required,
    });
  }
  
  return items;
}
