import type { AppState, Customer, Txn, TxnType } from "../types";
import { addDays, toISO, todayISO, uid } from "./calc";

interface SeedPerson {
  name: string;
  phone: string;
  address: string;
  type: "customer" | "supplier";
  entries: { dayAgo: number; type: TxnType; amount: number; note?: string }[];
}

const PEOPLE: SeedPerson[] = [
  {
    name: "রফিকুল ইসলাম",
    phone: "01712-345678",
    address: "বাজারপাড়া, নেত্রকোণা",
    type: "customer",
    entries: [
      { dayAgo: 38, type: "sale", amount: 3200, note: "চাল ৫০ কেজি" },
      { dayAgo: 30, type: "payment_in", amount: 2000, note: "আংশিক জমা" },
      { dayAgo: 21, type: "sale", amount: 1850, note: "ডাল-তেল" },
      { dayAgo: 9, type: "sale", amount: 2450, note: "ময়দা ও চিনি" },
      { dayAgo: 2, type: "payment_in", amount: 1000 },
    ],
  },
  {
    name: "সুমিতা রানী দাস",
    phone: "01819-223344",
    address: "মোহনগঞ্জ রোড",
    type: "customer",
    entries: [
      { dayAgo: 27, type: "sale", amount: 5600, note: "মুদি বাজার" },
      { dayAgo: 15, type: "payment_in", amount: 3000 },
      { dayAgo: 4, type: "sale", amount: 1200, note: "ডিম-ডাল" },
    ],
  },
  {
    name: "আব্দুল কাদের",
    phone: "01911-556677",
    address: "স্টেশন বাজার",
    type: "customer",
    entries: [
      { dayAgo: 33, type: "sale", amount: 7300, note: "বালিশ-চাদর" },
      { dayAgo: 12, type: "sale", amount: 4100, note: "প্লাস্টিক সামগ্রী" },
      { dayAgo: 3, type: "payment_in", amount: 5000 },
    ],
  },
  {
    name: "জাহানারা বেগম",
    phone: "01605-998877",
    address: "কেন্দ্রীয় বাজার",
    type: "customer",
    entries: [
      { dayAgo: 19, type: "sale", amount: 2400, note: "সাবান-শ্যাম্পু" },
      { dayAgo: 8, type: "sale", amount: 1800 },
      { dayAgo: 1, type: "payment_in", amount: 1500 },
    ],
  },
  {
    name: "মোঃ সাইফুল আলম",
    phone: "01744-112233",
    address: "গুরুদয়াল, নেত্রকোণা",
    type: "customer",
    entries: [
      { dayAgo: 25, type: "sale", amount: 9500, note: "সিমেন্ট ৫ ব্যাগ" },
      { dayAgo: 6, type: "payment_in", amount: 9500, note: "সম্পূর্ণ জমা" },
    ],
  },
  {
    name: "ফাতেমা খাতুন",
    phone: "01521-778899",
    address: "রাধানগর",
    type: "customer",
    entries: [
      { dayAgo: 14, type: "sale", amount: 2850, note: "মুদি-চা পাতা" },
      { dayAgo: 5, type: "sale", amount: 1600 },
    ],
  },
  {
    name: "নাসির ট্রেডার্স",
    phone: "01700-445566",
    address: "পাইকারি মার্কেট, ময়মনসিংহ",
    type: "supplier",
    entries: [
      { dayAgo: 40, type: "purchase", amount: 45000, note: "চাল-ডাল পাইকারি" },
      { dayAgo: 22, type: "payment_out", amount: 30000 },
      { dayAgo: 7, type: "purchase", amount: 18500, note: "তেল-চিনি" },
    ],
  },
  {
    name: "হাসান স্টোর",
    phone: "01888-990011",
    address: "পাইকারি মার্কেট, নেত্রকোণা",
    type: "supplier",
    entries: [
      { dayAgo: 35, type: "purchase", amount: 22000, note: "মুদি পণ্য" },
      { dayAgo: 18, type: "payment_out", amount: 12000 },
    ],
  },
];

export function buildDemoState(): AppState {
  const today = todayISO();
  const customers: Customer[] = [];
  const txns: Txn[] = [];

  PEOPLE.forEach((p) => {
    const id = uid();
    customers.push({
      id,
      name: p.name,
      phone: p.phone,
      address: p.address,
      type: p.type,
      note: "",
      createdAt: addDays(today, -45),
    });
    p.entries.forEach((e, i) => {
      txns.push({
        id: uid(),
        customerId: id,
        type: e.type,
        amount: e.amount,
        date: addDays(today, -e.dayAgo),
        note: e.note ?? "",
        createdAt: Date.now() - e.dayAgo * 86400000 - i,
      });
    });
  });

  return {
    settings: {
      shopName: "Mahi And Muhi Traders",
      ownerName: "",
      phone: "017XX-XXXXXX",
      address: "নেত্রকোণা, বাংলাদেশ",
      language: "bn",
      bengaliDigits: false,
      dark: false,
      themeColor: "#0c6b4e",
    },
    customers,
    txns,
  };
}
