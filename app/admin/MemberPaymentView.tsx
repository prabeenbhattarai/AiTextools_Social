"use client";

import { useState, useTransition } from "react";
import { getMemberPaymentAction } from "@/app/actions/payment";
import type { PaymentDetails } from "@/lib/types";

export default function MemberPaymentView({ uid }: { uid: string }) {
  const [loaded, setLoaded] = useState(false);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function load() {
    setError(null);
    start(async () => {
      const res = await getMemberPaymentAction(uid);
      if (!res.ok) return setError(res.error ?? "Failed");
      setPayment(res.payment ?? null);
      setLoaded(true);
    });
  }

  if (!loaded) {
    return (
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <button
          onClick={load}
          disabled={pending}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {pending ? "Loading…" : "Show payment details"}
        </button>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
      {!payment ? (
        <p className="text-slate-500">This member hasn&apos;t added payment details yet.</p>
      ) : payment.method === "esewa" ? (
        <div>
          <div className="mb-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            eSewa
          </div>
          <Row label="Full name" value={payment.esewa?.fullName} />
          <Row label="eSewa number" value={payment.esewa?.number} />
          {payment.esewa?.qr && (
            <div className="mt-2">
              <div className="text-xs text-slate-500">QR</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={payment.esewa.qr} alt="eSewa QR" className="mt-1 h-32 w-32 rounded-md border border-slate-200 object-contain" />
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-2 inline-block rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
            Bank transfer
          </div>
          <Row label="Bank" value={payment.bank?.bankName} />
          <Row label="Account name" value={payment.bank?.accountName} />
          <Row label="Account number" value={payment.bank?.accountNumber} />
          <Row label="Branch" value={payment.bank?.branch} />
          <Row label="Contact" value={payment.bank?.contact} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-2 py-0.5">
      <span className="w-32 shrink-0 text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value || "—"}</span>
    </div>
  );
}
