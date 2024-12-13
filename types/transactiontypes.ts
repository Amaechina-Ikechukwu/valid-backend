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

export interface AccountDetailsResponse {
  status: "success" | "error";
  message: string;
  data: {
    account_number: string;
    account_name: string;
  };
}
export interface TransferFeeResponse {
  status: "success" | "error";
  message: string;
  data: TransferFee[];
}

export interface TransferFee {
  currency: string;
  amount: string;
}
export interface TransferRequest {
  account_bank: string;
  account_number: string;
  amount: number;
  narration: string;
  currency: string;
  reference: string;
  callback_url: string;
  debit_currency: string;
}

export interface TransferRequestResponse {
  status: "success" | "error";
  message: string;
  data: {
    id: number;
    account_number: string;
    bank_code: string;
    full_name: string;
    created_at: string;
    currency: string;
    debit_currency: string;
    amount: number;
    fee: number;
    status: string;
    reference: string;
    meta: null | Record<string, unknown>;
    narration: string;
    complete_message: string;
    requires_approval: number;
    is_approved: number;
    bank_name: string;
  };
}
export interface BankFetchResponse {
  status: "success" | "error";
  message: string;
  data: Bank[];
}

export interface Bank {
  id: number;
  code: string;
  name: string;
}
