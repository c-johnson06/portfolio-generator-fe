import { NextResponse } from "next/server";

export async function GET() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL!;
  return NextResponse.redirect(`${apiBase}/auth/login`);
}
