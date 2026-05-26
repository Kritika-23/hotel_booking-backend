import Stripe from "stripe";
import Booking from "../models/booking.model.js";
import transporter from "../config/nodemailer.js";
import { generateInvoicePDF } from "../utils/generateInvoice.js";
import { invoiceTemplate } from "../utils/invoiceTemplate.js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const liveClientUrl = "https://hotel-booking-app-mnxk.vercel.app";
const rawClientUrl = process.env.CLIENT_URL || liveClientUrl;
const isRailway =
  process.env.RAILWAY_ENVIRONMENT ||
  process.env.RAILWAY_PROJECT_ID ||
  process.env.RAILWAY_SERVICE_ID ||
  process.env.RAILWAY_PUBLIC_DOMAIN;
const clientUrl = (
  isRailway && rawClientUrl.includes("localhost")
    ? liveClientUrl
    : rawClientUrl
).replace(/\/+$/, "");

const sendInvoiceEmail = async (booking) => {
  if (!booking.user?.email) {
    throw new Error("User email not found for this booking");
  }

  booking.invoiceEmailLastAttemptAt = new Date();
  await booking.save();

  let pdfBuffer = null;

  try {
    pdfBuffer = await generateInvoicePDF(booking);
  } catch (error) {
    console.error("Invoice PDF generation failed:", error.message);
  }

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: booking.user.email,
    subject: "Invoice - Booking Confirmed | GlamourStays",
    html: invoiceTemplate(booking),
    attachments: pdfBuffer
      ? [
          {
            filename: `invoice-${booking._id}.pdf`,
            content: pdfBuffer,
          },
        ]
      : [],
  });

  booking.invoiceEmailSent = true;
  booking.invoiceEmailError = "";
  await booking.save();
};

const trySendInvoiceEmail = async (booking) => {
  try {
    await sendInvoiceEmail(booking);
    console.log("Invoice Email Sent");
    return true;
  } catch (error) {
    console.error("Invoice Email Failed:", error.message);
    booking.invoiceEmailError = error.message;
    booking.invoiceEmailLastAttemptAt = new Date();
    await booking.save();
    return false;
  }
};

export const stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature error:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        return res.json({ received: true });
      }

      const booking = await Booking.findById(bookingId)
        .populate("user")
        .populate("hotel")
        .populate("room");

      if (!booking) {
        return res.json({ received: true });
      }

      if (!booking.isPaid) {
        booking.isPaid = true;
        booking.status = "confirmed";
        await booking.save();
      }

      if (!booking.invoiceEmailSent) {
        await trySendInvoiceEmail(booking);
      }
    }

    return res.json({ received: true });

  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return res.status(500).json({
      received: false,
      message: error.message,
    });
  }
};

export const makePayment = async (req, res) => {
  try {
    const { roomName, price, bookingId } = req.body;

    console.log(req.body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: roomName,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        bookingId,
      },
      success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingId}`,
      cancel_url: `${clientUrl}/cancel`,
    });

    console.log("Stripe session created:", session);

    if (!session || !session.url) {
      console.error("Stripe session missing URL", session);
      return res.status(500).json({ message: "Failed to create Stripe session" });
    }

    res.json({ url: session.url });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { bookingId, sessionId } = req.body;

    console.log("REQ BODY:", req.body);

    let verifiedBookingId = bookingId;

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return res.json({
          success: false,
          message: "Payment not completed",
        });
      }

      verifiedBookingId = session.metadata?.bookingId || verifiedBookingId;
    }

    const booking = await Booking.findById(verifiedBookingId)
      .populate("user")
      .populate("hotel")
      .populate("room");

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.isPaid && booking.invoiceEmailSent) {
      return res.json({
        success: true,
        message: "Already paid and invoice already sent",
      });
    }

    if (!booking.isPaid) {
      booking.isPaid = true;
      booking.status = "confirmed";
      await booking.save();

      console.log("BOOKING CONFIRMED:", booking._id);
    }

    const invoiceSent = booking.invoiceEmailSent
      ? true
      : await trySendInvoiceEmail(booking);

    return res.json({
      success: true,
      invoiceSent,
      message: invoiceSent
        ? "Payment verified successfully"
        : "Payment verified, invoice email will be retried",
    });

  } catch (error) {
    console.log("ERROR:", error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};
