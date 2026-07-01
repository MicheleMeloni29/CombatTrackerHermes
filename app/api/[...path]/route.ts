import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function getApiProxyTarget() {
  const target = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

  if (!target) {
    throw new Error("API_PROXY_TARGET non configurato.");
  }

  return target;
}

function buildTargetUrl(request: NextRequest) {
  const target = getApiProxyTarget();
  const incomingUrl = new URL(request.url);
  const incomingPath = incomingUrl.pathname.startsWith("/api/")
    ? incomingUrl.pathname.slice("/api/".length)
    : incomingUrl.pathname.slice("/api".length);

  return `${target}/api/${incomingPath}${incomingUrl.search}`;
}

function copyRequestHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);

  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  headers.set("x-forwarded-host", request.headers.get("host") ?? "");
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  return headers;
}

function copyResponseHeaders(source: Headers) {
  const headers = new Headers();

  source.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      return;
    }

    headers.append(key, value);
  });

  return headers;
}

async function proxyRequest(request: NextRequest) {
  let targetUrl: string;

  try {
    targetUrl = buildTargetUrl(request);
  } catch (error) {
    return Response.json(
      {
        detail:
          error instanceof Error ? error.message : "Proxy API non configurato correttamente.",
      },
      { status: 500 }
    );
  }

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers: copyRequestHeaders(request),
    body,
    redirect: "manual",
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: copyResponseHeaders(upstreamResponse.headers),
  });
}

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}

export async function OPTIONS(request: NextRequest) {
  return proxyRequest(request);
}

export async function HEAD(request: NextRequest) {
  return proxyRequest(request);
}
