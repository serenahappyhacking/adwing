"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", {
      email,
      password: "dev",
      callbackUrl: "/dashboard",
    });
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">A</span>
          </div>
          <CardTitle>Welcome to AdWing</CardTitle>
          <CardDescription>Sign in to manage your advertising</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Shopify OAuth */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("shopify", { callbackUrl: "/onboarding" })}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.337 3.415c-.157-.018-.314.078-.393.235-.08.157-1.728 3.327-1.728 3.327s-1.17-.522-2.582-.34c-2.157.278-2.157 2.097-2.157 2.37 0 1.528 3.94 1.884 3.94 5.138 0 2.543-1.612 4.178-3.786 4.178-2.61 0-3.94-1.625-3.94-1.625l.706-2.33s1.383 1.188 2.553 1.188c.758 0 1.073-.597 1.073-1.032 0-1.996-3.233-2.083-3.233-4.838 0-2.487 1.785-4.897 5.386-4.897 1.383 0 2.073.392 2.073.392l-1.04 3.453"/>
            </svg>
            Continue with Shopify
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Email sign in */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
