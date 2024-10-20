import { getDatabase } from "firebase-admin/database";
import type { CreateContribution } from "../../types";

const createContribution = async (
  data: CreateContribution
): Promise<string> => {
  try {
    const db = getDatabase();
    const ref = db.ref("groups").push(); // Push to "groups" node in the database
    await ref.set(data); // Wait for the data to be set in the database
    return `${data.name} successfully created`; // Return a success message
  } catch (error: any) {
    throw new Error(`Failed to create contribution: ${error.message}`); // Handle and throw errors
  }
};

export { createContribution };
