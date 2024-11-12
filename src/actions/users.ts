import { getAuth } from "firebase-admin/auth";
import logger from "../../configs/logger";

const getEmailByUserId = (user: string): Promise<string> => {
  return getAuth()
    .getUser(user)
    .then((userRecord) => {
      // Log user data for debugging

      return userRecord.email ?? ""; // Return the user's email
    })
    .catch((error) => {
      logger.log("Error fetching user data:", error);
      throw error; // Return a default value or handle as needed
    });
};
export { getEmailByUserId };
