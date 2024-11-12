// In an Express-like app:
import { Router } from "express";
import type { FlutterWaveWebhookEvent } from "../../configs/types";
import {
  checkIfEventAsBeenRecieved,
  verifyFlutterWebhook,
} from "../actions/transactions";
import { getGroupTransactionsDetails } from "../actions/grouptransactions";
import verifyIDToken from "../../middilewares/verifyIDToken";

const transactionsRouter = Router();
transactionsRouter.post("/flw-webhook", async (req, res) => {
  // If you specified a secret hash, check for the signature
  const secretHash = process.env.FLW_SECRET_HASH;
  const signature = req.headers["verif-hash"];
  if (!signature || signature !== secretHash) {
    // This request isn't from Flutterwave; discard
    res.status(401).end();
  } else {
    const payload: FlutterWaveWebhookEvent = req.body;
    const result = await verifyFlutterWebhook(
      payload.id,
      payload.amount,
      payload.currency
    );
    if (result == true) {
      const checked = await checkIfEventAsBeenRecieved(payload);
    } else {
      res.status(422).end();
    }
    res.status(200).end();
  }
});

transactionsRouter.get("/group/:id", verifyIDToken, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await getGroupTransactionsDetails(id);
    res
      .status(200)
      .json({ message: "Transactions retrieved succefully", data: result });
  } catch (error) {
    res
      .status(500)
      .json("Could not retrieve transactions at the moment : " + error);
  }
});

export { transactionsRouter };
