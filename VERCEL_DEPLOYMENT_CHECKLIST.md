# Vercel Deployment Security & Readiness Checklist

## ✅ Security Verification

### Secrets Protection
- [x] `.env.local` is in `.gitignore` (will NOT be committed)
- [x] `secrets/` folder is in `.gitignore` (will NOT be committed)
- [x] `.env.example` created with placeholder values for documentation
- [x] No hardcoded secrets in source code (verified with grep search)
- [x] Firebase Admin SDK credentials only in environment variables
- [x] Paystack keys only in environment variables
- [x] SMTP credentials only in environment variables

### Build & Compilation
- [ ] `npm run build` completes successfully (in progress)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All dependencies installed and up-to-date

### Environment Configuration
- [x] `vercel.json` configured with environment variable references
- [x] `.vercelignore` configured to exclude sensitive files
- [x] All required environment variables documented
- [x] Firebase Private Key formatting documented for Vercel UI

## 🚀 Deployment Prerequisites

### Required Environment Variables (Set in Vercel Dashboard)

**Firebase Configuration:**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
FIREBASE_PROJECT_ID
FIREBASE_USE_FIRESTORE_ORDERS=true
```

**Payment Gateway (Paystack):**
```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
PAYSTACK_SECRET_KEY
```

**Application Settings:**
```
NEXT_PUBLIC_APP_URL=https://www.armaniesso.co.za
NEXT_PUBLIC_ADMIN_EMAILS=admin@armaniesso.co.za
ADMIN_EMAILS=admin@armaniesso.co.za
```

**Email Configuration:**
```
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
EMAIL_FROM
```

## 📋 Pre-Deployment Checklist

- [ ] All tests passing: `npm run build`
- [ ] No console errors or warnings in local dev
- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] Project linked to Vercel: `vercel link`
- [ ] All environment variables added to Vercel Dashboard
- [ ] Firebase Private Key properly formatted (literal `\n` characters)
- [ ] Production domain configured in Vercel
- [ ] Paystack production keys obtained and configured
- [ ] SMTP credentials verified and tested
- [ ] Firebase authorized domains updated
- [ ] Firestore indexes created (if needed)

## 🔐 Critical Security Notes

### Firebase Private Key Formatting
**INCORRECT (will fail):**
```
-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCr...
-----END PRIVATE KEY-----
```

**CORRECT (literal \n):**
```
-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCr...\n-----END PRIVATE KEY-----\n
```

The Vercel UI will handle escaping automatically when you paste the entire value.

### What Gets Deployed
✅ Source code (app/, components/, lib/, public/, pages/)
✅ Configuration files (next.config.js, tsconfig.json, tailwind.config.js, package.json)
✅ Build artifacts (.next/)

❌ Environment variables (stored in Vercel project settings)
❌ Local .env files
❌ Secrets folder
❌ Node modules (rebuilt fresh on Vercel)

### What Does NOT Get Deployed
- `.env.local` and all .env files
- `secrets/` folder (Firebase admin key)
- `node_modules/` (rebuilt fresh)
- Documentation files marked in `.vercelignore`

## 🚀 Deployment Command
```bash
# Login to Vercel (one time)
vercel login

# Link project to Vercel (one time)
vercel link

# Deploy to production
vercel --prod
```

## ✅ Post-Deployment Verification

After deploying to Vercel:

1. **Check Deployment Status**
   - Vercel Dashboard shows green checkmark
   - All checks passed

2. **Test Public Endpoints**
   ```bash
   curl https://www.armaniesso.co.za/api/products
   curl https://www.armaniesso.co.za/api/products/[productId]
   ```

3. **Test Contact Form**
   - Submit test form on `/contact`
   - Verify email received

4. **Test Payment Integration**
   - Test Paystack redirect on checkout page
   - Verify webhook receives callback

5. **Check Logs**
   - Vercel Dashboard → Deployments → View Logs
   - Firebase Console → Cloud Firestore → Operations
   - Email delivery logs (SMTP)

## 🔄 Continuous Deployment

If connected to GitHub:
1. Commits to `main` branch trigger automatic deployments
2. Environment variables auto-loaded from Vercel project
3. Failed deployments show in GitHub PR checks

## 🆘 Troubleshooting

### Build Fails in Vercel
1. Check build logs in Vercel Dashboard
2. Run `npm run build` locally
3. Verify all environment variables are set in Vercel
4. Common issues:
   - Missing FIREBASE_PRIVATE_KEY
   - Incorrect newline formatting in FIREBASE_PRIVATE_KEY
   - Missing Node modules or dependencies

### Firebase Authentication Fails
1. Verify FIREBASE_PRIVATE_KEY is properly formatted
2. Verify FIREBASE_CLIENT_EMAIL matches key file
3. Check Firebase project allows admin SDK access
4. Enable "Cloud Firestore Database" in Firebase Console

### Emails Not Sending
1. Verify SMTP credentials in Vercel
2. Check SMTP_PORT is correct (465 for SSL, 587 for TLS)
3. Verify EMAIL_FROM matches SMTP account
4. Check SMTP server allows authentication

### Paystack Webhook Fails
1. Update webhook URL in Paystack Dashboard
2. Verify Paystack keys are production keys (not test)
3. Check webhook secret matches
4. Review Vercel Function logs for errors

## 📞 Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Paystack Docs:** https://paystack.com/developers/api

---

**Last Updated:** May 25, 2026
**Status:** Ready for Deployment ✅
