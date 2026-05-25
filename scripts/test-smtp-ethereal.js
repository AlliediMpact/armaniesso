const nodemailer = require('nodemailer');

async function main() {
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: 'test@armaniesso.local',
    to: 'recipient@example.com',
    subject: 'Ethereal SMTP test',
    text: 'This is a test using Ethereal',
  });

  console.log('Message sent:', info.messageId);
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
