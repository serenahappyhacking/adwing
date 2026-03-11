import { db } from "@/lib/db";

interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  product_type: string;
  vendor: string;
  tags: string;
  status: string;
  variants: Array<{
    price: string;
    compare_at_price: string | null;
  }>;
  images: Array<{ src: string }>;
}

interface ShopifyOrder {
  id: string;
  total_price: string;
  created_at: string;
  line_items: Array<{
    product_id: string;
    quantity: number;
    price: string;
  }>;
}

export class ShopifyClient {
  private shopDomain: string;
  private accessToken: string;

  constructor(shopDomain: string, accessToken: string) {
    this.shopDomain = shopDomain;
    this.accessToken = accessToken;
  }

  static async fromStoreId(storeId: string): Promise<ShopifyClient> {
    const store = await db.store.findUniqueOrThrow({ where: { id: storeId } });
    return new ShopifyClient(store.shopDomain, store.accessToken);
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `https://${this.shopDomain}/admin/api/2024-10${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "X-Shopify-Access-Token": this.accessToken,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`Shopify API error: ${res.status} ${await res.text()}`);
    }

    return res.json();
  }

  async getProducts(limit = 250): Promise<ShopifyProduct[]> {
    const data = await this.request<{ products: ShopifyProduct[] }>(
      `/products.json?limit=${limit}&status=active`
    );
    return data.products;
  }

  async getOrders(days = 90, limit = 250): Promise<ShopifyOrder[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const data = await this.request<{ orders: ShopifyOrder[] }>(
      `/orders.json?limit=${limit}&created_at_min=${since.toISOString()}&status=any`
    );
    return data.orders;
  }

  async syncProducts(storeId: string): Promise<number> {
    const products = await this.getProducts();

    for (const product of products) {
      const price = product.variants[0]
        ? parseFloat(product.variants[0].price)
        : null;
      const compareAtPrice = product.variants[0]?.compare_at_price
        ? parseFloat(product.variants[0].compare_at_price)
        : null;

      await db.product.upsert({
        where: {
          storeId_shopifyId: { storeId, shopifyId: product.id.toString() },
        },
        create: {
          storeId,
          shopifyId: product.id.toString(),
          title: product.title,
          description: product.body_html,
          productType: product.product_type,
          vendor: product.vendor,
          price,
          compareAtPrice,
          imageUrl: product.images[0]?.src,
          status: product.status,
          tags: product.tags.split(", ").filter(Boolean).join(","),
        },
        update: {
          title: product.title,
          description: product.body_html,
          productType: product.product_type,
          price,
          compareAtPrice,
          imageUrl: product.images[0]?.src,
          status: product.status,
          tags: product.tags.split(", ").filter(Boolean).join(","),
        },
      });
    }

    await db.store.update({
      where: { id: storeId },
      data: { lastSyncAt: new Date() },
    });

    return products.length;
  }
}
