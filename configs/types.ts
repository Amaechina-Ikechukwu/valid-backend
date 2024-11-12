import type { Request } from "express";

export interface CustomRequest extends Request {
  user?: string;
}

export interface CreateContribution {
  name: string;
  amount: string;
  photoUrl?: string;
  admin: string;
  participants: string[];
  id: string;
  purpose?: string;
}
export interface BodyContributionData {
  name: string;
  amount: string;
  purpose?: string;
  photoUrl?: string;
  participants: [];
  contributedAmount: number;
  id: string;
}
export interface AllContributionData {
  name: string;
  photoUrl?: string;
  remaining: number;
  id: string;
  admin: string;
  participants: string[];
}

export type FlutterWaveWebhookEvent = {
  id: number;
  txRef: string;
  flwRef: string;
  orderRef: string;
  paymentPlan: null | string;
  paymentPage: null | string;
  createdAt: string; // ISO date string
  amount: number;
  charged_amount: number;
  status: "successful" | "failed" | "pending"; // You can expand the status options as needed
  IP: string;
  currency: string;
  appfee: number;
  merchantfee: number;
  merchantbearsfee: number;
  charge_type: "normal" | "recurring" | "subscription"; // Possible values based on context
  customer: {
    id: number;
    phone: string;
    fullName: string;
    customertoken: null | string;
    email: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    deletedAt: null | string;
    AccountId: number;
  };
  entity: {
    card6: string; // First 6 digits of the card
    card_last4: string; // Last 4 digits of the card
    card_country_iso: string; // ISO country code
    createdAt: string; // ISO date string
  };
  meta_data: {
    __CheckoutInitAddress: string;
    groupId: string;
  };
  "event.type"?:
    | "CARD_TRANSACTION"
    | "BANK_TRANSACTION"
    | "MOBILE_MONEY_TRANSACTION";
};
export interface TransactionData {
  email: string;
  currency: string;
  amount: number;
  createdAt: string;
  [key: string]: any; // Allows additional properties in the input object
}
