

// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";
// import { connectDB } from "./config/connectDB.js";
// import "./cron/bookingExpiry.js";
// import { clerkMiddleware } from "@clerk/express";
// import { getAuth } from "@clerk/express";


// import userRouter from "./routes/user.routes.js";
// import hotelRouter from "./routes/hotel.routes.js";
// import roomRouter from "./routes/room.routes.js";
// import bookingRouter from "./routes/booking.routes.js";
// import searchRouter from "./routes/search.routes.js";
// dotenv.config();
// // console.log("SIGN SECRET:", env.JWT_SECRET);
// const app = express();

// // Database connection
// connectDB();




// app.use(cors({
//   origin: ["http://localhost:5173", "http://localhost:5174"],
//   credentials: true
// }));

// app.use(express.json());
// app.use(cookieParser());

// app.use(clerkMiddleware());

// // Test route
// app.get("/", (req, res) => {
//   res.send("Hello World from server");
// });
// // ✅ ADD HERE
// app.get("/protected", (req, res) => {
//   const { userId } = getAuth(req);

//   if (!userId) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized",
//     });
//   }

//   res.json({
//     success: true,
//     userId,
//   });
// });

// // Static folder for image uploads

// //app.use("/images", express.static("uploads"));

// //app.use("/images", express.static("uploads/images"));

// //app.use("/uploads", express.static("uploads"));


// //app.use("/images", express.static(path.join(process.cwd(), "uploads")));
// //app.use("/images", express.static("uploads"));

// app.use("/uploads", express.static("uploads"));
// app.use("/images", express.static("uploads")); 





// // API routes

// app.use("/api/user", userRouter);
// app.use("/api/hotel", hotelRouter);
// app.use("/api/rooms", roomRouter);
// app.use("/api/bookings", bookingRouter);
// app.use("/api/search", searchRouter);

// // Port configuration
// const PORT = env.PORT || 4000;

// // ✅ Fix: Use template literals correctly inside console.log
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/connectDB.js";
import "./cron/bookingExpiry.js";
import { clerkMiddleware } from "@clerk/express";
import { getAuth } from "@clerk/express";

// Routes
import userRouter from "./routes/user.routes.js";
import hotelRouter from "./routes/hotel.routes.js";
import roomRouter from "./routes/room.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import searchRouter from "./routes/search.routes.js";
import paymentRouter from "./routes/payment.routes.js";

dotenv.config();

const app = express();

// DB connection
connectDB();

// FIX: __dirname setup (IMPORTANT for images)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://hotel-booking-app-mnxk-24hu1z59a-kritika-23s-projects.vercel.app"],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(clerkMiddleware());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Hello World from server");
});

// Protected route
app.get("/protected", (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  res.json({
    success: true,
    userId,
  });
});

// ========================
// STATIC FILES (FIXED)
// ========================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========================
// API ROUTES
// ========================
app.use("/api/user", userRouter);
app.use("/api/hotel", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/search", searchRouter);
app.use("/api/payment", paymentRouter);
// PORT
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});