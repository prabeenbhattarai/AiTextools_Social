"use client";

import { useActionState, useState } from "react";
import { savePaymentAction, type PaymentState } from "@/app/actions/payment";
import { NEPALI_BANKS } from "@/lib/config";
import type { PaymentDetails, PaymentMethod } from "@/lib/types";

const initial: PaymentState = {};
const MAX_QR_BYTES = 500 * 1024;

export default function PaymentForm({
  payment,
}: {
  payment: PaymentDetails | null;
}) {
  const [state, action, pending] = useActionState(savePaymentAction, initial);
  const [method, setMethod] = useState<PaymentMethod>(payment?.method ?? "esewa");
  const [qr, setQr] = useState<string | null>(payment?.esewa?.qr ?? null);
  const [qrError, setQrError] = useState<string | null>(null);

  function onQr(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setQrError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setQrError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_QR_BYTES) {
      setQrError("Image is too large — use one under 500 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setQr(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Payment details</h2>
      <p className="mt-1 mb-4 text-sm text-slate-500">
        Choose how you want to receive your payouts.
      </p>

      <form action={action} className="space-y-5">
        <div className="flex gap-3">
          {(["esewa", "bank"] as PaymentMethod[]).map((m) => (
            <label
              key={m}
              className={`flex-1 cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium ${
                method === m
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 text-slate-700 hover:border-slate-400"
              }`}
            >
              <input
                type="radio"
                name="method"
                value={m}
                checked={method === m}
                onChange={() => setMethod(m)}
                className="sr-only"
              />
              {m === "esewa" ? "eSewa" : "Bank transfer"}
            </label>
          ))}
        </div>

        {method === "esewa" ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="esewa_fullName" label="Full name" defaultValue={payment?.esewa?.fullName} placeholder="Name on eSewa" />
              <Field name="esewa_number" label="eSewa number" defaultValue={payment?.esewa?.number} placeholder="98XXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                eSewa QR <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input type="file" accept="image/*" onChange={onQr} className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm" />
              {qrError && <p className="mt-1 text-xs text-red-600">{qrError}</p>}
              {qr && (
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr} alt="eSewa QR" className="h-24 w-24 rounded-md border border-slate-200 object-contain" />
                  <button type="button" onClick={() => setQr(null)} className="text-sm text-red-600 hover:text-red-700">
                    Remove
                  </button>
                </div>
              )}
              <input type="hidden" name="esewa_qr" value={qr ?? ""} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Bank</label>
              <select name="bank_name" defaultValue={payment?.bank?.bankName ?? ""} className={input}>
                <option value="" disabled>
                  Select your bank…
                </option>
                {NEPALI_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <Field name="bank_accountName" label="Account holder name" defaultValue={payment?.bank?.accountName} placeholder="Full name on account" />
            <Field name="bank_accountNumber" label="Account number" defaultValue={payment?.bank?.accountNumber} placeholder="Account number" />
            <Field name="bank_branch" label="Branch" defaultValue={payment?.bank?.branch} placeholder="Branch" />
            <Field name="bank_contact" label="Contact number" defaultValue={payment?.bank?.contact} placeholder="98XXXXXXXX" />
          </div>
        )}

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.ok && <p className="text-sm text-emerald-600">Payment details saved ✓</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save payment details"}
        </button>
      </form>
    </section>
  );
}

const input =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900";

function Field({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input name={name} defaultValue={defaultValue ?? ""} placeholder={placeholder} className={input} />
    </div>
  );
}
