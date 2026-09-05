import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth";

// GET circuit bungalows with caretaker and rooms (optional ?department=... filter)
export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let department = searchParams.get("department");

    if (admin.role === "DEPT_ADMIN") {
      // Safely fallback to fetching from DB if placeOfWork is missing from token (e.g. old token)
      if (!admin.placeOfWork) {
        const dbAdmin = await prisma.user.findUnique({ where: { id: admin.userId } });
        department = dbAdmin?.placeOfWork || "UNKNOWN_DEPARTMENT";
      } else {
        department = admin.placeOfWork;
      }
    }

    const where = department && department !== "ALL" ? { department } : {};

    const bungalows = await prisma.circuitBungalow.findMany({
      where,
      include: {
        caretaker: true,
        rooms: {
          orderBy: { roomNumber: 'asc' },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: bungalows });
  } catch (error: any) {
    console.error("Error fetching circuit bungalows:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch bungalows" },
      { status: 500 }
    );
  }
}

async function resolveCoordinates(
  lat: any,
  lng: any,
  gmapLink?: string
): Promise<{ latitude: number | null; longitude: number | null }> {
  let parsedLat = lat ? parseFloat(lat) : null;
  let parsedLng = lng ? parseFloat(lng) : null;

  if (isNaN(parsedLat as number)) parsedLat = null;
  if (isNaN(parsedLng as number)) parsedLng = null;

  if ((parsedLat === null || parsedLng === null) && gmapLink && gmapLink.startsWith("http")) {
    try {
      const res = await fetch(gmapLink, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      const expandedUrl = res.url;

      const pinMatch = expandedUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (pinMatch) {
        return { latitude: parseFloat(pinMatch[1]), longitude: parseFloat(pinMatch[2]) };
      }

      const atMatch = expandedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        return { latitude: parseFloat(atMatch[1]), longitude: parseFloat(atMatch[2]) };
      }
    } catch (err) {
      console.error("Error auto-resolving map link in API:", err);
    }
  }

  return { latitude: parsedLat, longitude: parsedLng };
}

// POST: Create new Circuit Bungalow with Caretaker and Rooms
export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      name,
      slug: customSlug,
      location,
      department,
      capacity,
      noOfRooms,
      image,
      description,
      amenities,
      highlights,
      latitude,
      longitude,
      gmapLink,
      caretaker, // { name, address, telephoneNo, emailAddress }
      rooms,     // Array of { roomNumber, roomType, noOfBeds, price, items }
    } = body;

    if (!name || !location || !department) {
      return NextResponse.json(
        { success: false, error: "Name, location, and department are required." },
        { status: 400 }
      );
    }

    // Generate unique slug if not provided
    const slug =
      customSlug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + `-${Date.now()}`;

    const parsedNoOfRooms = Number(noOfRooms) || (Array.isArray(rooms) ? rooms.length : 1);
    const parsedCapacity = Number(capacity) || 4;
    // Validate room limit before creating bungalow
    if (Array.isArray(rooms) && rooms.length > parsedNoOfRooms) {
      return NextResponse.json({ success: false, error: "Room limit exceeded for this bungalow." }, { status: 400 });
    }

    const { latitude: finalLat, longitude: finalLng } = await resolveCoordinates(latitude, longitude, gmapLink);

    // Prisma nested create
    const newBungalow = await prisma.circuitBungalow.create({
      data: {
        name,
        slug,
        location,
        department,
        capacity: parsedCapacity,
        noOfRooms: parsedNoOfRooms,
        image: image || "https://images.unsplash.com/photo-1542314831-c6a4d14cdce8?auto=format&fit=crop&w=800&q=80",
        description: description || "",
        rating: 4.8,
        amenities: Array.isArray(amenities)
          ? amenities
          : typeof amenities === "string"
          ? amenities.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
        highlights: Array.isArray(highlights)
          ? highlights
          : typeof highlights === "string"
          ? highlights.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
        latitude: finalLat,
        longitude: finalLng,
        gmapLink: gmapLink || null,

        // Create Caretaker if caretaker name is provided
        ...(caretaker && caretaker.name
          ? {
              caretaker: {
                create: {
                  name: caretaker.name,
                  address: caretaker.address || location,
                  telephoneNo: caretaker.telephoneNo || "",
                  emailAddress: caretaker.emailAddress || null,
                },
              },
            }
          : {}),

        // Create Rooms if provided
        ...(Array.isArray(rooms) && rooms.length > 0
          ? {
              rooms: {
                create: rooms.map((r: any) => ({
                  roomNumber: r.roomNumber || `Room-${Date.now()}`,
                  roomType: r.roomType === "AC" ? "AC" : "NON_AC",
                  noOfBeds: Number(r.noOfBeds) || 2,
                  price: parseFloat(r.price) || 3000,
                  items: Array.isArray(r.items)
                    ? r.items
                    : typeof r.items === "string"
                    ? r.items.split(",").map((s: string) => s.trim()).filter(Boolean)
                    : [],
                })),
              },
            }
          : {}),
      },
      include: {
        caretaker: true,
        rooms: true,
      },
    });

    return NextResponse.json({ success: true, data: newBungalow });
  } catch (error: any) {
    console.error("Error creating circuit bungalow:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create bungalow" },
      { status: 500 }
    );
  }
}

// PUT: Update existing Circuit Bungalow, Caretaker, and Rooms
export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      slug,
      location,
      department,
      capacity,
      noOfRooms,
      image,
      description,
      amenities,
      highlights,
      latitude,
      longitude,
      gmapLink,
      caretaker,
      rooms,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Bungalow ID is required for update." },
        { status: 400 }
      );
    }

    // Role-based authorization
    if (admin.role === "DEPT_ADMIN") {
      let adminDept = admin.placeOfWork;
      if (!adminDept) {
        const dbAdmin = await prisma.user.findUnique({ where: { id: admin.userId } });
        adminDept = dbAdmin?.placeOfWork;
      }
      
      const existingBungalow = await prisma.circuitBungalow.findUnique({ where: { id } });
      if (!existingBungalow || existingBungalow.department !== adminDept) {
        return NextResponse.json({ success: false, error: "Forbidden: You can only edit bungalows in your department." }, { status: 403 });
      }
      // Ensure they don't change the department to something else
      if (department !== adminDept) {
        return NextResponse.json({ success: false, error: "Forbidden: Cannot change bungalow department." }, { status: 403 });
      }
    }

    const parsedNoOfRooms = Number(noOfRooms) || (Array.isArray(rooms) ? rooms.length : 1);
    const parsedCapacity = Number(capacity) || 4;

    // Validate room limit before updating bungalow
    if (Array.isArray(rooms) && rooms.length > parsedNoOfRooms) {
      return NextResponse.json({ success: false, error: "Room limit exceeded for this bungalow." }, { status: 400 });
    }

    const { latitude: finalLat, longitude: finalLng } = await resolveCoordinates(latitude, longitude, gmapLink);

    // Use transaction to update bungalow, upsert caretaker, and refresh rooms
    const updatedBungalow = await prisma.$transaction(async (tx: any) => {
      // 1. Update basic bungalow info
      const b = await tx.circuitBungalow.update({
        where: { id },
        data: {
          name,
          slug,
          location,
          department,
          capacity: parsedCapacity,
          noOfRooms: parsedNoOfRooms,
          image,
          description,
          amenities: Array.isArray(amenities)
            ? amenities
            : typeof amenities === "string"
            ? amenities.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
          highlights: Array.isArray(highlights)
            ? highlights
            : typeof highlights === "string"
            ? highlights.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
          latitude: finalLat,
          longitude: finalLng,
          gmapLink: gmapLink || null,
        },
      });

      // 2. Upsert Caretaker details
      if (caretaker && caretaker.name) {
        await tx.caretaker.upsert({
          where: { circuitBungalowId: id },
          create: {
            name: caretaker.name,
            address: caretaker.address || location,
            telephoneNo: caretaker.telephoneNo || "",
            emailAddress: caretaker.emailAddress || null,
            circuitBungalowId: id,
          },
          update: {
            name: caretaker.name,
            address: caretaker.address || location,
            telephoneNo: caretaker.telephoneNo || "",
            emailAddress: caretaker.emailAddress || null,
          },
        });
      }

      // 3. Update Rooms (delete existing rooms and create new room records)
      if (Array.isArray(rooms)) {
        await tx.room.deleteMany({
          where: { circuitBungalowId: id },
        });

        if (rooms.length > 0) {
          await tx.room.createMany({
            data: rooms.map((r: any) => ({
              circuitBungalowId: id,
              roomNumber: r.roomNumber || `Room`,
              roomType: r.roomType === "AC" ? "AC" : "NON_AC",
              noOfBeds: Number(r.noOfBeds) || 2,
              price: parseFloat(r.price) || 3000,
              items: Array.isArray(r.items)
                ? r.items
                : typeof r.items === "string"
                ? r.items.split(",").map((s: string) => s.trim()).filter(Boolean)
                : [],
            })),
          });
        }
      }

      return await tx.circuitBungalow.findUnique({
        where: { id },
        include: {
          caretaker: true,
          rooms: true,
        },
      });
    });

    return NextResponse.json({ success: true, data: updatedBungalow });
  } catch (error: any) {
    console.error("Error updating circuit bungalow:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update bungalow" },
      { status: 500 }
    );
  }
}

// DELETE: Delete Circuit Bungalow by ID (Cascades to Caretaker & Rooms)
export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Bungalow ID parameter is required." },
        { status: 400 }
      );
    }

    // Role-based authorization
    if (admin.role === "DEPT_ADMIN") {
      let adminDept = admin.placeOfWork;
      if (!adminDept) {
        const dbAdmin = await prisma.user.findUnique({ where: { id: admin.userId } });
        adminDept = dbAdmin?.placeOfWork;
      }
      
      const existingBungalow = await prisma.circuitBungalow.findUnique({ where: { id } });
      if (!existingBungalow || existingBungalow.department !== adminDept) {
        return NextResponse.json({ success: false, error: "Forbidden: You can only delete bungalows in your department." }, { status: 403 });
      }
    }

    await prisma.circuitBungalow.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Bungalow deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting circuit bungalow:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete bungalow" },
      { status: 500 }
    );
  }
}
