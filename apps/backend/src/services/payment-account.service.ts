import type { PoolClient } from "pg";
import { pool } from "../lib/db.js";
import type {
  CreatePaymentAccountInput,
  UpdatePaymentAccountInput,
  UserPaymentAccount,
} from "@shohojrin/shared";

export const ACCOUNT_COLUMNS = `
  account_id AS "accountId",
  user_id AS "userId",
  account_type AS "accountType",
  provider,
  account_name AS "accountName",
  account_number AS "accountNumber",
  bank_name AS "bankName",
  branch_name AS "branchName",
  is_default AS "isDefault",
  is_active AS "isActive",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export async function getUserPaymentAccounts(
  userId: string,
  client?: PoolClient,
): Promise<UserPaymentAccount[]> {
  const runner = client ?? pool;
  const result = await runner.query<UserPaymentAccount>(
    `SELECT ${ACCOUNT_COLUMNS}
     FROM user_payment_accounts
     WHERE user_id = $1 AND is_active = TRUE
     ORDER BY is_default DESC, created_at DESC`,
    [userId],
  );
  return result.rows;
}

export async function getPaymentAccountById(
  accountId: string,
  userId: string,
  client?: PoolClient,
): Promise<UserPaymentAccount | null> {
  const runner = client ?? pool;
  const result = await runner.query<UserPaymentAccount>(
    `SELECT ${ACCOUNT_COLUMNS}
     FROM user_payment_accounts
     WHERE account_id = $1 AND user_id = $2 AND is_active = TRUE`,
    [accountId, userId],
  );
  return result.rows[0] ?? null;
}

export async function createPaymentAccount(
  userId: string,
  input: CreatePaymentAccountInput,
): Promise<UserPaymentAccount> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if user has any existing active accounts
    const existing = await client.query(
      `SELECT count(*)::int AS count FROM user_payment_accounts WHERE user_id = $1 AND is_active = TRUE`,
      [userId],
    );
    const isFirstAccount = Number(existing.rows[0]?.count || 0) === 0;
    const shouldBeDefault = isFirstAccount || Boolean(input.isDefault);

    if (shouldBeDefault) {
      await client.query(
        `UPDATE user_payment_accounts SET is_default = FALSE, updated_at = NOW() WHERE user_id = $1 AND is_default = TRUE`,
        [userId],
      );
    }

    const result = await client.query<UserPaymentAccount>(
      `INSERT INTO user_payment_accounts (
        user_id, account_type, provider, account_name, account_number, bank_name, branch_name, is_default, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING ${ACCOUNT_COLUMNS}`,
      [
        userId,
        input.accountType,
        input.provider,
        input.accountName.trim(),
        input.accountNumber.trim(),
        input.bankName?.trim() || null,
        input.branchName?.trim() || null,
        shouldBeDefault,
      ],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updatePaymentAccount(
  accountId: string,
  userId: string,
  input: UpdatePaymentAccountInput,
): Promise<UserPaymentAccount> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check ownership and active status
    const existing = await client.query<UserPaymentAccount>(
      `SELECT ${ACCOUNT_COLUMNS} FROM user_payment_accounts WHERE account_id = $1 AND user_id = $2 AND is_active = TRUE FOR UPDATE`,
      [accountId, userId],
    );

    if (existing.rowCount === 0) {
      await client.query("ROLLBACK");
      const err: any = new Error("Payment account not found");
      err.statusCode = 404;
      throw err;
    }

    if (input.isDefault) {
      await client.query(
        `UPDATE user_payment_accounts SET is_default = FALSE, updated_at = NOW() WHERE user_id = $1 AND account_id <> $2 AND is_default = TRUE`,
        [userId, accountId],
      );
    }

    const current = existing.rows[0];
    const updatedAccountName = input.accountName?.trim() ?? current.accountName;
    const updatedAccountNumber = input.accountNumber?.trim() ?? current.accountNumber;
    const updatedBankName = input.bankName !== undefined ? input.bankName?.trim() || null : current.bankName;
    const updatedBranchName = input.branchName !== undefined ? input.branchName?.trim() || null : current.branchName;
    const updatedIsDefault = input.isDefault !== undefined ? input.isDefault : current.isDefault;

    const result = await client.query<UserPaymentAccount>(
      `UPDATE user_payment_accounts
       SET account_name = $1, account_number = $2, bank_name = $3, branch_name = $4, is_default = $5, updated_at = NOW()
       WHERE account_id = $6 AND user_id = $7
       RETURNING ${ACCOUNT_COLUMNS}`,
      [
        updatedAccountName,
        updatedAccountNumber,
        updatedBankName,
        updatedBranchName,
        updatedIsDefault,
        accountId,
        userId,
      ],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function setDefaultPaymentAccount(
  accountId: string,
  userId: string,
): Promise<UserPaymentAccount> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query<UserPaymentAccount>(
      `SELECT ${ACCOUNT_COLUMNS} FROM user_payment_accounts WHERE account_id = $1 AND user_id = $2 AND is_active = TRUE FOR UPDATE`,
      [accountId, userId],
    );

    if (existing.rowCount === 0) {
      await client.query("ROLLBACK");
      const err: any = new Error("Payment account not found");
      err.statusCode = 404;
      throw err;
    }

    await client.query(
      `UPDATE user_payment_accounts SET is_default = FALSE, updated_at = NOW() WHERE user_id = $1 AND is_default = TRUE`,
      [userId],
    );

    const result = await client.query<UserPaymentAccount>(
      `UPDATE user_payment_accounts SET is_default = TRUE, updated_at = NOW() WHERE account_id = $1 AND user_id = $2 RETURNING ${ACCOUNT_COLUMNS}`,
      [accountId, userId],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deletePaymentAccount(
  accountId: string,
  userId: string,
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query<UserPaymentAccount>(
      `SELECT ${ACCOUNT_COLUMNS} FROM user_payment_accounts WHERE account_id = $1 AND user_id = $2 AND is_active = TRUE FOR UPDATE`,
      [accountId, userId],
    );

    if (existing.rowCount === 0) {
      await client.query("ROLLBACK");
      const err: any = new Error("Payment account not found");
      err.statusCode = 404;
      throw err;
    }

    const wasDefault = existing.rows[0].isDefault;

    // Soft delete preserves all historical foreign keys
    await client.query(
      `UPDATE user_payment_accounts
       SET is_active = FALSE, is_default = FALSE, updated_at = NOW()
       WHERE account_id = $1 AND user_id = $2`,
      [accountId, userId],
    );

    // If it was default, assign the earliest remaining active account as default
    if (wasDefault) {
      const remaining = await client.query<UserPaymentAccount>(
        `SELECT account_id FROM user_payment_accounts WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at ASC LIMIT 1`,
        [userId],
      );
      if (remaining.rowCount && remaining.rowCount > 0) {
        await client.query(
          `UPDATE user_payment_accounts SET is_default = TRUE, updated_at = NOW() WHERE account_id = $1`,
          [remaining.rows[0].accountId],
        );
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
