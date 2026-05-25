const nodemailer = require('nodemailer');

async function main() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || user;
  const to = process.env.SMTP_TEST_TO || user;

  if (!host || !user || !pass) {
    console.error('SMTP environment variables are not set (SMTP_HOST/SMTP_USER/SMTP_PASS)');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Armani Esso SMTP test',
    text: 'This is a test email sent from the Armani Esso app to verify SMTP credentials.',
  });

  console.log('SMTP test email sent:', info.messageId || info.response);
}

main().catch((err) => {
  console.error('SMTP test failed', err);
  process.exit(1);
});
