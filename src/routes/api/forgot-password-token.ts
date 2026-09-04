/**
 * Dev-only endpoint to retrieve the password reset token from the verification table.
 * In production, this token would be emailed to the user.
 *
 * This endpoint queries the Better Auth verification table for the latest
 * forgot-password token associated with the given email.
 */
import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

export const Route = createFileRoute("/api/forgot-password-token")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { email?: string };
          const email = body.email?.trim().toLowerCase();

          if (!email) {
            return new Response(
              JSON.stringify({ error: "Email is required" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const sql = await getSql();

          // Query the verification table for the latest forgot-password token
          // Better Auth stores tokens in the verification table with id = "forgot-password"
          const rows = await sql<{ value: string }>`
            SELECT value FROM verification
            WHERE id = 'forgot-password'
              AND LOWER(value) LIKE ${`%"email":"${email}"%`}
            ORDER BY created_at DESC
            LIMIT 1
          `;

          if (!rows[0]) {
            return new Response(
              JSON.stringify({ error: "No reset token found" }),
              { status: 404, headers: { "Content-Type": "application/json" } }
            );
          }

          // Parse the JSON value to extract the token
          try {
            const data = JSON.parse(rows[0].value) as { token?: string; redirectTo?: string };
            const token = data.token;
            if (!token) {
              return new Response(
                JSON.stringify({ error: "Token not found in verification data" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
              );
            }
            return new Response(
              JSON.stringify({ token }),
              { status: 200, headers: { "Content-Type": "application/json" } }
            );
          } catch {
            // If the value is not JSON, it might be the token directly
            return new Response(
              JSON.stringify({ token: rows[0].value }),
              { status: 200, headers: { "Content-Type": "application/json" } }
            );
          }
        } catch (err) {
          console.error("[forgot-password-token]", err);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
