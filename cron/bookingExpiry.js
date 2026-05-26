// import cron from "node-cron";

// import Booking from "../models/booking.model.js";

// cron.schedule("*/1 * * * *", async () => {
//   const now = new Date();

//   await Booking.updateMany(
//     {
//       status: "pending",
//       isPaid: false,
//       expiresAt: { $lt: now },
//     },
//     { $set: { status: "cancelled" } }
//   );

//   /*console.log("Expired bookings checked...");*/
// });


import cron from "node-cron";
import Booking from "../models/booking.model.js";

cron.schedule("*/5 * * * *", async () => {
  try {
    const now = new Date();

    const result = await Booking.updateMany(
      {
        status: "pending",
        isPaid: false,
        expiresAt: { $lt: now },
      },
      { $set: { status: "cancelled" } }
    );

    
  } catch (error) {
    console.error("Cron error:", error.message);
  }
});