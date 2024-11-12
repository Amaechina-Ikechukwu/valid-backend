import { Router } from "express";
import { improveGroupPurpose } from "../actions/ai";

const aiRouter = Router();
aiRouter.post("/refine", async (req, res) => {
  try {
    const { purpose } = req.body;
    const response = await improveGroupPurpose(purpose);
    res.status(200).json({ message: "Refined successfully", data: response });
  } catch (error) {
    res.status(500).json({ message: "Error getting refined purpose" });
  }
});
export default aiRouter;
