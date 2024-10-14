import express from "express";
import admin from "firebase-admin";
var serviceAccount = require("./xx.json");
const app = express();
const port = 8080;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://tangle-eede1-default-rtdb.firebaseio.com/",
});

app.get("/", (req, res) => {
  res.send("Hello Dear!");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
