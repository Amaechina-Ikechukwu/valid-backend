import express from "express";
import admin from "firebase-admin";
import usersRouter from "./src/controllers/users";
import contributionRouter from "./src/controllers/contributionroutes";

import morganMiddleware from "./configs/morgan";
import { transactionsRouter } from "./src/controllers/transactionsRouter";

const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const client = new SecretManagerServiceClient();

const app = express();
const port = process.env.PORT || 8080;
const getSecret = async () => {
  const [accessResponse] = await client.accessSecretVersion({
    name: "projects/989051447768/secrets/database/versions/latest",
  });
  const responsePayload = accessResponse.payload.data.toString("utf8");
  return responsePayload;
};
const database = await getSecret();
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: database,
});

app.use(morganMiddleware);
app.use(express.json());
app.use("/user", usersRouter);
app.use("/contributions", contributionRouter);
app.use("/transactions", transactionsRouter);
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
