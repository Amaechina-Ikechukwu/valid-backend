import { Router } from "express";
import verifyIDToken from "../../middilewares/verifyIDToken";

const usersRouter = Router();

usersRouter.get("/", verifyIDToken, (req, res) => {
  res.status(200).json({ data: req.user });
});
export default usersRouter;
