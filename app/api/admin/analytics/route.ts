import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin || admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "last6months";

    let dateFilter: { gte?: Date } | undefined = undefined;
    const now = new Date();
    if (period === "last7days") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      dateFilter = { gte: d };
    } else if (period === "last30days") {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      dateFilter = { gte: d };
    } else if (period === "last3months") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      dateFilter = { gte: d };
    } else if (period === "last6months") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      dateFilter = { gte: d };
    } else if (period === "last12months") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 12);
      dateFilter = { gte: d };
    }
    // "all" leaves dateFilter undefined

    // 1. Overview counts
    const totalBungalows = await prisma.circuitBungalow.count();
    const totalRooms = await prisma.room.count();
    const totalBookings = await prisma.booking.count({
      where: dateFilter ? { createdAt: dateFilter } : undefined
    });
    const totalUsers = await prisma.user.count({
      where: dateFilter ? { createdAt: dateFilter } : undefined
    });
    
    // Departments (distinct departments from bungalows)
    const distinctDepartments = await prisma.circuitBungalow.findMany({
      select: { department: true },
      distinct: ['department'],
    });
    const totalDepartments = distinctDepartments.length;

    // 2. Booking Trends (Grouped by Date)
    const recentBookings = await prisma.booking.findMany({
      where: dateFilter ? { createdAt: dateFilter } : undefined,
      select: { createdAt: true }
    });

    const trendsMap: Record<string, number> = {};
    recentBookings.forEach(b => {
      const dateStr = b.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      trendsMap[dateStr] = (trendsMap[dateStr] || 0) + 1;
    });

    // Sort the trends
    const bookingTrends = Object.entries(trendsMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    // 3. Booking Statuses
    const statuses = await prisma.booking.groupBy({
      by: ['status'],
      where: dateFilter ? { createdAt: dateFilter } : undefined,
      _count: {
        id: true,
      }
    });
    const bookingStatuses = statuses.map(s => ({
      name: s.status,
      value: s._count.id
    }));

    // 4. User Stats
    const userRoles = await prisma.user.groupBy({
      by: ['role'],
      where: dateFilter ? { createdAt: dateFilter } : undefined,
      _count: {
        id: true,
      }
    });
    const userStats = userRoles.map(u => ({
      name: u.role,
      value: u._count.id
    }));

    // 5. Payment Stats
    const payments = await prisma.paymentSlip.groupBy({
      by: ['verificationStatus'],
      where: dateFilter ? { createdAt: dateFilter } : undefined,
      _count: {
        id: true,
      }
    });
    const paymentStats = payments.map(p => ({
      name: p.verificationStatus || "PENDING",
      value: p._count.id
    }));

    // 6. Most Booked Bungalows & Department Analytics
    // Fetch bungalows with their booking counts filtered by date
    const bungalowsStats = await prisma.circuitBungalow.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        department: true,
        _count: {
          select: { 
            rooms: true,
            bookings: dateFilter ? { where: { createdAt: dateFilter } } : true
          }
        },
        bookings: dateFilter 
          ? { where: { createdAt: dateFilter }, select: { status: true } }
          : { select: { status: true } }
      }
    });

    // Top Bungalows
    const topBungalows = bungalowsStats
      .map(b => ({
        id: b.id,
        name: b.name,
        location: b.location,
        department: b.department,
        bookings: b._count.bookings
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10); // Top 10

    // Top Destinations (Locations)
    const destMap: Record<string, { bungalows: number, bookings: number }> = {};
    bungalowsStats.forEach(b => {
      if (!destMap[b.location]) {
        destMap[b.location] = { bungalows: 0, bookings: 0 };
      }
      destMap[b.location].bungalows += 1;
      destMap[b.location].bookings += b._count.bookings;
    });
    const destinationStats = Object.entries(destMap)
      .map(([location, stats]) => ({
        location,
        bungalows: stats.bungalows,
        bookings: stats.bookings
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);

    // Department Stats
    const deptMap: Record<string, { bungalows: number, rooms: number, bookings: number, confirmed: number, cancelled: number }> = {};
    bungalowsStats.forEach(b => {
      if (!deptMap[b.department]) {
        deptMap[b.department] = { bungalows: 0, rooms: 0, bookings: 0, confirmed: 0, cancelled: 0 };
      }
      deptMap[b.department].bungalows += 1;
      deptMap[b.department].rooms += b._count.rooms;
      deptMap[b.department].bookings += b._count.bookings;
      
      const confirmed = b.bookings.filter(bk => bk.status === "CONFIRMED").length;
      const cancelled = b.bookings.filter(bk => bk.status === "CANCELLED").length;
      
      deptMap[b.department].confirmed += confirmed;
      deptMap[b.department].cancelled += cancelled;
    });

    const departmentStats = Object.entries(deptMap)
      .map(([department, stats]) => ({
        department,
        ...stats
      }))
      .sort((a, b) => b.bookings - a.bookings);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalBungalows,
          totalRooms,
          totalBookings,
          totalUsers,
          totalDepartments
        },
        bookingTrends,
        bookingStatuses,
        userStats,
        paymentStats,
        topBungalows,
        destinationStats,
        departmentStats
      }
    });

  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate analytics" }, { status: 500 });
  }
}
