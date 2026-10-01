export type PolicySection = { heading: string; body: string };
export type Policy = { slug: string; title: string; updatedAt: string; sections: PolicySection[] };

export const POLICIES: Policy[] = [
  {
    slug: "shipping-delivery",
    title: "Shipping & Delivery Policy",
    updatedAt: "January 2025",
    sections: [
      {
        heading: "1. Artisan Temp-Controlled Logistics",
        body: "Because our chocolate contains only pure cocoa butter without artificial stabilizers, it is highly sensitive to extreme temperatures. Every single box we dispatch is monitored against regional climate forecasts and padded with thermal protective insulation and medical-grade dry ice packs when temperatures exceed 72°F (22°C).",
      },
      {
        heading: "2. Melt Guarantee & Liability",
        body: "We guarantee that your chocolates will arrive in immaculate, pristine tempered condition. In the rare event that your confections exhibit damage or structural melting during transit, please photograph the items immediately and file a claim with our support desk within 24 hours of receipt for a direct replacement batch.",
      },
      {
        heading: "3. Carrier Restrictions & PO Boxes",
        body: "We partner exclusively with premium express couriers to minimize time in transit. Because hand-tempered confections require immediate physical handoff or storage, we cannot ship to PO Boxes, unmanned lockboxes, or remote unattended drop points. Please ensure someone is present at the physical address to receive the delivery.",
      },
    ],
  },
  {
    slug: "return-melt",
    title: "Return & Melt Policy",
    updatedAt: "January 2025",
    sections: [
      {
        heading: "1. Eligibility",
        body: "Being a perishable food product, we only accept returns for items that arrive damaged, melted in transit, or incorrect. Please contact us within 48 hours of delivery with photos of the issue.",
      },
      {
        heading: "2. Refund Timeline",
        body: "Approved refunds are processed to the original payment method within 5-7 business days of claim approval.",
      },
      {
        heading: "3. Cancellations",
        body: "Orders can be cancelled free of charge before they enter fulfillment. Once a batch has shipped, cancellation is no longer possible.",
      },
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    updatedAt: "January 2025",
    sections: [
      {
        heading: "1. What We Collect",
        body: "We collect the contact and shipping details you provide at checkout, your order history, and basic analytics on site usage — solely to process orders and improve the Atelier experience.",
      },
      {
        heading: "2. What We Never Store",
        body: "Your card, UPI, or bank details are handled directly by our payment processor and never touch our servers in plain form.",
      },
      {
        heading: "3. Your Rights",
        body: "For any privacy-related questions or to request deletion of your data, contact us at privacy@zestchocolates.com.",
      },
    ],
  },
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    updatedAt: "January 2025",
    sections: [
      {
        heading: "1. Orders",
        body: "All orders are subject to product availability. We reserve the right to cancel any order due to stock issues, pricing errors, or suspected fraud — in which case a full refund will be issued.",
      },
      {
        heading: "2. Pricing",
        body: "Prices are listed in your local currency and inclusive of applicable taxes unless stated otherwise.",
      },
      {
        heading: "3. Intellectual Property",
        body: "All content on this site, including images, recipes, and text, is the property of Zest Chocolates Ltd.",
      },
    ],
  },
];

export function getPolicy(slug: string) {
  return POLICIES.find((p) => p.slug === slug);
}
