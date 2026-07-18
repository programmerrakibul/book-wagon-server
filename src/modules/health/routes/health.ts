import { healthCheck } from "@/health/controller/health.js";
import { Router } from "express";

const router = Router();

router.get("/", healthCheck);

export default router;
