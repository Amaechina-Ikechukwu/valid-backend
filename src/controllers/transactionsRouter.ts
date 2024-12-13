// In an Express-like app:
import { Router, type Request, type Response } from "express";
import type {
  AccountDetailsResponse,
  FlutterWaveWebhookEvent,
} from "../../types/types";
import {
  checkIfEventAsBeenRecieved,
  getNigerianBanks,
  getTransferFee,
  makeTransferRequest,
  verifyFlutterWebhook,
  verifyTransferBankAccount,
} from "../actions/transactions";
import { getGroupTransactionsDetails } from "../actions/grouptransactions";
import verifyIDToken from "../../middilewares/verifyIDToken";
import { validateBodyParams } from "../../middilewares/validateBodyParams";
import validateQueryParams from "../../middilewares/validateQueryParams";
import { randomBytes } from "crypto";
import type { TransferRequestResponse } from "../../types/transactiontypes";

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

transactionsRouter.get(
  "/group/:id/verifyaccount",
  verifyIDToken,
  validateQueryParams(["account_number", "account_bank"]),
  async (req: Request<{}, any, AccountDetailsResponse>, res: Response) => {
    try {
      const { account_number, account_bank } = req.query;
      const body = { account_number, account_bank };
      const result = await verifyTransferBankAccount(body);
      res.status(200).json({ ...result });
    } catch (error) {
      res.status(500).json({
        error: "Could not verify account",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);
transactionsRouter.get(
  "/group/:id/gettransferfee",
  verifyIDToken,
  validateQueryParams(["amount", "currency"]),
  async (req: any, res: any) => {
    try {
      const { amount, currency } = req.query; // Extract query parameters.
      const { id } = req.params; // Extract route parameter (group ID).

      const payload = { amount, currency };

      const result = await getTransferFee(payload);

      res.status(200).json({ ...result });
    } catch (error) {
      res.status(500).json({
        error: "Could not verify account",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

transactionsRouter.post(
  "/group/:id/transferrequest",
  verifyIDToken,
  validateBodyParams([
    "account_bank",
    "account_number",
    "amount",
    "currency",
    "narration",
    "debit_currency",
  ]),
  async (req: Request, res: Response) => {
    try {
      const {
        account_bank,
        account_number,
        amount,
        currency,
        narration,
        debit_currency,
      } = req.body;
      const { id } = req.params; // Extract group ID

      // Generate a unique reference for the transfer
      const reference = generateUniqueReference();

      // Prepare the payload for Flutterwave
      const payload = {
        account_bank, // Bank code
        account_number, // Account number
        amount, // Amount to transfer
        narration, // Narration for the transfer
        currency, // Currency for the transfer
        reference, // Generated unique reference
        callback_url: "https://www.your-callback-url.com", // Replace with your actual callback URL
        debit_currency, // Debit currency
      };

      // Initiate the transfer using Flutterwave
      const result: TransferRequestResponse = await makeTransferRequest(
        payload
      );
      res.status(200).json({
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while initiating the transfer",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);
transactionsRouter.get(
  "/group/:id/getbanks",
  verifyIDToken,
  async (req: any, res: any) => {
    try {
      const result = await getNigerianBanks();

      res.status(200).json({
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        error: "Could not verify account",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);
// Utility function to generate unique reference
const generateUniqueReference = (): string => {
  const prefix = "flutterwave-transfer";
  const uniqueId = randomBytes(6).toString("hex");
  return `${prefix}-${uniqueId}`;
};


export { transactionsRouter };
