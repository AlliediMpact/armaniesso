import { NextRequest, NextResponse } from 'next/server';
import { sendContactConfirmationEmail, sendAdminContactNotificationEmail } from '@/lib/mailer';
import { ContactFormSchema, validateRequest, errorResponse } from '@/lib/validation-schemas';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

/**
 * POST /api/contact
 * Handle contact form submissions
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = validateRequest(ContactFormSchema, body);

    if (!validation.valid) {
      return NextResponse.json(errorResponse(validation.errors), { status: 400 });
    }

    const { name, phone, email, message } = validation.data;
    const receivedAt = new Date().toISOString();

    // Send confirmation email to customer (if email provided)
    if (email) {
      try {
        await sendContactConfirmationEmail({
          to: email,
          name,
        });
      } catch (err) {
        console.error('Failed to send confirmation email:', err);
      }
    }

    // Send notification to admin
    try {
      await sendAdminContactNotificationEmail({
        name,
        phone,
        email,
        message,
        receivedAt,
      });
    } catch (err) {
      console.error('Failed to send admin notification:', err);
    }

    // Save to Firestore for CRM/follow-up
    try {
      const app = getFirebaseAdminApp();
      if (app) {
        const db = getFirestore(app);
        await db.collection('inquiries').add({
          name,
          phone,
          email: email || null,
          message,
          createdAt: new Date(),
          status: 'new',
          responded: false,
        });
      }
    } catch (err) {
      console.error('Failed to save inquiry:', err);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message! We will contact you shortly.',
        data: {
          name,
          phone,
          receivedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process your request. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
