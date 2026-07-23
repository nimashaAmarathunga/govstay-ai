import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { WorkStatus, Role, RoomType, BookingStatus } from '@prisma/client';

async function main() {
  console.log('Clearing existing data...');
  // Delete in order of dependencies (child tables first)
  await prisma.booking.deleteMany({});
  await prisma.agentSession.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.caretaker.deleteMany({});
  await prisma.circuitBungalow.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding Users...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Super Admin User',
      username: 'superadmin',
      password: 'adminpassword123', // In a real app, this would be hashed
      role: Role.SUPER_ADMIN,
      placeOfWork: 'Ministry of Public Administration',
      position: 'Director IT',
    },
  });

  const deptAdminUser = await prisma.user.create({
    data: {
      name: 'Department Admin',
      username: 'deptadmin',
      password: 'deptpassword123',
      role: Role.DEPT_ADMIN,
      placeOfWork: 'Ministry of Tourism',
      position: 'Administrative Officer',
    },
  });

  const govEmployeeUser = await prisma.user.create({
    data: {
      name: 'Nimal Fernando',
      username: 'nimal_fernando',
      password: 'nimalpassword123',
      empId: 'GOV-2024-8891',
      role: Role.GOV_EMPLOYEE,
      status: WorkStatus.WORKING,
      placeOfWork: 'Department of Wildlife Conservation',
      position: 'Field Officer',
    },
  });

  const publicUser = await prisma.user.create({
    data: {
      name: 'Suresh Perera',
      username: 'suresh_perera',
      password: 'sureshpassword123',
      role: Role.PUBLIC_USER,
    },
  });

  console.log('Seeding Circuit Bungalows, Rooms, and Caretakers...');

  // 1. Nuwara Eliya Rest House
  const bungalow1 = await prisma.circuitBungalow.create({
    data: {
      name: 'Nuwara Eliya Rest House',
      slug: 'nuwara-eliya-rest-house',
      location: 'Nuwara Eliya, Central Province',
      noOfRooms: 3,
      department: 'Ministry of Public Administration',
      price: 18500.0,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHtjFwAj-lsUvWvMM4b5izQJgtLPrniT_NaZ-YiGrw33YJ8RniIPjmTjSUw8FYJuKsHIvNV-bCVhSpjQmZXftPv6MvjkVYu--XWXSnEEOrYKb8kSgvMlvP9n0aFegBq7P46C_SlEcyZhVnfmyJVGXybDENXRBVKIL-4GFglCZGhqGfITPMZQGP9OXoJAFn19ilHm-WduLmEUl3IEbSe6lBKWeRfdJXvKUpJKf1nAQ1PoM31nZXCwnJ',
      rating: 4.8,
      amenities: ['Garden View', 'Fireplace', 'Steward Service'],
      highlights: ['Quiet garden setting', 'Classic fireplace lounge', 'Close to Gregory Lake'],
      description: 'Set among the cool hills of Nuwara Eliya, this welcoming government rest house combines classic colonial character with peaceful garden views. It is a comfortable base for exploring the town, tea country, and nearby walking trails.',
      capacity: 6,
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'Sunil Perera',
      address: 'No 45, Unique View Road, Nuwara Eliya',
      telephoneNo: '+94 77 123 4567',
      emailAddress: 'sunil@govstay.lk',
      circuitBungalowId: bungalow1.id,
    },
  });

  const b1r1 = await prisma.room.create({
    data: {
      roomNumber: 'NE-01',
      roomType: RoomType.AC,
      noOfBeds: 2,
      items: ['King Bed', 'Heater', 'TV', 'Ensuite Bathroom'],
      circuitBungalowId: bungalow1.id,
    },
  });

  const b1r2 = await prisma.room.create({
    data: {
      roomNumber: 'NE-02',
      roomType: RoomType.NON_AC,
      noOfBeds: 2,
      items: ['Double Bed', 'Heater', 'Wardrobe', 'Shared Bathroom'],
      circuitBungalowId: bungalow1.id,
    },
  });

  const b1r3 = await prisma.room.create({
    data: {
      roomNumber: 'NE-03',
      roomType: RoomType.NON_AC,
      noOfBeds: 2,
      items: ['Double Bed', 'Heater', 'Shared Bathroom'],
      circuitBungalowId: bungalow1.id,
    },
  });

  // 2. Galle Fort Heritage Bungalow
  const bungalow2 = await prisma.circuitBungalow.create({
    data: {
      name: 'Galle Fort Heritage Bungalow',
      slug: 'galle-fort-heritage-bungalow',
      location: 'Galle, Southern Province',
      noOfRooms: 2,
      department: 'Ministry of Cultural Affairs',
      price: 22000.0,
      image: 'https://images.unsplash.com/photo-1542314831-c6a4d14cdce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      amenities: ['Ocean View', 'Historical', 'AC'],
      highlights: ['Walkable to Galle Fort', 'Heritage architecture', 'Air-conditioned rooms'],
      description: "Stay close to the ramparts and ocean breeze in a heritage bungalow shaped by Galle's unmistakable coastal history. Restored details, cool interiors, and an easy walk to the fort make this a memorable southern escape.",
      capacity: 4,
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'Kamal Silva',
      address: 'No 12, Rampart Street, Galle Fort',
      telephoneNo: '+94 71 987 6543',
      emailAddress: 'kamal@govstay.lk',
      circuitBungalowId: bungalow2.id,
    },
  });

  const b2r1 = await prisma.room.create({
    data: {
      roomNumber: 'GF-01',
      roomType: RoomType.AC,
      noOfBeds: 2,
      items: ['King Bed', 'AC', 'TV', 'Ocean View balcony', 'Ensuite Bathroom'],
      circuitBungalowId: bungalow2.id,
    },
  });

  const b2r2 = await prisma.room.create({
    data: {
      roomNumber: 'GF-02',
      roomType: RoomType.AC,
      noOfBeds: 2,
      items: ['Queen Bed', 'AC', 'Ensuite Bathroom'],
      circuitBungalowId: bungalow2.id,
    },
  });

  // 3. Kandy Lake View Circuit
  const bungalow3 = await prisma.circuitBungalow.create({
    data: {
      name: 'Kandy Lake View Circuit',
      slug: 'kandy-lake-view-circuit',
      location: 'Kandy, Central Province',
      noOfRooms: 2,
      department: 'Ministry of Tourism',
      price: 15000.0,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      amenities: ['Lake View', 'AC', 'WiFi'],
      highlights: ['Panoramic lake outlook', 'Fast WiFi included', 'Near Temple of the Tooth'],
      description: 'Enjoy an elevated view over Kandy Lake from this centrally located circuit bungalow. With practical modern comforts and quick access to the city\'s cultural landmarks, it suits both short visits and relaxed family stays.',
      capacity: 4,
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'Anura Bandara',
      address: 'No 88, Lake Round Road, Kandy',
      telephoneNo: '+94 72 234 5678',
      emailAddress: 'anura@govstay.lk',
      circuitBungalowId: bungalow3.id,
    },
  });

  const b3r1 = await prisma.room.create({
    data: {
      roomNumber: 'KY-01',
      roomType: RoomType.AC,
      noOfBeds: 2,
      items: ['Double Bed', 'AC', 'TV', 'Lake View Window', 'Ensuite Bathroom'],
      circuitBungalowId: bungalow3.id,
    },
  });

  const b3r2 = await prisma.room.create({
    data: {
      roomNumber: 'KY-02',
      roomType: RoomType.NON_AC,
      noOfBeds: 2,
      items: ['Double Bed', 'Fan', 'Shared Bathroom'],
      circuitBungalowId: bungalow3.id,
    },
  });

  // 4. Yala Safari Lodge
  const bungalow4 = await prisma.circuitBungalow.create({
    data: {
      name: 'Yala Safari Lodge (Gov)',
      slug: 'yala-safari-lodge',
      location: 'Yala, Southern Province',
      noOfRooms: 3,
      department: 'Department of Wildlife Conservation',
      price: 25000.0,
      image: 'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      amenities: ['Safari Access', 'Full Board', 'Guide'],
      highlights: ['Easy park access', 'Full-board stay', 'Experienced local guide'],
      description: 'Make an early start for Yala National Park from this government safari lodge. Full-board hospitality, guided excursions, and generous outdoor spaces make it an ideal base for a focused wildlife break.',
      capacity: 6,
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'Ranjith Kumara',
      address: 'Near Park Entrance, Yala',
      telephoneNo: '+94 75 345 6789',
      emailAddress: 'ranjith@govstay.lk',
      circuitBungalowId: bungalow4.id,
    },
  });

  const b4r1 = await prisma.room.create({
    data: {
      roomNumber: 'YL-01',
      roomType: RoomType.AC,
      noOfBeds: 2,
      items: ['King Bed', 'AC', 'Mini Fridge', 'Ensuite Bathroom'],
      circuitBungalowId: bungalow4.id,
    },
  });

  const b4r2 = await prisma.room.create({
    data: {
      roomNumber: 'YL-02',
      roomType: RoomType.AC,
      noOfBeds: 2,
      items: ['Twin Beds', 'AC', 'Ensuite Bathroom'],
      circuitBungalowId: bungalow4.id,
    },
  });

  const b4r3 = await prisma.room.create({
    data: {
      roomNumber: 'YL-03',
      roomType: RoomType.NON_AC,
      noOfBeds: 3,
      items: ['Three Single Beds', 'Fan', 'Shared Bathroom'],
      circuitBungalowId: bungalow4.id,
    },
  });

  console.log('Seeding Bookings...');
  
  // Future booking for Gov Employee
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 3);

  await prisma.booking.create({
    data: {
      userId: govEmployeeUser.id,
      circuitBungalowId: bungalow1.id,
      roomId: b1r1.id,
      fromDate: nextWeek,
      toDate: nextWeekEnd,
      status: BookingStatus.CONFIRMED,
      totalCost: 37000.0,
    },
  });

  // Past booking for Public User
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);
  const lastMonthEnd = new Date(lastMonth);
  lastMonthEnd.setDate(lastMonthEnd.getDate() + 2);

  await prisma.booking.create({
    data: {
      userId: publicUser.id,
      circuitBungalowId: bungalow2.id,
      roomId: b2r1.id,
      fromDate: lastMonth,
      toDate: lastMonthEnd,
      status: BookingStatus.CONFIRMED,
      totalCost: 44000.0,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
