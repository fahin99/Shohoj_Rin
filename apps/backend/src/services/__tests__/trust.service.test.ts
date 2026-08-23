import { describe, it, expect } from 'vitest';
import {
  calculateRepaymentHistory,
  calculateFinancialCapacity,
  calculateFinancialBehavior,
  calculateIdentityVerification,
  calculateCreditBehavior,
  calculateConfidenceScore,
  getTrustBand,
  calculateTrustScore,
  TrustInputs,
} from '../trust.service.js';
describe('Trust Score Engine - Pure Scoring Functions', () => {
  describe('Repayment History (35% Weight)', () => {
    it('returns neutral score (50) for zero repayment history', () => {
      const inputs: TrustInputs['repayment'] = {
        totalDuePayments: 0,
        onTimePayments: 0,
        latePayments: 0,
        missedPayments: 0,
        defaults: 0,
      };
      expect(calculateRepaymentHistory(inputs)).toBe(50);
    });
    it('returns 100 for perfect on-time repayment history', () => {
      const inputs: TrustInputs['repayment'] = {
        totalDuePayments: 10,
        onTimePayments: 10,
        latePayments: 0,
        missedPayments: 0,
        defaults: 0,
      };
      expect(calculateRepaymentHistory(inputs)).toBe(100);
    });
    it('penalizes late payments appropriately', () => {
      const inputs: TrustInputs['repayment'] = {
        totalDuePayments: 10,
        onTimePayments: 7,
        latePayments: 3,
        missedPayments: 0,
        defaults: 0,
      };
      expect(calculateRepaymentHistory(inputs)).toBe(61);
    });
    it('penalizes missed payments heavily', () => {
      const inputs: TrustInputs['repayment'] = {
        totalDuePayments: 10,
        onTimePayments: 6,
        latePayments: 1,
        missedPayments: 3,
        defaults: 0,
      };
      expect(calculateRepaymentHistory(inputs)).toBe(42);
    });
    it('applies large penalty for defaults and clamps to 0', () => {
      const inputs: TrustInputs['repayment'] = {
        totalDuePayments: 5,
        onTimePayments: 1,
        latePayments: 0,
        missedPayments: 3,
        defaults: 2,
      };
      expect(calculateRepaymentHistory(inputs)).toBe(0);
    });
  });
  describe('Financial Capacity (25% Weight)', () => {
    it('returns 50 for missing/insufficient income data', () => {
      expect(calculateFinancialCapacity({ monthlyIncome: null, monthlyDebtObligations: 0, activeLoanCount: 0 })).toBe(50);
      expect(calculateFinancialCapacity({ monthlyIncome: 0, monthlyDebtObligations: 5000, activeLoanCount: 1 })).toBe(50);
    });
    it('returns 100 for DTI <= 20%', () => {
      const inputs: TrustInputs['financial'] = {
        monthlyIncome: 50000,
        monthlyDebtObligations: 8000, 
        activeLoanCount: 1,
      };
      expect(calculateFinancialCapacity(inputs)).toBe(100);
    });
    it('returns correct scores across DTI bands', () => {
      expect(calculateFinancialCapacity({ monthlyIncome: 10000, monthlyDebtObligations: 2800, activeLoanCount: 1 })).toBe(85);
      expect(calculateFinancialCapacity({ monthlyIncome: 10000, monthlyDebtObligations: 3800, activeLoanCount: 1 })).toBe(70);
      expect(calculateFinancialCapacity({ monthlyIncome: 10000, monthlyDebtObligations: 4800, activeLoanCount: 1 })).toBe(50);
      expect(calculateFinancialCapacity({ monthlyIncome: 10000, monthlyDebtObligations: 6000, activeLoanCount: 1 })).toBe(20);
    });
    it('applies penalty for multiple active loans', () => {
      const inputs: TrustInputs['financial'] = {
        monthlyIncome: 100000,
        monthlyDebtObligations: 15000,
        activeLoanCount: 3,
      };
      expect(calculateFinancialCapacity(inputs)).toBe(90);
    });
  });
  describe('Financial Behavior (15% Weight)', () => {
    it('returns neutral 50 for unavailable transaction data', () => {
      expect(calculateFinancialBehavior({ hasTransactionData: false })).toBe(50);
    });
  });
  describe('Identity Verification (15% Weight)', () => {
    it('returns 0 when no verifications are completed', () => {
      const inputs: TrustInputs['verification'] = {
        identityVerified: false,
        phoneVerified: false,
        emailVerified: false,
        addressVerified: false,
        incomeVerified: false,
        studentVerified: false,
      };
      expect(calculateIdentityVerification(inputs)).toBe(0);
    });
    it('returns 100 for fully verified profile', () => {
      const inputs: TrustInputs['verification'] = {
        identityVerified: true,  
        phoneVerified: true,     
        emailVerified: true,     
        addressVerified: true,   
        incomeVerified: true,    
        studentVerified: true,   
      };
      expect(calculateIdentityVerification(inputs)).toBe(100);
    });
    it('sums partial verification points correctly', () => {
      const inputs: TrustInputs['verification'] = {
        identityVerified: true,  
        phoneVerified: true,     
        emailVerified: false,
        addressVerified: false,
        incomeVerified: false,
        studentVerified: true,   
      };
      expect(calculateIdentityVerification(inputs)).toBe(60);
    });
  });
  describe('Credit Behavior (10% Weight)', () => {
    it('returns 100 for normal credit behavior', () => {
      const inputs: TrustInputs['credit'] = {
        activeLoanCount: 1,
        recentApplications: 1,
      };
      expect(calculateCreditBehavior(inputs)).toBe(100);
    });
    it('applies penalties for excessive loans and recent applications', () => {
      const inputs: TrustInputs['credit'] = {
        activeLoanCount: 5,     
        recentApplications: 4,  
      };
      expect(calculateCreditBehavior(inputs)).toBe(50);
    });
  });
  describe('Confidence Score', () => {
    it('gives low confidence for new user without history', () => {
      const inputs: TrustInputs['tenure'] = {
        accountAgeDays: 5,
        totalRepaymentCount: 0,
        verificationCount: 1,
      };
      const confidence = calculateConfidenceScore(inputs);
      expect(confidence).toBeLessThan(20);
    });
    it('gives high confidence for established user with extensive evidence', () => {
      const inputs: TrustInputs['tenure'] = {
        accountAgeDays: 365,     
        totalRepaymentCount: 12, 
        verificationCount: 5,    
      };
      expect(calculateConfidenceScore(inputs)).toBe(100);
    });
  });
  describe('Risk Band Boundaries', () => {
    it('correctly categorizes scores around all band boundaries', () => {
      expect(getTrustBand(0)).toBe('very_high_risk');
      expect(getTrustBand(34.99)).toBe('very_high_risk');
      expect(getTrustBand(35.0)).toBe('high_risk');
      expect(getTrustBand(49.99)).toBe('high_risk');
      expect(getTrustBand(50.0)).toBe('moderate_risk');
      expect(getTrustBand(64.99)).toBe('moderate_risk');
      expect(getTrustBand(65.0)).toBe('low_risk');
      expect(getTrustBand(79.99)).toBe('low_risk');
      expect(getTrustBand(80.0)).toBe('very_low_risk');
      expect(getTrustBand(100)).toBe('very_low_risk');
    });
  });
  describe('Composite Trust Score Calculation', () => {
    it('calculates weighted composite score accurately', () => {
      const fullInputs: TrustInputs = {
        repayment: {
          totalDuePayments: 10,
          onTimePayments: 10,
          latePayments: 0,
          missedPayments: 0,
          defaults: 0,
        }, 
        financial: {
          monthlyIncome: 50000,
          monthlyDebtObligations: 10000, 
          activeLoanCount: 1,
        }, 
        behavior: {
          hasTransactionData: false,
        }, 
        verification: {
          identityVerified: true,
          phoneVerified: true,
          emailVerified: true,
          addressVerified: true,
          incomeVerified: true,
          studentVerified: true,
        }, 
        credit: {
          activeLoanCount: 1,
          recentApplications: 1,
        }, 
        tenure: {
          accountAgeDays: 180,
          totalRepaymentCount: 10,
          verificationCount: 4,
        },
      };
      const result = calculateTrustScore(fullInputs);
      expect(result.score).toBe(92.5);
      expect(result.band).toBe('very_low_risk');
      expect(result.components).toHaveLength(5);
      expect(result.components.find(c => c.name === 'repayment_history')?.weight).toBe(0.35);
      expect(result.components.find(c => c.name === 'financial_capacity')?.weight).toBe(0.25);
    });
  });
});
