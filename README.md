# Armani Esso — Premium Printing & Branding Solutions

## 🏢 Overview

**Armani Esso** is a premium printing and branding business based in South Africa, focused on delivering high-quality print products and professional branding services to individuals, startups, and established businesses.

The brand represents:
- Quality
- Reliability
- Professionalism
- Modern business identity

This project is the official website for Armani Esso, designed to attract clients, showcase services, and drive conversions through a premium digital experience.

---

## 🎯 Mission

To help businesses stand out through high-quality printing and impactful branding solutions that elevate their identity and presence.

---

## 💡 Vision

To become a trusted and recognizable printing and branding partner known for excellence, speed, and consistency.

---

## 🧑‍💼 About the Brand

Armani Esso is built on the idea that **presentation matters**. Whether it’s a business card, flyer, banner, or full branding package, every product must reflect professionalism and attention to detail.

The business focuses on:
- Clean, modern design
- Premium-quality print materials
- Fast turnaround times
- Customer-focused service

---

## 🛠️ Services

The website should clearly present the following services:

- Business Cards
- Flyers & Posters
- Banners & Large Format Printing
- Branding & Logo Design
- Custom Printing Solutions

---

## 🎨 Design Philosophy

This website must feel **premium, modern, and clean**.

### Visual Style:
- Dark theme (luxury feel)
- Gold accents (#D4AF37) to represent premium quality
- Clean white/gray typography
- Spacious layout with strong hierarchy

### User Experience:
- Smooth animations
- Clear call-to-actions
- Mobile-first responsive design
- Fast and simple navigation

---

## 📞 Contact Information

- **Phone / WhatsApp:** +27 61 543 6379  
- **Primary CTA:** WhatsApp chat integration  
- Link: https://wa.me/27615436379  

---

## 🧱 Technical Stack

This project uses modern web technologies:

- **Next.js (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion (animations)**

---

## 📁 Project Structure

## Payments, Webhooks, and Email Setup

Create a `.env.local` file with the following values:

```env
# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
PAYSTACK_CALLBACK_URL=http://localhost:3000/order-confirmation
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SMTP (Nodemailer)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=no-reply@armaniesso.co.za
```

### Webhook Verification (Paystack)

The endpoint `POST /api/paystack/webhook`:

- Verifies `x-paystack-signature` using HMAC SHA512 and your `PAYSTACK_SECRET_KEY`.
- Marks matched orders as `paid` on `charge.success`/`charge.completed`.
- Marks matched orders as `cancelled` on `charge.failed`/`charge.abandoned`.
- Sends payment confirmation email when customer email is available.

### Local Webhook Test (Dev Server Running)

```powershell
$env:PAYSTACK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxx"
$env:APP_URL="http://localhost:3000"
node scripts/test-paystack-webhook-http.js
```

### EFT Email Notifications

When `POST /api/eft-order` is called:

- Order is persisted to `data/orders.json`.
- EFT instructions are emailed via Nodemailer (when SMTP env vars are configured).

