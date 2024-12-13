import { Router } from "express";

import type { BodyContributionData, CustomRequest } from "../../types/types";
import {
  addCurrencyToData,
  checkIfGroupNameExists,
  createContribution,
  getGroupInfo,
  getUsersContributionGroups,
} from "../actions/contribution";
import verifyIDToken from "../../middilewares/verifyIDToken";
import { uuidv7 } from "uuidv7";
import { Timestamp } from "firebase-admin/firestore";
import { ServerValue } from "firebase-admin/database";
import {
  approveWithdrawalAdmin,
  initiateGroupWithdrawalProcess,
} from "../actions/grouptransactions";

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
        currency: "NGN",
      };
      const response = await createContribution(newData);

      res.status(201).json({ message: response });
    } catch (error) {
      res.status(500).json({ message: "Error creating contribution" });
    }
  }
);

contributionRouter.get("/:name", async (req, res) => {
  try {
    const name = req.params.name;
    const response = await getGroupInfo(name);

    res
      .status(200)
      .json({ message: "Group successfully retrieved", data: response });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating contribution" });
  }
});
contributionRouter.post("/checkgroupname", async (req, res) => {
  try {
    const { name } = req.body;

    const response = await checkIfGroupNameExists(name);
    res
      .status(200)
      .json({ message: "Group successfully retrieved", data: response });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating contribution" });
  }
});
contributionRouter.put(
  "/adminwithdrawal/:id",
  verifyIDToken,
  async (req: CustomRequest, res) => {
    try {
      const id = req.params.id;
      const response = await initiateGroupWithdrawalProcess(id, req.user);
      res.status(200).json({
        message:
          "Withdrawal process initiated. Please notify participants of approve your request",
        data: response,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating contribution" });
    }
  }
);
contributionRouter.put(
  "/approvewithdrawal/:id",
  verifyIDToken,
  async (req: CustomRequest, res) => {
    try {
      const id = req.params.id;
      const response = await approveWithdrawalAdmin(id, req.user);
      res.status(200).json({
        message:
          "You have approved the withdrawal of this fund. Once other participants have approved the admin (creator of the group) will be able to withdraw this fund.",
        data: response,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating contribution" });
    }
  }
);
contributionRouter.put("/updatecurrency", async (req: CustomRequest, res) => {
  try {
    const id = req.params.id;
    await addCurrencyToData();
    res.status(200).json({
      message: "Currency added to database.",
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error added data to database" });
  }
});

export default contributionRouter;
