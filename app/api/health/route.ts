/** Health check endpoint */
export async function GET() {
  return Response.json({
    success: true,
    message: "MPSS Backend is running",
    timestamp: new Date().toISOString(),
  });
}
