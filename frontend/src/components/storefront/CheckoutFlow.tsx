"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/store/cart-store";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { CheckoutStepper } from "@/components/storefront/CheckoutStepper";
import type { Address } from "@prisma/client";

const SHIPPING_FLAT_FEE = 80;
const FREE_SHIPPING_THRESHOLD = 999;
const EXPRESS_SHIPPING_FEE = 250;
const GST_RATE = 0.18;

const addressFormSchema = z.object({
  fullName: z.string().min(2, "Required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  line1: z.string().min(3, "Required"),
  line2: z.string().optional(),
  city: z.string().min(2, "Required"),
  state: z.string().min(2, "Required"),
  pincode: z.string().min(4, "Required"),
});

const contactFormSchema = z.object({
  customerName: z.string().min(2, "Required"),
  customerEmail: z.string().email("Enter a valid email"),
  customerPhone: z.string().min(10, "Enter a valid phone number"),
});

type AddressForm = z.infer<typeof addressFormSchema>;
type ContactForm = z.infer<typeof contactFormSchema>;

export function CheckoutFlow({
  savedAddresses,
  defaultContact,
}: {
  savedAddresses: Address[];
  defaultContact?: { name?: string | null; email?: string | null };
}) {
  const router = useRouter();
  const { lines, coupon, clear } = useCartStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(savedAddresses[0]?.id ?? null);
  const [addingNew, setAddingNew] = useState(savedAddresses.length === 0);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactForm = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { customerName: defaultContact?.name ?? "", customerEmail: defaultContact?.email ?? "" },
  });
  const addressForm = useForm<AddressForm>({ resolver: zodResolver(addressFormSchema) });

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const discount = coupon?.discount ?? 0;
  const shippingFee =
    shippingMethod === "express" ? EXPRESS_SHIPPING_FEE : subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_FEE;
  const tax = (subtotal - discount) * GST_RATE;
  const total = subtotal - discount + shippingFee + tax;

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId);

  const handleContinueToPayment = contactForm.handleSubmit(() => {
    if (!addingNew && !selectedAddress) {
      setError("Select a shipping address to continue.");
      return;
    }
    if (addingNew) {
      addressForm.handleSubmit(
        () => {
          setError(null);
          setStep(2);
        },
        () => setError("Please complete the shipping address.")
      )();
      return;
    }
    setError(null);
    setStep(2);
  });

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const contact = contactForm.getValues();
      const address = addingNew
        ? addressForm.getValues()
        : selectedAddress
          ? {
              fullName: selectedAddress.fullName,
              phone: selectedAddress.phone,
              line1: selectedAddress.line1,
              line2: selectedAddress.line2 ?? undefined,
              city: selectedAddress.city,
              state: selectedAddress.state,
              pincode: selectedAddress.pincode,
            }
          : null;
      if (!address) throw new Error("Shipping address is missing.");

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contact,
          couponCode: coupon?.code,
          shippingMethod,
          address,
          items: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed.");

      if (!data.keyId) {
        setError("Payment gateway is not configured yet. Order was saved as pending — an admin needs to set Razorpay keys.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Zest",
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: { name: contact.customerName, email: contact.customerEmail, contact: contact.customerPhone },
        handler: async (response: unknown) => {
          const r = response as { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId, ...r }),
          });
          if (verifyRes.ok) {
            clear();
            router.push(`/checkout/success?order=${data.orderNumber}`);
          } else {
            router.push(`/checkout/failed?order=${data.orderNumber}`);
          }
        },
        modal: { ondismiss: () => router.push(`/checkout/failed?order=${data.orderNumber}`) },
        theme: { color: "#2b1c14" },
      });
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const orderSummary = useMemo(
    () => ({ subtotal, discount, shippingFee, tax, total }),
    [subtotal, discount, shippingFee, tax, total]
  );

  if (lines.length === 0) {
    return <p className="mx-auto max-w-2xl px-4 py-20 text-center text-cocoa-500">Your cart is empty.</p>;
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <CheckoutStepper current={step} />

        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {step === 1 ? (
              <>
                <section className="space-y-3">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-600">Contact</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Full Name" {...contactForm.register("customerName")} error={contactForm.formState.errors.customerName?.message} />
                    <Input label="Phone" {...contactForm.register("customerPhone")} error={contactForm.formState.errors.customerPhone?.message} />
                  </div>
                  <Input label="Email" type="email" {...contactForm.register("customerEmail")} error={contactForm.formState.errors.customerEmail?.message} />
                </section>

                {savedAddresses.length > 0 && (
                  <section>
                    <h2 className="mb-3 font-serif text-lg font-semibold text-cocoa-900">Saved Addresses</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setAddingNew(false);
                          }}
                          className={`rounded-lg border p-4 text-left text-sm ${
                            !addingNew && selectedAddressId === addr.id ? "border-cocoa-900 bg-cocoa-50" : "border-cocoa-200"
                          }`}
                        >
                          <p className="font-semibold text-cocoa-900">
                            {addr.fullName} {addr.isDefault && <span className="ml-1 text-xs text-cocoa-400">(Default)</span>}
                          </p>
                          <p className="mt-1 text-cocoa-500">{addr.line1}</p>
                          <p className="text-cocoa-500">
                            {addr.city}, {addr.state} {addr.pincode}
                          </p>
                        </button>
                      ))}
                      <button
                        onClick={() => setAddingNew(true)}
                        className={`rounded-lg border border-dashed p-4 text-left text-sm text-cocoa-500 ${addingNew ? "border-cocoa-900 bg-cocoa-50" : "border-cocoa-200"}`}
                      >
                        + Use a new address
                      </button>
                    </div>
                  </section>
                )}

                {addingNew && (
                  <section className="space-y-3">
                    <h2 className="font-serif text-lg font-semibold text-cocoa-900">New Shipping Address</h2>
                    <Input label="Full Name" {...addressForm.register("fullName")} error={addressForm.formState.errors.fullName?.message} />
                    <Input label="Street Address" {...addressForm.register("line1")} error={addressForm.formState.errors.line1?.message} />
                    <Input label="Apartment, suite, etc. (optional)" {...addressForm.register("line2")} />
                    <div className="grid grid-cols-3 gap-3">
                      <Input label="City" {...addressForm.register("city")} error={addressForm.formState.errors.city?.message} />
                      <Input label="State" {...addressForm.register("state")} error={addressForm.formState.errors.state?.message} />
                      <Input label="Zip Code" {...addressForm.register("pincode")} error={addressForm.formState.errors.pincode?.message} />
                    </div>
                    <Input label="Phone" {...addressForm.register("phone")} error={addressForm.formState.errors.phone?.message} />
                  </section>
                )}

                <section>
                  <h2 className="mb-3 font-serif text-lg font-semibold text-cocoa-900">Delivery Method</h2>
                  <div className="space-y-3">
                    <label className={`flex items-center justify-between rounded-lg border p-4 ${shippingMethod === "standard" ? "border-cocoa-900 bg-cocoa-50" : "border-cocoa-200"}`}>
                      <Radio
                        name="shipping"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                        label={
                          <span>
                            <span className="block font-semibold text-cocoa-900">Standard Fresh Delivery</span>
                            <span className="block text-xs text-cocoa-500">Insulated cold-pack shipping. Arrives in 2-3 business days.</span>
                          </span>
                        }
                      />
                      <span className="text-sm font-semibold text-cocoa-800">
                        {subtotal - discount >= FREE_SHIPPING_THRESHOLD ? "Free" : formatINR(SHIPPING_FLAT_FEE)}
                      </span>
                    </label>
                    <label className={`flex items-center justify-between rounded-lg border p-4 ${shippingMethod === "express" ? "border-cocoa-900 bg-cocoa-50" : "border-cocoa-200"}`}>
                      <Radio
                        name="shipping"
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                        label={
                          <span>
                            <span className="block font-semibold text-cocoa-900">Express Cold-Chain</span>
                            <span className="block text-xs text-cocoa-500">Next-day premium dispatch with extreme temperature control.</span>
                          </span>
                        }
                      />
                      <span className="text-sm font-semibold text-cocoa-800">{formatINR(EXPRESS_SHIPPING_FEE)}</span>
                    </label>
                  </div>
                </section>

                {error && <p className="text-sm text-danger-600">{error}</p>}

                <div className="flex justify-end">
                  <Button onClick={handleContinueToPayment}>Continue to Payment</Button>
                </div>
              </>
            ) : (
              <section className="space-y-4">
                <button onClick={() => setStep(1)} className="text-xs font-semibold uppercase tracking-wider text-cocoa-500 underline">
                  ← Return to Shipping
                </button>
                <div className="rounded-lg border border-cocoa-100 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-600">Shipping To</p>
                  <p className="mt-2 text-sm text-cocoa-800">
                    {addingNew ? addressForm.getValues("fullName") : selectedAddress?.fullName}
                  </p>
                  <p className="text-sm text-cocoa-500">
                    {addingNew ? addressForm.getValues("line1") : selectedAddress?.line1},{" "}
                    {addingNew ? addressForm.getValues("city") : selectedAddress?.city}
                  </p>
                </div>
                <p className="text-sm text-cocoa-500">
                  You&apos;ll securely enter payment details in the next window — we never see or store your card
                  information.
                </p>
                {error && <p className="text-sm text-danger-600">{error}</p>}
                <Button className="w-full" size="lg" disabled={submitting} onClick={handlePlaceOrder}>
                  {submitting ? "Processing..." : `Place Order — ${formatINR(orderSummary.total)}`}
                </Button>
              </section>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-cocoa-100 p-6">
            <p className="font-serif text-lg font-semibold text-cocoa-900">Your Order</p>
            <ul className="mt-4 space-y-3">
              {lines.map((l) => (
                <li key={l.variantId} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-cocoa-50">
                    {l.image && <Image src={l.image} alt={l.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-cocoa-900">
                      {l.name} × {l.quantity}
                    </p>
                    <p className="text-xs text-cocoa-400">{formatINR(l.price * l.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1.5 border-t border-cocoa-100 pt-4 text-sm text-cocoa-600">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(orderSummary.subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between"><span>Discount</span><span>−{formatINR(discount)}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span>{orderSummary.shippingFee === 0 ? "Free" : formatINR(orderSummary.shippingFee)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{formatINR(orderSummary.tax)}</span></div>
            </div>
            <div className="mt-4 flex justify-between border-t border-cocoa-100 pt-4 text-base font-semibold text-cocoa-900">
              <span>Total Due</span>
              <span>{formatINR(orderSummary.total)}</span>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
