import express from "express";
import admin from "firebase-admin";
import usersRouter from "./src/controllers/users";
import contributionRouter from "./src/controllers/contributionroutes";

import morganMiddleware from "./configs/morgan";
import { transactionsRouter } from "./src/controllers/transactionsRouter";
var serviceAccount = require("./xx.json");

const app = express();
const port = process.env.PORT;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});
app.use(morganMiddleware);
app.use(express.json());
app.use("/user", usersRouter);
app.use("/contributions", contributionRouter);
app.use("/transactions", transactionsRouter);
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
