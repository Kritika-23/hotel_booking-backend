export const invoiceTemplate = (booking) => {
  return `
  <html>
  <head>
    <style>
      body {
        font-family: Arial;
        background: #fff;
        padding: 40px;
        color: #111;
      }

      .header {
        display: flex;
        justify-content: space-between;
        border-bottom: 2px solid #eee;
        padding-bottom: 20px;
      }

      .logoBox {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .logo {
        width: 55px;
        height: 55px;
        border-radius: 16px;
        background: linear-gradient(135deg,#9d72d4,#8458b3,#6d3fa0);
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-size:26px;
        font-weight:bold;
      }

      h1 {
        margin: 0;
        font-size: 26px;
      }

      .tag {
        font-size: 10px;
        letter-spacing: 3px;
        color: gray;
      }

      .invoiceTitle {
        text-align: right;
      }

      .hotelImg {
        width: 100%;
        height: 280px;
        object-fit: cover;
        border-radius: 20px;
        margin-top: 20px;
      }

      .grid {
        display: flex;
        justify-content: space-between;
        margin-top: 30px;
      }

      .box {
        width: 45%;
        line-height: 1.8;
      }

      .total {
        margin-top: 30px;
        padding: 20px;
        background: #f5f0ff;
        display: flex;
        justify-content: space-between;
        border-radius: 16px;
      }

      .footer {
        text-align: center;
        margin-top: 40px;
        color: gray;
      }

    </style>
  </head>

  <body>

    <!-- HEADER -->
    <div class="header">

      <div class="logoBox">
        <div class="logo">G</div>
        <div>
          <h1>Glamour <span style="color:#8458b3">Stays</span></h1>
          <div class="tag">Luxury Hotel Booking</div>
        </div>
      </div>

      <div class="invoiceTitle">
        <h2>INVOICE</h2>
        <p>${new Date().toLocaleDateString()}</p>
      </div>

    </div>

    <!-- IMAGE -->
    ${
      booking.hotel?.images?.[0]
        ? `<img class="hotelImg" src="http://localhost:4000${booking.hotel.images[0]}" />`
        : ""
    }

    <!-- DETAILS -->
    <!-- DETAILS -->
<div class="grid">

<div class="box">

  <p><b>User Name:</b> ${booking.user?.name?.trim() || booking.user?.email?.split("@")[0] || "User"}</p>

  <p><b>Email:</b> ${booking.user?.email || "N/A"}</p>

  <p><b>Hotel:</b> ${booking.hotel?.hotelName}</p>
  <p><b>Room:</b> ${booking.room?.roomType}</p>
  <p><b>Guests:</b> ${booking.persons}</p>

</div>

  <div class="box" style="text-align:right">
    <p><b>Check-in:</b> ${new Date(booking.checkIn).toLocaleDateString()}</p>
    <p><b>Check-out:</b> ${new Date(booking.checkOut).toLocaleDateString()}</p>
    <p><b>Status:</b> ${booking.status}</p>
  </div>

</div>

    <!-- TOTAL -->
    <div class="total">
      <h2>Total Amount</h2>
      <h1 style="color:#8458b3">₹${booking.totalPrice}</h1>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p>Thank you for booking with GlamourStays ✨</p>
    </div>

  </body>
  </html>
  `;
};
