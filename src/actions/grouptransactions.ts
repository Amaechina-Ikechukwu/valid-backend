import { getDatabase, ServerValue } from "firebase-admin/database";
import type {
  BodyContributionData,
  FlutterWaveWebhookEvent,
  TransactionData,
} from "../../types/types";
import logger from "../../configs/logger";
import { getEmailByUserId } from "./users";

function getFilteredTransactionData(data: any): Partial<TransactionData> {
  const { email, currency, amount, createdAt } = data;
  return { email, currency, amount, createdAt };
}

const initiateGroupWithdrawalProcess = async (
  id: string,
  user: string
): Promise<void> => {
  const db = getDatabase();
  const groupRef = db.ref(`groups`);

  try {
    const snapshot = await groupRef
      .orderByChild("id")
      .equalTo(id)
      .once("value");
    const groupData = snapshot.val();

    if (!groupData) {
      throw new Error("Group not found");
    }

    const groupKey = Object.keys(groupData)[0];
    const group = groupData[groupKey];

    if (group.admin !== user) {
      throw new Error("This user is not an admin");
    }

    await groupRef.child(`${groupKey}`).update({
      adminWithdrawal: {
        initiated: true,
        initiatedAt: ServerValue.TIMESTAMP,
        approved: false,
      },
    });
    const participants: string[] = group?.participants || [];
    const userEmail = await getEmailByUserId(user);

    let withdrawalApprovalCount: number = group?.withdrawalApprovalCount ?? 0;
    //if admin contributed, once he initializes withdrawal, his count is added to
    // the approveWithdrawalAdmin function was not reused to prevent certain issue as it was desgined for non-admins
    if (participants.includes(userEmail)) {
      withdrawalApprovalCount += 1;

      await groupRef.child(`${groupKey}`).update({
        withdrawalApprovalCount,
      });
    }
  } catch (error) {
    logger.error("Failed to initiate withdrawal:", error);
    throw error;
  }
};

const approveWithdrawalAdmin = async (
  id: string,
  user: string
): Promise<void> => {
  const db = getDatabase();
  const groupRef = db.ref(`groups`);
  const userEmail = await getEmailByUserId(user);

  if (!userEmail || userEmail.length < 1) {
    console.error("User email not found or invalid.");
    return;
  }

  try {
    const snapshot = await groupRef
      .orderByChild("id")
      .equalTo(id)
      .once("value");
    const groupData = snapshot.val();

    if (!groupData) {
      throw new Error("Group not found");
    }

    const groupKey = Object.keys(groupData)[0];
    const group = groupData[groupKey];

    const participants: string[] = group?.participants || [];
    let withdrawalApprovalCount: number = group?.withdrawalApprovalCount ?? 0;

    if (!participants.includes(userEmail)) {
      throw new Error("User not part of this group");
    }

    if (withdrawalApprovalCount >= participants.length) {
      await groupRef.child(`${groupKey}`).update({
        adminWithdrawal: {
          initiated: true,
          initiatedAt: ServerValue.TIMESTAMP,
          approved: true, // approves admin
        },
      });
    }

    withdrawalApprovalCount += 1;

    await groupRef.child(`${groupKey}`).update({
      withdrawalApprovalCount,
    });
  } catch (error) {
    logger.error("Failed to approve withdrawal:", error);
    throw error;
  }
};

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
  const groupRef = db.ref(`groups`);

  return new Promise((resolve, reject) => {
    groupRef
      .orderByChild("name")
      .equalTo(payload.meta_data.groupId)
      .once("value")
      .then((snapshot) => {
        if (!snapshot.exists()) {
          throw new Error("Group not found");
        }

        // Assuming there's only one matching group
        const groupKey = Object.keys(snapshot.val())[0];
        const groupData = snapshot.val()[groupKey];
        const contributed = groupData.contributedAmount || 0;
        const participants = Array.isArray(groupData.participants)
          ? groupData.participants
          : [];

        // Prepare the update data
        const updateData: Partial<BodyContributionData> = {
          contributedAmount: contributed + payload.amount,
        };

        // Add new participant if they’re not already in the list
        if (!participants.includes(payload.customer.email)) {
          participants.push(payload.customer.email);
          updateData.participants = participants;
        }

        // Update the specific group record
        return groupRef.child(groupKey).update(updateData);
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
  initiateGroupWithdrawalProcess,
  approveWithdrawalAdmin,
};
