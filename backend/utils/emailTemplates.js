const wrapper = (title, bodyHtml) => `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width:600px; margin:0 auto; background:#F7F5F2; padding:32px;">
    <div style="background:#14213D; padding:20px 28px; border-radius:8px 8px 0 0;">
      <h1 style="color:#F7F5F2; font-size:20px; letter-spacing:1px; margin:0;">AURELIA</h1>
    </div>
    <div style="background:#ffffff; padding:28px; border-radius:0 0 8px 8px; border:1px solid #eee; border-top:none;">
      <h2 style="color:#14213D; font-size:18px;">${title}</h2>
      ${bodyHtml}
    </div>
    <p style="text-align:center; color:#9CA3AF; font-size:12px; margin-top:16px;">
      &copy; ${new Date().getFullYear()} Aurelia Store. All rights reserved.
    </p>
  </div>
`;

export const welcomeEmail = (name) =>
  wrapper(
    `Welcome, ${name}!`,
    `<p style="color:#374151; line-height:1.6;">Thanks for creating an account with Aurelia. Explore curated products, track your orders, and enjoy a seamless shopping experience.</p>`
  );

export const orderConfirmationEmail = (order) => {
  const itemsRows = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:8px; border-bottom:1px solid #eee;">${item.quantity}</td>
        <td style="padding:8px; border-bottom:1px solid #eee;">₹${item.price}</td>
      </tr>`
    )
    .join("");

  return wrapper(
    "Order Confirmed",
    `
    <p style="color:#374151; line-height:1.6;">Hi ${order.shippingAddress.fullName}, your order <b>#${order._id}</b> has been confirmed.</p>
    <table style="width:100%; border-collapse:collapse; margin:16px 0;">
      <thead>
        <tr style="background:#F7F5F2;">
          <th style="padding:8px; text-align:left;">Item</th>
          <th style="padding:8px; text-align:left;">Qty</th>
          <th style="padding:8px; text-align:left;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <p style="color:#14213D; font-weight:bold;">Total: ₹${order.totalPrice}</p>
    <p style="color:#374151;">We will notify you when your order ships.</p>
    `
  );
};

export const orderStatusEmail = (order) =>
  wrapper(
    `Order Update: ${order.orderStatus}`,
    `<p style="color:#374151; line-height:1.6;">Your order <b>#${order._id}</b> status has been updated to <b>${order.orderStatus}</b>.</p>`
  );

export const passwordResetEmail = (resetUrl) =>
  wrapper(
    "Reset Your Password",
    `<p style="color:#374151; line-height:1.6;">Click the button below to reset your password. This link expires in 30 minutes.</p>
     <a href="${resetUrl}" style="display:inline-block; margin-top:12px; background:#C9A227; color:#14213D; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">Reset Password</a>`
  );
