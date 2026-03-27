import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // TODO: Wire up to an email service (e.g. Resend, EmailJS, Nodemailer)
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: "Portfolio <noreply@dupenodi.dev>",
    //   to: "hi@dupenodi.dev",
    //   subject: `New message from ${name}`,
    //   text: `From: ${email}\n\n${message}`,
    // });

    console.log("[Contact]", { name, email, message });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
