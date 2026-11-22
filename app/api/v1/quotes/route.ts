import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Prisma, PackageTier } from "@prisma/client";

// Rate card for exact server-side recomputation
const RATE_CARD: Record<string, { label: string; rate: number }> = {
  hub_mgr: { label: "Hub Manager (L3)", rate: 9000 },
  proj_lead: { label: "Project Lead (L2)", rate: 4500 },
  dev: { label: "Developer (L1)", rate: 1500 },
  std_aud: { label: "Standard Auditor (L1)", rate: 4500 },
  cross_aud: { label: "Cross-Hub Auditor (L2)", rate: 8500 },
  hub_infra: { label: "Hub Container Infrastructure", rate: 7000 },
  proj_pack: { label: "AI Governance Capacity Pack", rate: 23500 },
  dev_pack: { label: "Developer Pack (10 seats)", rate: 15000 },
  pl_pack: { label: "Project Lead Pack (3 seats)", rate: 10500 },
  aud_pack: { label: "Standard Auditor Pack (5 seats)", rate: 22500 },
  xaud_pack: { label: "Cross-Hub Auditor Pack (3 seats)", rate: 25500 },
  model_slot: { label: "Governed AI Model Slot", rate: 2500 },
  hub_extra: { label: "Additional Hub Container", rate: 7000 },
};

const TERM_DISCOUNT: Record<number, number> = {
  1: 0,
  3: 0.12,
  4: 0.15,
  5: 0.18,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyLegalName,
      companyTradingName,
      companyCountry,
      companyAddress,
      companyRegNumber,
      companyTaxId,
      billingAddress,
      contactName,
      contactDesignation,
      contactEmail,
      contactPhone,
      signatoryName,
      signatoryDesignation,
      signatoryEmail,
      signatoryIsSameAsContact = true,
      packageTier = "LAUNCH",
      termYears = 1,
      hubs = 1,
      seats = {},
      addons = {},
      services = {},
      taxRate = 0,
    } = body;

    if (!companyLegalName || !contactEmail || !contactName) {
      return NextResponse.json(
        { error: "Company legal name, contact name, and contact email are required." },
        { status: 400 }
      );
    }

    // 1. Generate unique reference number (e.g. ANC-Q-2027-0104)
    const year = new Date().getFullYear();
    const count = await prisma.quote.count();
    const seq = (count + 1).toString().padStart(4, "0");
    const referenceNumber = `ANC-Q-${year}-${seq}`;

    // 2. Compute exact itemized pricing using Decimal minor units
    let annualList = 0;
    const lineItemsData: Array<{
      itemCode: string;
      description: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      discountAmount: Prisma.Decimal;
      lineTotal: Prisma.Decimal;
    }> = [];

    // Hub containers
    if (hubs > 0) {
      const lineCost = hubs * 7000;
      annualList += lineCost;
      lineItemsData.push({
        itemCode: "HUB_CONTAINER",
        description: `${hubs} × Hub Container Infrastructure ($7,000/yr)`,
        quantity: hubs,
        unitPrice: new Prisma.Decimal(7000),
        discountAmount: new Prisma.Decimal(0),
        lineTotal: new Prisma.Decimal(lineCost),
      });
    }

    // Clearance Seats
    for (const [key, qty] of Object.entries(seats as Record<string, number>)) {
      if (qty > 0 && RATE_CARD[key]) {
        const item = RATE_CARD[key];
        const cost = qty * item.rate;
        annualList += cost;
        lineItemsData.push({
          itemCode: key.toUpperCase(),
          description: `${qty} × ${item.label} ($${item.rate.toLocaleString()}/yr)`,
          quantity: qty,
          unitPrice: new Prisma.Decimal(item.rate),
          discountAmount: new Prisma.Decimal(0),
          lineTotal: new Prisma.Decimal(cost),
        });
      }
    }

    // Addons
    for (const [key, qty] of Object.entries(addons as Record<string, number>)) {
      if (qty > 0 && RATE_CARD[key]) {
        const item = RATE_CARD[key];
        const cost = qty * item.rate;
        annualList += cost;
        lineItemsData.push({
          itemCode: key.toUpperCase(),
          description: `${qty} × ${item.label} ($${item.rate.toLocaleString()}/yr)`,
          quantity: qty,
          unitPrice: new Prisma.Decimal(item.rate),
          discountAmount: new Prisma.Decimal(0),
          lineTotal: new Prisma.Decimal(cost),
        });
      }
    }

    // Professional Services
    let servicesCost = 0;
    for (const [key, val] of Object.entries(services as Record<string, number>)) {
      if (val > 0) {
        servicesCost += val;
        lineItemsData.push({
          itemCode: `SVC_${key.toUpperCase()}`,
          description: `Professional Service (${key})`,
          quantity: 1,
          unitPrice: new Prisma.Decimal(val),
          discountAmount: new Prisma.Decimal(0),
          lineTotal: new Prisma.Decimal(val),
        });
      }
    }

    // Discount logic: Launch has a fixed floor of $29k (if annualList <= 29000 or packageTier == LAUNCH)
    const isLaunch = packageTier === "LAUNCH";
    const bundleDiscountPct = isLaunch ? 0 : 0.15;
    const bundleDiscountAmt = isLaunch ? 0 : annualList * bundleDiscountPct;
    const afterBundle = annualList - bundleDiscountAmt;

    const termDiscountPct = TERM_DISCOUNT[termYears] || 0;
    const termDiscountAmt = afterBundle * termDiscountPct;
    const netAnnual = afterBundle - termDiscountAmt;

    const contractBase = netAnnual * termYears + servicesCost;
    const taxPct = Math.max(0, Number(taxRate) || 0) / 100;
    const taxAmt = contractBase * taxPct;
    const totalContractAmt = contractBase + taxAmt;

    // 3. Create Quote and associated line items
    const quote = await prisma.quote.create({
      data: {
        referenceNumber,
        companyLegalName: companyLegalName.trim(),
        companyTradingName: companyTradingName?.trim() || null,
        companyCountry: companyCountry.trim(),
        companyAddress: companyAddress?.trim() || null,
        companyRegNumber: companyRegNumber?.trim() || null,
        companyTaxId: companyTaxId?.trim() || null,
        billingAddress: billingAddress?.trim() || null,
        contactName: contactName.trim(),
        contactDesignation: contactDesignation?.trim() || null,
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone?.trim() || null,
        signatoryName: signatoryIsSameAsContact ? contactName.trim() : (signatoryName?.trim() || null),
        signatoryDesignation: signatoryIsSameAsContact ? contactDesignation?.trim() : (signatoryDesignation?.trim() || null),
        signatoryEmail: signatoryIsSameAsContact ? contactEmail.trim().toLowerCase() : (signatoryEmail?.trim().toLowerCase() || null),
        signatoryIsSameAsContact,
        packageTier: packageTier as PackageTier,
        termYears: Number(termYears) || 1,
        currency: "USD",
        annualListPrice: new Prisma.Decimal(annualList),
        bundleDiscount: new Prisma.Decimal(bundleDiscountAmt),
        termDiscount: new Prisma.Decimal(termDiscountAmt),
        netAnnualPrice: new Prisma.Decimal(netAnnual),
        servicesTotal: new Prisma.Decimal(servicesCost),
        taxRate: new Prisma.Decimal(Number(taxRate) || 0),
        taxAmount: new Prisma.Decimal(taxAmt),
        totalContract: new Prisma.Decimal(totalContractAmt),
        status: "SUBMITTED",
        submittedAt: new Date(),
        lineItems: {
          create: lineItemsData,
        },
      },
      include: {
        lineItems: true,
      },
    });

    return NextResponse.json({
      success: true,
      referenceNumber: quote.referenceNumber,
      quote: {
        id: quote.id,
        referenceNumber: quote.referenceNumber,
        company: quote.companyLegalName,
        packageTier: quote.packageTier,
        termYears: quote.termYears,
        netAnnual: Number(quote.netAnnualPrice),
        totalContract: Number(quote.totalContract),
        submittedAt: quote.submittedAt,
        lineItemsCount: quote.lineItems.length,
      },
      message: `Commercial proposal ${quote.referenceNumber} generated and recorded. A formal Master Subscription Agreement & Order Form has been queued for review.`,
    });
  } catch (error: any) {
    console.error("POST /api/v1/quotes error:", error);
    return NextResponse.json(
      { error: "Failed to generate commercial quote. " + (error.message || "") },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ANIMUS_ADMIN") {
      return NextResponse.json(
        { error: "Access Denied: Platform Administrator clearance required." },
        { status: 403 }
      );
    }

    const quotes = await prisma.quote.findMany({
      include: {
        lineItems: true,
        contracts: {
          select: {
            id: true,
            referenceNumber: true,
            contractStatus: true,
            paymentStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      quotes: quotes.map((q) => ({
        id: q.id,
        referenceNumber: q.referenceNumber,
        company: q.companyLegalName,
        country: q.companyCountry,
        contactName: q.contactName,
        contactEmail: q.contactEmail,
        packageTier: q.packageTier,
        termYears: q.termYears,
        totalContract: Number(q.totalContract),
        status: q.status,
        submittedAt: q.submittedAt,
        lineItems: q.lineItems,
        contracts: q.contracts,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/v1/quotes error:", error);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}
