import { pool } from "../lib/db.js";
import { config } from "../config/index.js";
import type { AssessmentResult } from "@shohojrin/shared";

export interface VerificationProvider {
  assess(documentType: string, documentId: string): Promise<AssessmentResult>;
}

export class DemoVerificationProvider implements VerificationProvider {
  async assess(documentType: string, documentId: string): Promise<AssessmentResult> {
    let confidence = 0.8;

    switch (documentType) {
      case "nid_front":
      case "nid_back":
        confidence = 0.95;
        break;
      case "income_proof":
        confidence = 0.85;
        break;
      case "address_proof":
        confidence = 0.9;
        break;
      case "student_id":
        confidence = 0.88;
        break;
    }

    return {
      documentType,
      status: "demo_verified",
      confidence: confidence,
      validity: true,
      reason: "Demo mode verified",
      trustSignal: "positive",
      assessmentTimestamp: new Date().toISOString(),
      assessmentSource: "demo_verification",
    };
  }
}

export class DocumentVerificationService {
  constructor(private provider: VerificationProvider) {}

  async assessDocument(documentId: string, documentType: string) {
    const result = await this.provider.assess(documentType, documentId);

    const status = result.validity ? (config.demoMode ? "demo_verified" : "verified") : "rejected";

    await pool.query(
      `UPDATE verification_documents 
       SET assessment_result = $1, document_status = $2 
       WHERE document_id = $3`,
      [result, status, documentId],
    );

    return result;
  }
}

export const demoProvider = new DemoVerificationProvider();
export const documentVerificationService = new DocumentVerificationService(demoProvider);
