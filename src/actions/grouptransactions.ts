import { getDatabase } from "firebase-admin/database";
import type {
  FlutterWaveWebhookEvent,
  TransactionData,
} from "../../configs/types";
import logger from "../../configs/logger";

function getFilteredTransactionData(data: any): Partial<TransactionData> {
  const { email, currency, amount, createdAt } = data;
  return { email, currency, amount, createdAt };
}

const getGroupTransactionsDetails = (
  groupid: string
): Promise<Partial<TransactionData>[]> => {
  const db = getDatabase();
  const groupRef = db.ref(`grouptransactions/${groupid}`);
  const groupTransactions: Partial<TransactionData>[] = [];

  return new Promise((resolve, reject) => {
    groupRef.once(
      "value",
      (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const transactionData = childSnapshot.val(); // Get the transaction data
          groupTransactions.push(getFilteredTransactionData(transactionData));
        });
        resolve(groupTransactions);
      },
      (error) => {
        reject(error);
      }
    );
  });
};
const updateGroupContributionAmount = (
  payload: FlutterWaveWebhookEvent
): Promise<void> => {
  const db = getDatabase();
  const groupRef = db.ref(`groups/${payload.meta_data.groupId}`);

  return new Promise((resolve, reject) => {
    groupRef
      .once("value")
      .then((snapshot) => {
        const contributed = snapshot.val()?.contributedAmount || 0; // Safely handle undefined values
        const participants: string[] = snapshot.val()?.participants;
        if (participants.includes(payload.customer.email) == false) {
          participants.push(payload.customer.email);
          return groupRef.update({
            contributedAmount: contributed + payload.amount,
            participants: participants,
          });
        } else {
          return groupRef.update({
            contributedAmount: contributed + payload.amount,
          });
        }
      })
      .then(() => {
        resolve(); // Resolve when the update is successful
      })
      .catch((error) => {
        logger.error("Failed to update contribution amount:", error);
        reject(error); // Reject if there's an error
      });
  });
};

const updateGroupTransactionDetails = async (
  payload: FlutterWaveWebhookEvent
) => {
  try {
    const db = getDatabase();
    const groupRef = db.ref(`grouptransactions/${payload.meta_data.groupId}`);
    const data = {
      ...payload.customer,
      amount: payload.amount,
      currency: payload.currency,
      event_type: payload["event.type"],
    };
    const ref = groupRef.push();
    await ref.set(data);
    await updateGroupContributionAmount(payload);
    return true;
  } catch (error: any) {
    logger.error(error);
    throw new Error("updateGroupTransactionDetails: " + error.message);
  }
};
export {
  updateGroupContributionAmount,
  updateGroupTransactionDetails,
  getGroupTransactionsDetails,
};
