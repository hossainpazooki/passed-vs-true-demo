// v1: the live CSL stack is not deployed. This route exists for the optional
// Node-host deployment (spec §2). The static export never calls it.
export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify({ available: false, reason: "live stack deferred to Phase 2" }), {
    status: 501,
    headers: { "content-type": "application/json" },
  });
}
