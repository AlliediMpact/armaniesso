import { NextRequest, NextResponse } from 'next/server';

interface ContactRequest {
  name: string;
  phone: string;
  message: string;
}

// Validate the request body
function validateContactRequest(body: unknown): body is ContactRequest {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const obj = body as Record<string, unknown>;

  return (
    typeof obj.name === 'string' &&
    obj.name.trim().length > 0 &&
    typeof obj.phone === 'string' &&
    obj.phone.trim().length > 0 &&
    typeof obj.message === 'string' &&
    obj.message.trim().length >= 10
  );
}

/**
 * POST /api/contact
 * Handle contact form submissions
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Only allow POST requests
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Parse the request body
    const body = await request.json();

    // Validate the request
    if (!validateContactRequest(body)) {
      return NextResponse.json(
        {
          error: 'Invalid request. Please provide name, phone, and message (min 10 characters).',
        },
        { status: 400 }
      );
    }

    const { name, phone, message } = body;

    // Here you would typically:
    // 1. Save to a database
    // 2. Send an email notification
    // 3. Integrate with a CRM or email service

    // For now, we'll just log and return success
    console.log('Contact form submission:', {
      name,
      phone,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement email sending service
    // Example with a service like SendGrid, Nodemailer, or AWS SES:
    // await sendEmailNotification({ name, phone, message });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message! We will contact you shortly.',
        data: {
          name,
          phone,
          receivedAt: new Date().toISOString(),
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
