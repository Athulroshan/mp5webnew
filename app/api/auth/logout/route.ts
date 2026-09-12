import { NextRequest } from "next/server";

export async function POST(_request: NextRequest) {
  const res = Response.json({ success: true, message: "Logged out successfully" });
  res.headers.set("Set-Cookie", "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  return res;
}
