"use client";

import { useState, useTransition } from "react";
import { getMemberPaymentAction } from "@/app/actions/payment";
import type { PaymentDetails } from "@/lib/types";

export default function MemberPaymentView({
  uid,
  name,
}: {
  uid: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function openModal() {
    setOpen(true);
    if (loaded) return;
    setError(null);
    start(async () => {
      const res = await getMemberPaymentAction(uid);
      if (!res.ok) return setError(res.error ?? "Failed to load");
      setPayment(res.payment ?? null);
      setLoaded(true);
    });
  }

  return (
    <>
      <button
        onClick={openModal}
        className="text-slate-600 hover:text-slate-900"
      >
        Payment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Payment details
                </h3>
                <p className="text-sm text-slate-500">{name}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              {pending && <p className="text-sm text-slate-500">Loading…</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
              {loaded && !payment && (
                <p className="text-sm text-slate-500">
                  This member hasn&apos;t added payment details yet.
                </p>
              )}
              {loaded && payment && <Details payment={payment} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Details({ payment }: { payment: PaymentDetails }) {
  if (payment.method === "esewa") {
    return (
      <div>
        <span className="inline-block rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
          eSewa
        </span>
        <dl className="mt-3 divide-y divide-slate-100">
          <Row label="Full name" value={payment.esewa?.fullName} />
          <Row label="eSewa number" value={payment.esewa?.number} />
        </dl>
        {payment.esewa?.qr && (
          <div className="mt-4">
            <div className="mb-1 text-xs font-medium text-slate-500">QR</div>
            <a href={payment.esewa.qr} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payment.esewa.qr}
                alt="eSewa QR"
                className="h-56 w-56 rounded-lg border border-slate-200 object-contain"
              />
            </a>
            <p className="mt-1 text-xs text-slate-400">Click the QR to open full size.</p>
          </div>
        )}
      </div>
    );
  }
  return (
    <div>
      <span className="inline-block rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
        Bank transfer
      </span>
      <dl className="mt-3 divide-y divide-slate-100">
        <Row label="Bank" value={payment.bank?.bankName} />
        <Row label="Account name" value={payment.bank?.accountName} />
        <Row label="Account number" value={payment.bank?.accountNumber} />
        <Row label="Branch" value={payment.bank?.branch} />
        <Row label="Contact" value={payment.bank?.contact} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-3 py-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value || "—"}</dd>
    </div>
  );
}
