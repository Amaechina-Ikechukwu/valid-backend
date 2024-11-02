import { Router } from "express";

import type { BodyContributionData, CustomRequest } from "../../configs/types";
import {
  createContribution,
  getUsersContributionGroups,
} from "../actions/contribution";
import verifyIDToken from "../../middilewares/verifyIDToken";
import { uuidv7 } from "uuidv7";
import { Timestamp } from "firebase-admin/firestore";
import { ServerValue } from "firebase-admin/database";

const contributionRouter = Router();
contributionRouter.get("/", verifyIDToken, async (req: CustomRequest, res) => {
  try {
    const groupLists = await getUsersContributionGroups(req.user);
    res.status(200).json({
      messsage: "Contribution groups retrieved successfully",
      data: groupLists,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieveing contribution list" });
  }
});

contributionRouter.post(
  "/create",
  verifyIDToken,
  async (req: CustomRequest, res) => {
    try {
      const data = req.body;
      const uuid = uuidv7();
      const newData = {
        ...data,
        admin: req.user,
        participants: [],
        id: uuid,
        timestamp: ServerValue.TIMESTAMP,
      };
      const response = await createContribution(newData);

      res.status(201).json({ message: response });
    } catch (error) {
      res.status(500).json({ message: "Error creating contribution" });
    }
  }
);

export default contributionRouter;
