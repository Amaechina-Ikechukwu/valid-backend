import { getDatabase } from "firebase-admin/database";
import type {
  AllContributionData,
  BodyContributionData,
  CreateContribution,
} from "../../types/types";

const percentageContributed = (
  amount: string | number,
  contributedAmount: number
): number => {
  // Convert the amount to a number, removing commas if it's a string
  const parsedAmount =
    typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;

  if (!parsedAmount || parsedAmount <= 0 || contributedAmount < 0) {
    return 0; // Return 0% if amount is invalid or zero
  }

  return parseFloat(((contributedAmount / parsedAmount) * 100).toFixed(2));
};

const createContribution = async (
  data: CreateContribution
): Promise<string> => {
  try {
    const db = getDatabase();
    const groupRef = db.ref("groups");
    const ref = groupRef.push(); // Push to "groups" node in the database

    const nameExists = await checkIfGroupNameExists(data.name);
    if (nameExists) {
      throw new Error(`Failed to create contribution: Name already exists`); // Handle and throw errors
    }
    await ref.set(data); // Wait for the data to be set in the database
    return `${data.name} successfully created`; // Return a success message
  } catch (error: any) {
    throw new Error(`Failed to create contribution: ${error.message}`); // Handle and throw errors
  }
};
const checkIfGroupNameExists = (name: string): Promise<boolean | null> => {
  const db = getDatabase();
  const groupRef = db.ref(`groups`);

  return new Promise((resolve, reject) => {
    groupRef
      .orderByChild("name")
      .equalTo(name)
      .once(
        "value",
        (snapshot) => {
          resolve(snapshot.exists());
        },
        (error) => {
          reject(error); // Reject the Promise if there's an error
        }
      );
  });
};

const getUsersContributionGroups = async (
  user: string
): Promise<AllContributionData[]> => {
  const db = getDatabase();
  const groupRef = db.ref("groups");
  const groupList: AllContributionData[] = [];

  // Return a Promise to wait for the asynchronous operation to complete

  return new Promise((resolve, reject) => {
    groupRef.once(
      "value",
      (data) => {
        if (data.exists()) {
          data.forEach((groupData) => {
            const group = groupData.val();
            if (
              group.admin === user ||
              (group.participants && group.participants.includes(user))
            ) {
              groupList.push({
                ...group,
                remaining: percentageContributed(
                  group.amount,
                  group.contributedAmount
                ),
              });
            }
          });
          resolve(groupList.reverse()); // Resolve the Promise with the groupList
        } else {
          resolve(groupList); // If no data exists, resolve with an empty list
        }
      },
      (error) => {
        reject(error); // Reject the Promise if there's an error
      }
    );
  });
};

const getGroupInfo = (name: string): Promise<BodyContributionData | null> => {
  const db = getDatabase();
  const groupRef = db.ref(`groups`);

  return new Promise((resolve, reject) => {
    groupRef
      .orderByChild("name")
      .equalTo(name)
      .once(
        "value",
        (snapshot) => {
          if (snapshot.exists()) {
            const groupData = snapshot.val();
            // Assuming there's only one group with this name
            const groupKey = Object.keys(groupData)[0];
            const group = groupData[groupKey];

            // Remove the timestamp if it exists
            if (group.timestamp) {
              delete group.timestamp;
            }

            // Resolve with group data
            resolve(group as BodyContributionData);
          } else {
            // If no group was found, resolve with null
            resolve(null);
          }
        },
        (error) => {
          reject(error); // Reject the Promise if there's an error
        }
      );
  });
};
const addCurrencyToData = (): Promise<void | null> => {
  const db = getDatabase();
  const groupRef = db.ref(`groups`);

  return new Promise((resolve, reject) => {
    groupRef.once(
      "value",
      (snapshot) => {
        if (snapshot.exists()) {
          const groupData = snapshot.val();
          const groupKeys = Object.keys(groupData);

          // Update currency for all groups
          groupKeys.forEach((key) => {
            db.ref(`groups/${key}`).update({ currency: "NGN" });
          });

          console.log("Currency updated for all groups.");

          resolve();
        } else {
          console.log("No groups found.");
          resolve(null);
        }
      },
      (error) => {
        console.error("Error fetching groups:", error);
        reject(error); // Reject the Promise if there's an error
      }
    );
  });
};

export {
  createContribution,
  getUsersContributionGroups,
  getGroupInfo,
  checkIfGroupNameExists,
  addCurrencyToData,
};
