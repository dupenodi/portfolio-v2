import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      // Dev fallback — log to console if no key set
      console.log("[Contact form — no RESEND_API_KEY set]", { name, email, message });
      return NextResponse.json({ success: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>", // change to hi@dupenodi.dev once domain is verified
      to: process.env.CONTACT_EMAIL ?? "sarath.dpudi@gmail.com",
      replyTo: email,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <br/>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    if (error) {
      console.error("[Resend error]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[Resend sent]", data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Contact]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
