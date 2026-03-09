import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ShopifyClient } from "@/integrations/shopify/client";

/**
 * GET: Initiate Shopify OAuth
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  const shop = req.nextUrl.searchParams.get("shop");
  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/shopify/connect`;
  const scopes = process.env.SHOPIFY_SCOPES ?? "read_products,read_orders,read_customers";
  const state = Buffer.from(JSON.stringify({ userId: session.user.id })).toString("base64");

  const authUrl =
    `https://${shop}/admin/oauth/authorize?` +
    `client_id=${process.env.SHOPIFY_API_KEY}` +
    `&scope=${scopes}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}`;

  return NextResponse.redirect(authUrl);
}

/**
 * POST: Handle Shopify OAuth callback (exchange code for token)
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { shop, code } = await req.json();

  if (!shop || !code) {
    return NextResponse.json({ error: "Missing shop or code" }, { status: 400 });
  }

  // Exchange code for access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
  }

  const { access_token } = await tokenRes.json();

  // Save store connection
  const store = await db.store.upsert({
    where: { shopDomain: shop },
    create: {
      userId: session.user.id,
      shopDomain: shop,
      accessToken: access_token,
      name: shop.replace(".myshopify.com", ""),
    },
    update: {
      accessToken: access_token,
    },
  });

  // Sync products in background
  const client = new ShopifyClient(shop, access_token);
  client.syncProducts(store.id).catch(console.error);

  return NextResponse.json({ storeId: store.id, shop });
}
