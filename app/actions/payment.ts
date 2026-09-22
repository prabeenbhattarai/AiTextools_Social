"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { getMemberCredentials, getUserPayment, setUserPayment } from "@/lib/data";
import { NEPALI_BANKS } from "@/lib/config";
import type { PaymentDetails, PaymentMethod } from "@/lib/types";

export interface PaymentState {
  error?: string;
  ok?: boolean;
}

// ~500KB raw image → allow up to ~700k chars of base64 data URL.
const MAX_QR_CHARS = 700_000;

export async function savePaymentAction(
  _prev: PaymentState,
  formData: FormData,
): Promise<PaymentState> {
  const user = await getSessionUser();
  if (!user || user.role !== "member") return { error: "Forbidden." };

  const method = String(formData.get("method") ?? "") as PaymentMethod;
  if (method !== "esewa" && method !== "bank") {
    return { error: "Choose a payment method." };
  }

  const payment: PaymentDetails = {
    method,
    esewa: null,
    bank: null,
    updatedAt: Date.now(),
  };

  if (method === "esewa") {
    const fullName = String(formData.get("esewa_fullName") ?? "").trim();
    const number = String(formData.get("esewa_number") ?? "").trim();
    const qr = String(formData.get("esewa_qr") ?? "").trim();

    if (!fullName && !qr) {
      return { error: "Enter your eSewa name & number, or upload a QR." };
    }
    if (fullName && !number) return { error: "Enter your eSewa number." };
    if (qr) {
      if (!qr.startsWith("data:image/")) return { error: "QR must be an image." };
      if (qr.length > MAX_QR_CHARS) {
        return { error: "QR image is too large (please use a smaller image)." };
      }
    }
    payment.esewa = { fullName, number, qr: qr || null };
  } else {
    const bankName = String(formData.get("bank_name") ?? "").trim();
    const accountName = String(formData.get("bank_accountName") ?? "").trim();
    const accountNumber = String(formData.get("bank_accountNumber") ?? "").trim();
    const branch = String(formData.get("bank_branch") ?? "").trim();
    const contact = String(formData.get("bank_contact") ?? "").trim();

    if (!NEPALI_BANKS.includes(bankName)) return { error: "Select your bank." };
    if (!accountName) return { error: "Enter the account holder name." };
    if (!accountNumber) return { error: "Enter the account number." };
    payment.bank = { bankName, accountName, accountNumber, branch, contact };
  }

  await setUserPayment(user.uid, payment);
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

// Admin-only: view a member's payment details (to pay them).
export async function getMemberPaymentAction(
  uid: string,
): Promise<{ ok: boolean; error?: string; payment?: PaymentDetails | null; fullName?: string }> {
  const admin = await getSessionUser();
  if (admin?.role !== "superadmin") return { ok: false, error: "Forbidden." };
  const [payment, cred] = await Promise.all([
    getUserPayment(uid),
    getMemberCredentials(uid),
  ]);
  return { ok: true, payment, fullName: cred?.fullName };
}
