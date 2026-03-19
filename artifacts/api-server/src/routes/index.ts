import { Router, type IRouter } from "express";
import healthRouter from "./health";
import modelsRouter from "./models";
import authRouter from "./auth";
import subscriptionRouter from "./subscription";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/models", modelsRouter);
router.use("/subscription", subscriptionRouter);

export default router;
