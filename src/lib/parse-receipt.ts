/**
 * Parse receipt/invoice files to extract financial data.
 * Supports PDF text extraction (via pdfjs-dist) and filename-based fallback.
 */

import type { ExpenseCategory, Currency } from "./types";

export interface ParsedReceipt {
  amount?: number;
  currency?: Currency;
  date?: string;        // YYYY-MM-DD
  description?: string;
  category?: ExpenseCategory;
  vendor?: string;
  invoiceNumber?: string;
  isRecurring?: boolean;
  recurringFrequency?: "monthly" | "quarterly" | "yearly";
  vatAmount?: number;
  amountBeforeVat?: number;
}

// ── PDF Text Extraction ──

async function extractPdfText(file: File): Promise<string> {
  if (typeof window === "undefined") return "";

  try {
    // Dynamic ESM import from CDN — webpackIgnore prevents bundling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pdfjsLib: any = (window as any).pdfjsLib;

    if (!pdfjsLib) {
      try {
        // Try native ESM import from CDN (works in modern browsers)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - CDN dynamic import resolved at runtime in browser
        const pdfjs = await import(
          /* webpackIgnore: true */
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs" as any
        );
        pdfjsLib = pdfjs;
      } catch {
        // Fallback: load UMD via script tag
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.js";
          script.onload = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pdfjsLib = (window as any).pdfjsLib;
            if (pdfjsLib) resolve();
            else reject(new Error("pdfjsLib not available after script load"));
          };
          script.onerror = () => reject(new Error("Failed to load pdf.js from CDN"));
          document.head.appendChild(script);
        });
      }
    }

    if (!pdfjsLib) return "";

    // Set worker — use workerless mode to avoid CORS issues
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs";

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

    const textParts: string[] = [];
    for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageText = (content.items as any[])
        .map((item) => item.str ?? "")
        .join(" ");
      textParts.push(pageText);
    }

    const result = textParts.join("\n");
    console.log("[parse-receipt] PDF text extracted:", result.substring(0, 300));
    return result;
  } catch (err) {
    console.warn("PDF parsing failed, falling back to filename:", err);
    return "";
  }
}

// ── Text Analysis ──

function extractAmount(text: string): { amount?: number; currency?: Currency; vatAmount?: number; amountBeforeVat?: number } {
  const result: { amount?: number; currency?: Currency; vatAmount?: number; amountBeforeVat?: number } = {};

  // Look for total amount patterns (Hebrew invoices)
  const totalPatterns = [
    /סה"כ\s*(?:שולם|לתשלום|כולל מע"מ)\s*[₪$€£]?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:[₪$€£])?/,
    /סה"כ\s*[₪$€£]?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:[₪$€£])?/,
    /(?:total|amount|sum|סכום)\s*[:\-]?\s*[₪$€£]?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:לתשלום|שולם|נותר לתשלום)\s*[:\-]?\s*[₪]?\s*([\d,]+(?:\.\d{1,2})?)/,
    /₪\s*([\d,]+(?:\.\d{1,2})?)/,
    /([\d,]+(?:\.\d{1,2})?)\s*₪/,
    /\$([\d,]+(?:\.\d{1,2})?)/,
    /€([\d,]+(?:\.\d{1,2})?)/,
  ];

  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const val = parseFloat(match[1].replace(/,/g, ""));
      if (val > 0 && val < 10000000) {
        result.amount = val;
        break;
      }
    }
  }

  // Detect currency
  if (text.includes("₪") || text.includes("ILS") || text.includes("שקל")) {
    result.currency = "ILS";
  } else if (text.includes("$") || text.includes("USD") || text.includes("dollar")) {
    result.currency = "USD";
  } else if (text.includes("€") || text.includes("EUR") || text.includes("euro")) {
    result.currency = "EUR";
  } else if (text.includes("£") || text.includes("GBP")) {
    result.currency = "GBP";
  }

  // VAT amount
  const vatMatch = text.match(/מע"מ\s*[₪]?\s*([\d,]+(?:\.\d{1,2})?)/);
  if (vatMatch) {
    result.vatAmount = parseFloat(vatMatch[1].replace(/,/g, ""));
  }

  // Amount before VAT
  const beforeVatMatch = text.match(/(?:לפני מע"מ|before vat)\s*[₪]?\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (beforeVatMatch) {
    result.amountBeforeVat = parseFloat(beforeVatMatch[1].replace(/,/g, ""));
  }

  return result;
}

function extractDate(text: string): string | undefined {
  // DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = text.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const d = parseInt(day), m = parseInt(month), y = parseInt(year);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 2020 && y <= 2030) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }

  // YYYY-MM-DD
  const yyyymmdd = text.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    const d = parseInt(day), m = parseInt(month), y = parseInt(year);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 2020 && y <= 2030) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }

  return undefined;
}

function extractInvoiceNumber(text: string): string | undefined {
  const patterns = [
    /(?:חשבונית|קבלה)\s*(?:מס['׳]?|מספר|#)\s*[:\-]?\s*([A-Z]*\d+)/i,
    /(?:invoice|receipt)\s*(?:no|number|#)\s*[:\-]?\s*([A-Z]*\d+)/i,
    /(?:IR|INV|REC)\s*[-]?\s*(\d+)/i,
    /\b([A-Z]{2,4}\d{1,6})\b/,  // e.g. IR71, INV1234
    /מס['׳]?\s*(\d+)/,
    /(?:אסמכתא|אסמכתה)\s*[:\-]?\s*(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return undefined;
}

function extractVendor(text: string): string | undefined {
  // Known vendor patterns
  const knownVendors: [string, string][] = [
    ["make.com", "Make.com"], ["zapier", "Zapier"], ["n8n", "n8n"],
    ["google", "Google"], ["aws", "AWS"], ["amazon", "Amazon"],
    ["azure", "Microsoft Azure"], ["microsoft", "Microsoft"],
    ["meta", "Meta"], ["facebook", "Facebook"], ["openai", "OpenAI"],
    ["slack", "Slack"], ["zoom", "Zoom"], ["monday", "Monday.com"],
    ["wix", "Wix"], ["canva", "Canva"], ["figma", "Figma"],
    ["hubspot", "HubSpot"], ["stripe", "Stripe"], ["paypal", "PayPal"],
    ["בזק", "בזק"], ["פרטנר", "פרטנר"], ["סלקום", "סלקום"],
    ["חברת החשמל", "חברת החשמל"], ["מקורות", "מקורות"],
    ["הוט", "HOT"], ["yes", "Yes"], ["cellcom", "סלקום"],
    ["bezeq", "בזק"], ["partner", "פרטנר"],
    ["fiverr", "Fiverr"], ["upwork", "Upwork"],
  ];

  const textLC = text.toLowerCase();
  for (const [key, name] of knownVendors) {
    if (textLC.includes(key.toLowerCase())) {
      return name;
    }
  }

  // In Hebrew invoices, the VENDOR (issuer) is usually at the top of the document,
  // BEFORE the "לכבוד" (recipient) section. Try to extract it.

  // Pattern: company name followed by ח.פ/ח"פ/עוסק מורשה (business registration)
  const companyWithIdMatch = text.match(/^([֐-׿\s\-"'\.]+(?:בע"מ|בעמ)?)\s*[\d\s]*ח[\."]?פ/m);
  if (companyWithIdMatch) {
    const name = companyWithIdMatch[1].trim();
    if (name.length >= 3 && name.length <= 50) return name;
  }

  // Pattern: text before ח"פ/עוסק מורשה line — the issuer name usually precedes it
  const beforeHpMatch = text.match(/([֐-׿][^\n]{2,40})\s+\d{5,9}\s+ח[\."]?פ/);
  if (beforeHpMatch) {
    const name = beforeHpMatch[1].trim().replace(/\s+/g, " ");
    if (name.length >= 3 && name.length <= 50) return name;
  }

  // Pattern: text right before ח"פ /עוסק מורשה
  const beforeOsekMatch = text.match(/([֐-׿][^\n]{2,40})\s+\d{5,9}\s+ח"פ\s*\/?\s*עוסק/);
  if (beforeOsekMatch) {
    const name = beforeOsekMatch[1].trim().replace(/\s+/g, " ");
    if (name.length >= 3 && name.length <= 50) return name;
  }

  // Fallback: find the first Hebrew business-like name (containing בע"מ, הפקות, שירותי, etc.)
  const bizNameMatch = text.match(/([֐-׿][֐-׿\s\-"'\.]{2,40}(?:בע"מ|הפקות|שירותי|סטודיו|מעבדות|טכנולוגיות|פתרונות|ייעוץ|קבוצת))/);
  if (bizNameMatch) {
    return bizNameMatch[1].trim();
  }

  // Last resort: extract first meaningful Hebrew phrase (usually vendor at top)
  // But NOT "לכבוד" which is the recipient
  const firstHebrewPhrase = text.match(/([֐-׿][֐-׿\s\-"'\.]{3,40})/);
  if (firstHebrewPhrase) {
    const candidate = firstHebrewPhrase[1].trim();
    // Skip if it's a common header/label word
    if (!["חשבונית", "קבלה", "מס", "מקור", "תאריך", "לכבוד", "סה\"כ"].some(w => candidate.startsWith(w))) {
      return candidate;
    }
  }

  return undefined;
}

function detectCategory(text: string): ExpenseCategory | undefined {
  const textLC = text.toLowerCase();

  const categoryMap: [string[], ExpenseCategory][] = [
    [["cloud", "saas", "software", "license", "hosting", "server", "domain", "ssl", "aws", "azure", "api", "תוכנה", "רישיון", "אחסון"], "software"],
    [["salary", "payroll", "wages", "bonus", "pension", "employee", "worker", "משכורת", "שכר", "פנסיה", "עובד"], "payroll"],
    [["legal", "accounting", "consult", "lawyer", "cpa", "audit", "tax", "advisor", "עו\"ד", "רו\"ח", "ייעוץ", "ליווי עסקי", "מס", "ביקורת", "הנהלת חשבונות"], "professional"],
    [["כנס", "conference", "event", "הרשמה", "registration", "השתתפות"], "professional"],
    [["marketing", "campaign", "ad ", "ads", "facebook ads", "google ads", "social", "seo", "promo", "שיווק", "קמפיין", "פרסום"], "marketing"],
    [["office", "rent", "electric", "water", "internet", "phone", "supplies", "furniture", "cleaning", "משרד", "שכירות", "חשמל", "מים", "טלפון", "ניקיון"], "office"],
    [["travel", "flight", "hotel", "taxi", "uber", "fuel", "gas", "parking", "train", "נסיעה", "טיסה", "מלון", "דלק", "חניה"], "travel"],
    [["equipment", "hardware", "computer", "laptop", "monitor", "printer", "camera", "ציוד", "מחשב", "מדפסת"], "equipment"],
  ];

  for (const [keywords, cat] of categoryMap) {
    if (keywords.some(kw => textLC.includes(kw))) {
      return cat;
    }
  }

  return undefined;
}

// ── Main Parse Function ──

export async function parseReceiptFile(file: File): Promise<ParsedReceipt> {
  const result: ParsedReceipt = {};
  const nameLC = file.name.toLowerCase();
  const nameNoExt = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");

  // Try to extract text from PDF
  let fullText = "";
  if (nameLC.endsWith(".pdf")) {
    fullText = await extractPdfText(file);
  }

  // If we got text from PDF, parse it
  if (fullText.length > 10) {
    // Amount & currency
    const amountData = extractAmount(fullText);
    if (amountData.amount) result.amount = amountData.amount;
    if (amountData.currency) result.currency = amountData.currency;
    if (amountData.vatAmount) result.vatAmount = amountData.vatAmount;
    if (amountData.amountBeforeVat) result.amountBeforeVat = amountData.amountBeforeVat;

    // Date
    result.date = extractDate(fullText);

    // Invoice number
    result.invoiceNumber = extractInvoiceNumber(fullText);

    // Vendor
    result.vendor = extractVendor(fullText);

    // Category
    result.category = detectCategory(fullText);

    // Description — use invoice number + vendor if available
    const parts: string[] = [];
    if (result.invoiceNumber) parts.push(result.invoiceNumber);
    if (result.vendor) parts.push(result.vendor);
    if (parts.length > 0) {
      result.description = parts.join(" - ");
    } else {
      result.description = nameNoExt;
    }
  } else {
    // Fallback: filename-based parsing
    result.description = nameNoExt;

    // Invoice number from filename
    const invMatch = file.name.match(/(\d{4,})/);
    if (invMatch) result.invoiceNumber = `INV-${invMatch[1]}`;

    // Amount from filename
    const numbers = [...file.name.matchAll(/(\d{1,3}(?:[,.]?\d{3})*(?:\.\d{1,2})?)/g)]
      .map(m => ({ raw: m[1], val: parseFloat(m[1].replace(/,/g, "")) }))
      .filter(n => n.val > 0 && n.val < 1000000);
    if (numbers.length > 0) {
      const candidate = numbers.find(n => n.val < 100000 && n.raw.length <= 7) ?? numbers[0];
      result.amount = candidate.val;
    }

    // Category from filename
    result.category = detectCategory(nameLC);

    // Vendor from filename
    result.vendor = extractVendor(nameLC);

    // Currency from filename
    if (nameLC.includes("usd") || nameLC.includes("$")) result.currency = "USD";
    else if (nameLC.includes("eur")) result.currency = "EUR";
    else if (nameLC.includes("gbp")) result.currency = "GBP";
  }

  // Recurring detection (from both sources)
  const checkText = (fullText + " " + nameLC).toLowerCase();
  if (checkText.includes("monthly") || checkText.includes("subscription") || checkText.includes("חודשי") || checkText.includes("מנוי")) {
    result.isRecurring = true;
    result.recurringFrequency = "monthly";
  } else if (checkText.includes("yearly") || checkText.includes("annual") || checkText.includes("שנתי")) {
    result.isRecurring = true;
    result.recurringFrequency = "yearly";
  }

  return result;
}
