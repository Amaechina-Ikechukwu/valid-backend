import { getDatabase } from "firebase-admin/database";
import logger from "../../configs/logger";
import type {
  AccountDetailsResponse,
  FlutterWaveWebhookEvent,
} from "../../types/types";
import { updateGroupTransactionDetails } from "./grouptransactions";
import type {
  BankFetchResponse,
  TransferFee,
  TransferFeeResponse,
  TransferRequest,
  TransferRequestResponse,
} from "../../types/transactiontypes";

const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);
const verifyFlutterWebhook = async (
  payloadId: number,
  expectedAmount: number,
  expectedCurrency: string
): Promise<boolean> => {
  try {
    const response = await flw.Transaction.verify({ id: payloadId });
    if (
      response.data.status === "successful" &&
      response.data.amount === expectedAmount &&
      response.data.currency === expectedCurrency
    ) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logger.error(error);
    return false;
  }
};
const saveTransaction = async (
  payload: FlutterWaveWebhookEvent
): Promise<boolean> => {
  try {
    // Deep clone the payload and modify the key
    const modifiedPayload = {
      ...payload,
      event_type: payload["event.type"], // Replace "event.type" with "event_type"
    };
    delete modifiedPayload["event.type"]; // Remove the original key

    const db = getDatabase();
    const groupRef = db.ref("flwpayloads");
    const ref = groupRef.push(); // Push to "groups" node in the database
    await ref.set(modifiedPayload); // Wait for the data to be set in the database
    return true; // Return a success message
  } catch (error: any) {
    logger.error(`Failed to create contribution: ${error.message}`); // Handle and throw errors
    return false;
  }
};

const checkIfEventAsBeenRecieved = async (payload: FlutterWaveWebhookEvent) => {
  try {
    const db = getDatabase();
    const groupRef = db.ref("flwpayloads");

    // Use .once("value") to perform a one-time check for existing event
    const snapshot = await groupRef
      .orderByChild("id")
      .equalTo(payload.id)
      .once("value");

    const existingEvent = snapshot.exists(); // Check if any data matches the event ID

    if (!existingEvent) {
      // If event doesn't exist, save it
      await saveTransaction(payload);
      const updated = await updateGroupTransactionDetails(payload);
      return updated;
    } else {
      // Event already exists
      return true;
    }
  } catch (error: any) {
    logger.error(`Failed to check event: ${error.message}`);
    return false;
  }
};
const verifyTransferBankAccount = async (details: {
  account_number: string;
  account_bank: string;
}) => {
  try {
    const newDetails = {
      account_number: details.account_number,
      account_bank: details.account_bank,
    };
    const response: AccountDetailsResponse = await flw.Misc.verify_Account(
      newDetails
    );
    if (response.status === "error") {
      logger.error(response.message);
      throw new Error(response.message);
    }
    return response;
  } catch (error: any) {
    logger.error(error.message || error);
    throw error; // Ensure the error propagates to the caller.
  }
};
const getTransferFee = async (payload: TransferFee) => {
  try {
    const response: TransferFeeResponse = await flw.Transfer.fee(payload);
    if (response.status === "error") {
      logger.error(response.message);
      throw new Error(response.message);
    }
    return response;
  } catch (error: any) {
    logger.error(error.message || error);
    throw error; // Ensure the error propagates to the caller.
  }
};
const makeTransferRequest = async (payload: TransferRequest) => {
  try {
    const response: TransferRequestResponse = await flw.Transfer.initiate(
      payload
    );
    if (response.status === "error") {
      logger.error(response.message);
      throw new Error(response.message);
    }
    return response;
  } catch (error: any) {
    logger.error(error.message || error);
    throw error; // Ensure the error propagates to the caller.
  }
};

const getNigerianBanks = async () => {
  try {
    const response = await fetch("https://api.flutterwave.com/v3/banks/NG", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    });

    const data: BankFetchResponse = await response.json();
    console.log({ data });
    if (data.status === "success") {
      return data;
    } else {
      logger.error(data.message || "Could fetch Banks");
      throw new Error(data.message || "Could fetch Banks");
    }
  } catch (error) {
    logger.error(error || error);
    throw error; // Ensure the error propagates to the caller.
  }
};

export {
  verifyFlutterWebhook,
  checkIfEventAsBeenRecieved,
  verifyTransferBankAccount,
  getTransferFee,
  makeTransferRequest,
  getNigerianBanks,
};
