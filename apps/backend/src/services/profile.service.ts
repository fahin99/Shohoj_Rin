import { pool } from "../lib/db.js";
import type { ProfileCompletionItem } from "@shohojrin/shared";

export async function getProfileWithCompletion(userId: string) {
  const result = await pool.query(
    `SELECT p.*, u.email, u.phone 
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
     JOIN verification_documents vd ON vd.request_id = vr.id
     WHERE vr.user_id = $1`,
    [userId]
  );

  const completionItems = calculateCompletionStatus(profile, verifications.rows);
  return { profile, completionItems };
}

export async function updateProfile(userId: string, data: any) {
  const fields = Object.keys(data);
  if (fields.length === 0) return null;

  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
  const values = [userId, ...fields.map(f => data[f])];

  const result = await pool.query(
    `UPDATE user_profiles 
     SET ${setClause}, updated_at = NOW() 
     WHERE user_id = $1 
     RETURNING *`,
    values
  );
  
  return result.rows[0];
}

export function getRequiredDocuments(occupationType: string | null | undefined): string[] {
  switch (occupationType) {
    case 'student':
      return ['nid_front', 'nid_back', 'student_id', 'address_proof'];
    case 'salaried':
      return ['nid_front', 'nid_back', 'income_proof', 'address_proof'];
    case 'self_employed':
    case 'business':
      return ['nid_front', 'nid_back', 'income_proof', 'address_proof'];
    default:
      return ['nid_front', 'nid_back', 'address_proof'];
  }
}

export function calculateCompletionStatus(profile: any, verifications: any[]): ProfileCompletionItem[] {
  const requiredDocs = getRequiredDocuments(profile.occupation);
  
  const items: ProfileCompletionItem[] = [];
  
  // Basic info check
  const hasBasicInfo = !!(profile.full_name && profile.date_of_birth && profile.city && profile.district);
  items.push({
    key: 'basic_info',
    label: 'Basic Information',
    completed: hasBasicInfo,
    required: true
  });
  
  // Document checks
  for (const docType of requiredDocs) {
    const docVer = verifications.find(v => v.document_type === docType);
    items.push({
      key: docType,
      label: docType.replace('_', ' ').toUpperCase(),
      completed: !!docVer && (docVer.document_status === 'verified' || docVer.document_status === 'demo_verified'),
      required: true
    });
  }
  
  return items;
}
