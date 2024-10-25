import { getDatabase } from "firebase-admin/database";
import logger from "../../configs/logger";
import type { FlutterWaveWebhookEvent } from "../../configs/types";
import { updateGroupTransactionDetails } from "./grouptransactions";

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

export { verifyFlutterWebhook, checkIfEventAsBeenRecieved };
