// const nodemailer = require('nodemailer');

// exports.SendGreetMail = async ({email,name,pno}) => {
//   try {

//     const mail = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.CRD_USER,
//         pass: process.env.CRD_PASS,
//       },
//       tls: {
//         rejectUnauthorized: false
//       }
//     });

//     const mailOptions = {
//       from: 'aman1249.be22@chitkara.edu.in',
//       to: email,
//       subject: 'THANK YOU FOR REGISTERING',
//       html: `Hello ${name}, I am Aryan. Your mobile number is ${pno}.`,
//     };

//     let info = await mail.sendMail(mailOptions);
//     return true;
//   } catch (err) {
//     console.error(`Failed to send email: ${err}`);
//     throw err;
//   }
// };



const nodemailer = require('nodemailer');

/**
 * Sends a welcome email with the user's password.
 * If email fails, it logs the error but does not throw,
 * allowing user creation to succeed.
 * 
 * @param {Object} param0
 * @param {string} param0.email - Recipient email
 * @param {string} param0.name - Recipient name
 * @param {string} param0.password - User password
 * @returns {boolean} true if email sent successfully, false if failed
 */
exports.sendPasswordMail = async ({ email, name, password }) => {
  try {
    // Create transporter using Gmail App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CRD_USER, // Your Gmail
        pass: process.env.CRD_PASS, // Gmail App Password
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.CRD_USER,  // Must match auth.user
      to: email,
      subject: 'Welcome to Profitex! Your Account Password',
      html: `
        <h3>Hello ${name},</h3>
        <p>Thank you for registering with Profitex.</p>
        <p>Your password is: <strong>${password}</strong></p>
        <p>Please keep it safe and do not share it with anyone.</p>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    return true; // Email sent successfully
  } catch (err) {
    console.error(`Failed to send password email to ${email}:`, err);
    return false; // Email failed, but user creation can continue
  }
};
