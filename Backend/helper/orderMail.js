const nodemailer = require('nodemailer');


exports.SendMail = async (recipientEmail, subject, htmlContent) => {
  try {

    const mail = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,  
      secure: true, 
      auth: {
        user: process.env.CRD_USER,
        pass: process.env.CRD_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });


    const mailOptions = {
      from: process.env.crd.user,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    };

    let info = await mail.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error(`Failed to send email: ${err}`);
    throw err;
  }
};
