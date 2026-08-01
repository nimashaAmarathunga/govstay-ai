import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Follow redirects to get final expanded URL
    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const expandedUrl = response.url;

    // Pattern 1: Exact pin coordinates: !3dlat!4dlng
    const pinMatch = expandedUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (pinMatch) {
      return NextResponse.json({
        success: true,
        expandedUrl,
        latitude: pinMatch[1],
        longitude: pinMatch[2],
      });
    }

    // Pattern 2: Viewport / Camera coordinates: @lat,lng
    const atMatch = expandedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return NextResponse.json({
        success: true,
        expandedUrl,
        latitude: atMatch[1],
        longitude: atMatch[2],
      });
    }

    // Pattern 3: Query parameter q=lat,lng
    const qMatch = expandedUrl.match(/[?&]q=(-?\d+\.\d+)[,|%2C](-?\d+\.\d+)/i);
    if (qMatch) {
      return NextResponse.json({
        success: true,
        expandedUrl,
        latitude: qMatch[1],
        longitude: qMatch[2],
      });
    }

    // Pattern 4: Query parameter ll=lat,lng
    const llMatch = expandedUrl.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) {
      return NextResponse.json({
        success: true,
        expandedUrl,
        latitude: llMatch[1],
        longitude: llMatch[2],
      });
    }

    return NextResponse.json({
      success: false,
      expandedUrl,
      error: "Could not extract coordinates from final URL",
    });
  } catch (error: any) {
    console.error("Error expanding map link:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resolve link" },
      { status: 500 }
    );
  }
}
