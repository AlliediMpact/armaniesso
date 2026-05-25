# Vercel Deployment Guide

## Pre-Deployment Checklist

✅ **Secrets Protection**
- `.env.local` is in `.gitignore` and will NOT be committed
- `secrets/` folder is in `.gitignore` and will NOT be committed
- Firebase Admin credentials stored securely in Vercel Environment Variables
- No hardcoded secrets in source code

✅ **Environment Variables**
- All required environment variables documented in `.env.example`
- `.env.example` is committed for reference (contains no actual secrets)
- `vercel.json` configured with environment variable references

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Link Project to Vercel
```bash
vercel link
# Select "Armani Esso Premium" or create new project
```

### 3. Set Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add the following (values from your `.env.local`):

**Production Variables:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `NEXT_PUBLIC_APP_URL=https://www.armaniesso.co.za` (or your production domain)
- `NEXT_PUBLIC_ADMIN_EMAILS` (comma-separated)
- `PAYSTACK_SECRET_KEY` (production key)
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (must be properly formatted with literal `\n`)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_USE_FIRESTORE_ORDERS=true`
- `ADMIN_EMAILS=admin@armaniesso.co.za`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`

### 4. Deploy
```bash
vercel --prod
```

### 5. Verify Deployment
- Check build logs in Vercel Dashboard
- Test critical endpoints:
  - `GET /api/products` (public)
  - `GET /api/account/profile` (auth required)
  - `POST /api/contact` (form submission)
  - `POST /api/paystack/webhook` (payment callback)

## Important Notes

### Firebase Private Key Formatting
The `FIREBASE_PRIVATE_KEY` environment variable must include literal `\n` characters:

**Example value:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCr...\n-----END PRIVATE KEY-----\n
```

**In Vercel UI:**
- Paste the entire key with `\n` as shown
- Do NOT convert `\n` to actual newlines
- Vercel will handle the escaping automatically

### Production Domain Setup
1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Configure custom domain in Vercel Dashboard
3. Update Paystack webhook callback URL in Paystack Dashboard
4. Update Firebase authorized domains in Firebase Console

### Monitoring
- Enable Analytics in Vercel Dashboard
- Monitor errors in Vercel Logs
- Set up alerts for failed deployments
- Check Firebase metrics in Firebase Console

## Rollback
If deployment fails:
```bash
vercel --prod --token YOUR_TOKEN  # Rollback to previous version
```

Or use Vercel Dashboard → Deployments → Select Previous → Promote to Production

## CI/CD with GitHub

1. Connect GitHub repository in Vercel Dashboard
2. Set deployment triggers (main branch)
3. Vercel will automatically deploy on git push
4. Environment variables auto-loaded from Vercel project settings

## Troubleshooting

**"Firebase authentication failed"**
- Check `FIREBASE_PRIVATE_KEY` format includes literal `\n`
- Verify all Firebase environment variables are set
- Check Firebase Admin SDK is installed: `npm ls firebase-admin`

**"Paystack webhook not working"**
- Update webhook URL in Paystack Dashboard to Vercel deployment URL
- Check webhook secret is correct
- Review logs: Vercel Dashboard → Functions

**"Emails not sending"**
- Verify SMTP credentials in environment variables
- Check email from address matches SMTP account
- Review SMTP server logs for authentication errors

**Build failures**
- Check build logs in Vercel Dashboard
- Run `npm run build` locally to replicate
- Ensure TypeScript compilation passes: `npm run build`
