import express from "express";
import admin from "firebase-admin";
import usersRouter from "./src/controllers/users";
import contributionRouter from "./src/controllers/contributionroutes";
var serviceAccount = require("./xx.json");
const app = express();
const port = process.env.PORT || 3008;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});
app.use(express.json());
app.use("/user", usersRouter);
app.use("/contribution", contributionRouter);
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
