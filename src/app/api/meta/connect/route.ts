import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET: Initiate Meta OAuth flow
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/meta/callback`;
  const state = Buffer.from(JSON.stringify({ userId: session.user.id })).toString("base64");

  const authUrl =
    `https://www.facebook.com/v21.0/dialog/oauth?` +
    `client_id=${process.env.META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}` +
    `&scope=ads_management,ads_read,business_management`;

  return NextResponse.redirect(authUrl);
}

/**
 * POST: Exchange Meta code for access token and save ad account
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, accountId, accountName } = await req.json();

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/meta/callback`;

  // Exchange code for access token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `client_id=${process.env.META_APP_ID}` +
      `&client_secret=${process.env.META_APP_SECRET}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&code=${code}`
  );

  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
  }

  const { access_token, expires_in } = await tokenRes.json();

  // Exchange for long-lived token
  const longTokenRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${process.env.META_APP_ID}` +
      `&client_secret=${process.env.META_APP_SECRET}` +
      `&fb_exchange_token=${access_token}`
  );

  const longTokenData = await longTokenRes.json();
  const longLivedToken = longTokenData.access_token ?? access_token;
  const expiresAt = longTokenData.expires_in
    ? new Date(Date.now() + longTokenData.expires_in * 1000)
    : new Date(Date.now() + expires_in * 1000);

  // Save ad account
  const adAccount = await db.adAccount.upsert({
    where: {
      platform_accountId: { platform: "META", accountId: accountId ?? "pending" },
    },
    create: {
      userId: session.user.id,
      platform: "META",
      accountId: accountId ?? "pending",
      accountName: accountName ?? "Meta Ads Account",
      accessToken: longLivedToken,
      tokenExpiresAt: expiresAt,
    },
    update: {
      accessToken: longLivedToken,
      tokenExpiresAt: expiresAt,
    },
  });

  return NextResponse.json({ adAccountId: adAccount.id });
}
