
const sendAccountCreateGreetWhatsapp = () => {
  const client = require('twilio')(process.env.TIWILIO_ID, process.env.TIWILIO_);
  client.messages.create({
    body: "Message is sent",
    from: "whatsapp:+14155238886",
    to: "whatsapp:+917876811753",
  })
}

module.exports = { sendAccountCreateGreetWhatsapp }; 