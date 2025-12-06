import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js API Proxy Layer
 * 
 * This route forwards all /api/backend/* requests to the backend server.
 * It acts as a reverse proxy, allowing the frontend to make API calls without
 * exposing the backend URL to the client and avoiding CORS issues.
 * 
 * Supported methods: GET, POST, PUT, PATCH, DELETE
 * 
 * Example usage:
 * - Frontend: axios.get('/api/backend/posts/feed')
 * - Proxied to: ${NEXT_PUBLIC_BACKEND_URL}/posts/feed
 */

// Define supported HTTP methods
const SUPPORTED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

/**
 * Generic handler for all HTTP methods
 * Forwards the request to the backend server and returns the response
 */
async function handleRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const method = request.method;

  // Validate HTTP method
  if (!SUPPORTED_METHODS.includes(method)) {
    return NextResponse.json(
      { error: `Method ${method} not allowed` },
      { status: 405 }
    );
  }

  try {
    // Get the backend URL from environment variable
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error("[API Proxy] NEXT_PUBLIC_BACKEND_URL is not defined");
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 }
      );
    }

    // Await params in Next.js 15+
    const params = await context.params;

    // Build the target URL from the path segments
    // Example: [...path] = ['posts', 'feed'] -> '/posts/feed'
    const pathString = params.path.join("/");
    const targetUrl = `${backendUrl}/${pathString}`;

    // Preserve query parameters from the original request
    const searchParams = request.nextUrl.searchParams.toString();
    const fullTargetUrl = searchParams
      ? `${targetUrl}?${searchParams}`
      : targetUrl;

    console.log(`[API Proxy] ${method} ${fullTargetUrl}`);

    // Extract headers from the incoming request
    const headers = new Headers();
    
    // Forward important headers (cookies, authorization, content-type, etc.)
    request.headers.forEach((value, key) => {
      // Skip host header to avoid conflicts
      if (key.toLowerCase() !== "host") {
        headers.set(key, value);
      }
    });

    // Prepare the fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // For methods that can have a body (POST, PUT, PATCH, DELETE)
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      // Check if the request has a body
      const contentType = request.headers.get("content-type");
      
      if (contentType?.includes("application/json")) {
        // JSON body
        try {
          const body = await request.json();
          fetchOptions.body = JSON.stringify(body);
        } catch (e) {
          console.error("[API Proxy] Failed to parse JSON body:", e);
        }
      } else if (contentType?.includes("multipart/form-data")) {
        // FormData body - preserve as-is
        fetchOptions.body = await request.formData();
      } else if (contentType?.includes("application/x-www-form-urlencoded")) {
        // URL-encoded form data
        fetchOptions.body = await request.text();
      } else if (request.body) {
        // Generic body (binary, text, etc.)
        fetchOptions.body = request.body;
      }
    }

    // Make the request to the backend
    const backendResponse = await fetch(fullTargetUrl, fetchOptions);

    // Get the response body
    const responseBody = await backendResponse.text();

    // Create a new response with the backend's status and body
    const response = new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    // Forward response headers from backend to client
    backendResponse.headers.forEach((value, key) => {
      // Forward most headers, but be careful with some that might cause issues
      if (!["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) {
        response.headers.set(key, value);
      }
    });

    // Ensure proper content-type is set
    const backendContentType = backendResponse.headers.get("content-type");
    if (backendContentType) {
      response.headers.set("content-type", backendContentType);
    }

    console.log(`[API Proxy] Response ${backendResponse.status} from ${fullTargetUrl}`);

    return response;
  } catch (error) {
    console.error("[API Proxy] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to proxy request to backend",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Export handlers for all supported HTTP methods
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context);
}
