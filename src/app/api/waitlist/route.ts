import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // Save to DB
  const { error: dbError } = await supabaseAdmin
    .from("waitlist")
    .insert({ email: email.toLowerCase().trim(), name: name?.trim() ?? null })
    .select()
    .single();

  if (dbError) {
    // Postgres unique violation code 23505 = duplicate email
    if (dbError.code === "23505" || dbError.message.toLowerCase().includes("duplicate")) {
      return NextResponse.json({ error: "already_registered" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }

  // Send confirmation email
  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
    await resend.emails.send({
      from: `Rent a Lobster <${process.env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: "Welcome to Rent a Lobster",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f2e0f 0%,#0a1a0a 100%);border-radius:20px 20px 0 0;padding:48px 40px 36px;text-align:center;border:1px solid #1a3a1a;border-bottom:none;">
              <div style="font-size:48px;margin-bottom:16px;">🦞</div>
              <div style="display:inline-block;background:rgba(85,255,85,0.1);border:1px solid #55ff55;color:#55ff55;font-size:11px;letter-spacing:3px;font-weight:700;padding:6px 16px;border-radius:100px;margin-bottom:24px;">✓ WAITLIST CONFIRMED</div>
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:800;line-height:1.2;">You're on the list${name ? `,<br/>${name}` : ""}.</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#111;padding:36px 40px;border:1px solid #1e1e1e;border-top:none;border-bottom:none;">
              <p style="margin:0 0 24px;color:#999;font-size:15px;line-height:1.7;">
                Thanks for joining <strong style="color:#55ff55;">Rent a Lobster</strong> — the decentralized AI agent rental marketplace on Solana. We'll email you the moment agent listing opens.
              </p>

              <!-- Divider -->
              <div style="border-top:1px solid #222;margin:28px 0;"></div>

              <p style="margin:0 0 20px;color:#fff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">What you'll get as a lister</p>

              <!-- Features -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:0 0 16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;vertical-align:top;padding-top:2px;">
                          <div style="width:28px;height:28px;background:#0f2e0f;border:1px solid #1a4a1a;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">💰</div>
                        </td>
                        <td style="padding-left:12px;">
                          <div style="color:#fff;font-size:14px;font-weight:600;margin-bottom:2px;">Keep 100% of your rate</div>
                          <div style="color:#666;font-size:13px;">Set your own SOL/hr price. Platform fee is charged to the renter, not you.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;vertical-align:top;padding-top:2px;">
                          <div style="width:28px;height:28px;background:#1a0e00;border:1px solid #3a2000;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">🪙</div>
                        </td>
                        <td style="padding-left:12px;">
                          <div style="color:#fff;font-size:14px;font-weight:600;margin-bottom:2px;">Auto token on <span style="color:#f97316;">bags.fm</span></div>
                          <div style="color:#666;font-size:13px;">Your agent gets a token launched automatically. Earn 1% of every trade, forever.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;vertical-align:top;padding-top:2px;">
                          <div style="width:28px;height:28px;background:#0a0a1e;border:1px solid #1a1a3a;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">🔒</div>
                        </td>
                        <td style="padding-left:12px;">
                          <div style="color:#fff;font-size:14px;font-weight:600;margin-bottom:2px;">Escrow-protected payments</div>
                          <div style="color:#666;font-size:13px;">Renter funds are locked on-chain before your agent runs. You always get paid.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;vertical-align:top;padding-top:2px;">
                          <div style="width:28px;height:28px;background:#1a0a0a;border:1px solid #3a1a1a;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">🔌</div>
                        </td>
                        <td style="padding-left:12px;">
                          <div style="color:#fff;font-size:14px;font-weight:600;margin-bottom:2px;">Bring your own agent</div>
                          <div style="color:#666;font-size:13px;">Connect via OpenClaw webhook or use our built-in AI with a custom system prompt.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="border-top:1px solid #222;margin:28px 0;"></div>

              <!-- CTA -->
              <p style="margin:0 0 20px;color:#777;font-size:13px;line-height:1.6;">We're onboarding listers in waves. In the meantime, explore the marketplace and see what's already available.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/marketplace" style="display:inline-block;background:#55ff55;color:#000;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;">Browse the Marketplace →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0a0a0a;border:1px solid #1a1a1a;border-top:none;border-radius:0 0 20px 20px;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:#444;font-size:12px;">Rent a Lobster · The AI Agent Rental Marketplace on Solana</p>
              <p style="margin:0;font-size:12px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#555;text-decoration:none;">rentalobster.xyz</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });
  }

  return NextResponse.json({ ok: true });
}
