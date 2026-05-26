import express from "express";

import {
  makePayment,
  verifyPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", makePayment);

router.post("/verify-payment", verifyPayment);

export default router;