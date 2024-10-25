import { getDatabase } from "firebase-admin/database";
import type { CreateContribution } from "../../configs/types";

const createContribution = async (
  data: CreateContribution
): Promise<string> => {
  try {
    const db = getDatabase();
    const groupRef = db.ref("groups");
    const ref = groupRef.push(); // Push to "groups" node in the database
    await ref.set(data); // Wait for the data to be set in the database
    return `${data.name} successfully created`; // Return a success message
  } catch (error: any) {
    throw new Error(`Failed to create contribution: ${error.message}`); // Handle and throw errors
  }
};

const getUsersContributionGroups = async (
  user: string
): Promise<CreateContribution[]> => {
  const db = getDatabase();
  const groupRef = db.ref("groups");
  const groupList: CreateContribution[] = [];

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
              groupList.push(group);
            }
          });
          resolve(groupList); // Resolve the Promise with the groupList
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

export { createContribution, getUsersContributionGroups };
