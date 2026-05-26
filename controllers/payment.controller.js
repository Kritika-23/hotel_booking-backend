import Stripe from "stripe";
import Booking from "../models/booking.model.js";
import transporter from "../config/nodemailer.js";
import { generateInvoicePDF } from "../utils/generateInvoice.js";
import dotenv from "dotenv";
dotenv.config();


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

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

      success_url: `${clientUrl}/success?bookingId=${bookingId}`,

      cancel_url: `${clientUrl}/cancel`,
    });

    res.json({ url: session.url });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    console.log("REQ BODY:", req.body);

    // 1. Get booking
    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate("hotel")
      .populate("room");

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found",
      });
    }

    // 2. Prevent double payment
    if (booking.isPaid) {
      return res.json({
        success: true,
        message: "Already paid",
      });
    }

    // 3. Update booking
    booking.isPaid = true;
    booking.status = "confirmed";
    await booking.save();

    console.log("BOOKING CONFIRMED:", booking._id);

    // 4. Generate invoice PDF
    const pdfBuffer = await generateInvoicePDF(booking);

    // 5. Send SINGLE email with attachment
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: booking.user.email,

      subject: "Invoice - Booking Confirmed | GlamourStays",

      html: `
        <div style="font-family:Arial;padding:20px;">
          <h1>GlamourStays Invoice</h1>
          <p><strong>Name:</strong> ${booking.user.name || "Guest"}</p>
          <p><strong>Email:</strong> ${booking.user.email}</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          <p><strong>Total:</strong> ₹${booking.totalPrice}</p>
          <h3>Status: PAID ✅</h3>
        </div>
      `,

      attachments: [
        {
          filename: `invoice-${booking._id}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log("📧 Invoice Email Sent");

    return res.json({
      success: true,
      message: "Payment verified successfully",
    });

  } catch (error) {
    console.log("ERROR:", error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};
