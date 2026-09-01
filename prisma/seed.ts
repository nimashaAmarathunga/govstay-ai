import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { WorkStatus, Role, RoomType, BookingStatus } from '@prisma/client';

async function main() {
  console.log('🧹 Clearing existing database records...');
  // Delete child records first to respect foreign key constraints
  await prisma.booking.deleteMany({});
  await prisma.agentSession.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.caretaker.deleteMany({});
  await prisma.circuitBungalow.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('👤 Seeding System Users...');

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Dr. K. L. Perera',
      username: 'superadmin',
      password: 'adminpassword123',
      role: Role.SUPER_ADMIN,
      placeOfWork: 'Ministry of Public Administration',
      position: 'Director General',
      nicNumber: '197512345678',
      mobileNumber: '0771234567',
      emailAddress: 'superadmin@govsewana.lk',
      residentialAddress: '123 Main St, Colombo 03',
      preferredDistrict: 'Colombo',
    },
  });

  const deptAdminPublicAdmin = await prisma.user.create({
    data: {
      name: 'Sunil Wickramasinghe',
      username: 'pubadmin_admin',
      password: 'deptpassword123',
      role: Role.DEPT_ADMIN,
      placeOfWork: 'Ministry of Public Administration',
      position: 'Senior Administrative Officer',
      nicNumber: '198012345679',
      mobileNumber: '0711234567',
      emailAddress: 'sunil@pubadmin.gov.lk',
      residentialAddress: '456 Kandy Rd, Kadawatha',
      preferredDistrict: 'Gampaha',
    },
  });

  const deptAdminLands = await prisma.user.create({
    data: {
      name: 'Kamani Jayawardena',
      username: 'lands_admin',
      password: 'deptpassword123',
      role: Role.DEPT_ADMIN,
      placeOfWork: "Land Commissioner General's Department",
      position: 'Assistant Commissioner',
      nicNumber: '198512345680',
      mobileNumber: '0721234567',
      emailAddress: 'kamani@lands.gov.lk',
      residentialAddress: '789 High Level Rd, Nugegoda',
      preferredDistrict: 'Colombo',
    },
  });

  // Government Employees with requested format (2455__Letter)
  const govEmp1 = await prisma.user.create({
    data: {
      name: 'Ravidu Rajapaksha',
      username: 'ravidu_245503b',
      password: 'userpassword123',
      empId: '245503B',
      role: Role.GOV_EMPLOYEE,
      status: WorkStatus.WORKING,
      placeOfWork: 'Department of Wildlife Conservation',
      position: 'Software Engineer',
      nicNumber: '199012345681',
      mobileNumber: '0703009464',
      emailAddress: 'ravidu@dwc.gov.lk',
      residentialAddress: '101 Baseline Rd, Colombo 08',
      preferredDistrict: 'Colombo',
    },
  });

  const govEmp2 = await prisma.user.create({
    data: {
      name: 'Anura Fernando',
      username: 'anura_245548p',
      password: 'userpassword123',
      empId: '245548P',
      role: Role.GOV_EMPLOYEE,
      status: WorkStatus.WORKING,
      placeOfWork: 'Survey Department of Sri Lanka',
      position: 'Senior Surveyor',
      nicNumber: '198212345682',
      mobileNumber: '0703009464',
      emailAddress: 'anura@survey.gov.lk',
      residentialAddress: '202 Galle Rd, Mount Lavinia',
      preferredDistrict: 'Colombo',
    },
  });

  const govEmp3 = await prisma.user.create({
    data: {
      name: 'Champa De Silva',
      username: 'champa_245516r',
      password: 'userpassword123',
      empId: '245516R',
      role: Role.GOV_EMPLOYEE,
      status: WorkStatus.RETIRED,
      placeOfWork: 'Department of Agrarian Development',
      position: 'Former Divisional Officer',
      nicNumber: '195512345683',
      mobileNumber: '0703009464',
      emailAddress: 'champa@agrarian.gov.lk',
      residentialAddress: '303 Peradeniya Rd, Kandy',
      preferredDistrict: 'Kandy',
    },
  });

  const govEmp4 = await prisma.user.create({
    data: {
      name: 'Lalith Gunawardena',
      username: 'lalith_245506l',
      password: 'userpassword123',
      empId: '245506L',
      role: Role.GOV_EMPLOYEE,
      status: WorkStatus.WORKING,
      placeOfWork: 'Department of Irrigation',
      position: 'Executive Engineer',
      nicNumber: '197812345684',
      mobileNumber: '0703009464',
      emailAddress: 'lalith@irrigation.gov.lk',
      residentialAddress: '404 Kurunegala Rd, Dambulla',
      preferredDistrict: 'Kurunegala',
    },
  });

  const publicUser = await prisma.user.create({
    data: {
      name: 'Kasun Rathnayake',
      username: 'kasun_public',
      password: 'publicpassword123',
      role: Role.PUBLIC_USER,
      nicNumber: '199512345685',
      mobileNumber: '0779998888',
      emailAddress: 'kasun@gmail.com',
      residentialAddress: '505 Beach Rd, Negombo',
      preferredDistrict: 'Gampaha',
    },
  });

  console.log('🏡 Seeding Circuit Bungalows, Caretakers, and Rooms...');

  // =========================================================================
  // CATEGORY 1: MINISTRY OF PUBLIC ADMINISTRATION
  // =========================================================================

  // 1. Nuwara Eliya - Old
  const neOld = await prisma.circuitBungalow.create({
    data: {
      name: 'Public Admin Holiday Bungalow - Nuwara Eliya (Old)',
      slug: 'pubadmin-nuwaraeliya-old',
      location: 'Near Economic Centre, Nuwara Eliya, Central Province',
      latitude: 6.9562,
      longitude: 80.7811,
      noOfRooms: 3,
      department: 'Ministry of Public Administration',
      capacity: 10,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      description: 'Traditional holiday bungalow near Nuwara Eliya Dedicated Economic Centre. Features spacious living quarters, fireplace, and scenic garden views.',
      rating: 4.6,
      amenities: ['Fireplace', 'Garden', 'Kitchen Facilities', 'Hot Water', 'Steward Service'],
      highlights: ['Near Economic Centre & Market', 'Gregory Lake (1.5 km)', 'Victoria Park access'],
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'Bungalow In-charge',
      address: 'Near Economic Centre, Nuwara Eliya',
      telephoneNo: '+94 52 2222363',
      emailAddress: 'pubadmin.ne@govsewana.lk',
      circuitBungalowId: neOld.id,
    },
  });

  const neOldR1 = await prisma.room.create({
    data: { roomNumber: 'OLD-101', roomType: RoomType.NON_AC, noOfBeds: 2, items: ['Double Bed', 'Geyser', 'Ensuite Bathroom'], price: 3000.0, circuitBungalowId: neOld.id },
  });
  await prisma.room.create({
    data: { roomNumber: 'OLD-102', roomType: RoomType.NON_AC, noOfBeds: 2, items: ['Double Bed', 'Wardrobe', 'Shared Bathroom'], price: 3000.0, circuitBungalowId: neOld.id },
  });
  await prisma.room.create({
    data: { roomNumber: 'OLD-103', roomType: RoomType.NON_AC, noOfBeds: 2, items: ['Twin Single Beds', 'Shared Bathroom'], price: 2500.0, circuitBungalowId: neOld.id },
  });

  // 2. Diyatalawa - Bungalow A
  const diyaA = await prisma.circuitBungalow.create({
    data: {
      name: 'Public Admin Holiday Bungalow - Diyatalawa (A)',
      slug: 'pubadmin-diyatalawa-a',
      location: 'Near Railway Station, Diyatalawa, Uva Province',
      latitude: 6.8197,
      longitude: 80.9575,
      noOfRooms: 4,
      department: 'Ministry of Public Administration',
      capacity: 11,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      description: 'Located in the cool garrison town of Diyatalawa, a short walk from the railway station.',
      rating: 4.7,
      amenities: ['Hot Water', 'Mountain Views', 'Dining Area', 'Kitchen'],
      highlights: ['300m from Diyatalawa Railway Station', 'Fox Hill Ground proximity', 'Near Adisham Monastery'],
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'Diyatalawa Station In-charge',
      address: 'Near Railway Station, Diyatalawa',
      telephoneNo: '+94 57 2229068',
      circuitBungalowId: diyaA.id,
    },
  });

  for (let i = 1; i <= 4; i++) {
    await prisma.room.create({
      data: { roomNumber: `DIY-A0${i}`, roomType: RoomType.NON_AC, noOfBeds: 2, items: ['Double Bed', 'Geyser', 'Armchair'], price: 3000.0, circuitBungalowId: diyaA.id },
    });
  }

  // 3. Bandarawela - Bungalow 1
  const ban1 = await prisma.circuitBungalow.create({
    data: {
      name: 'Public Admin Holiday Bungalow - Bandarawela 1',
      slug: 'pubadmin-bandarawela-1',
      location: 'Bindunuwewa Road, Bandarawela, Badulla District',
      latitude: 6.8322,
      longitude: 80.9856,
      noOfRooms: 3,
      department: 'Ministry of Public Administration',
      capacity: 7,
      image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
      description: 'Situated along Bindunuwewa Road, offering convenient access to Bandarawela town and surrounding tea country.',
      rating: 4.5,
      amenities: ['Living Lounge', 'Garden', 'Hot Water', 'Caretaker Services'],
      highlights: ['Located on Bindunuwewa Road', 'Near Bandarawela Town (1.2 km)', 'Easy travel to Lipton’s Seat'],
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'Bindunuwewa Caretaker',
      address: 'Bindunuwewa Road, Bandarawela',
      telephoneNo: '+94 57 2222553',
      circuitBungalowId: ban1.id,
    },
  });

  for (let i = 1; i <= 3; i++) {
    await prisma.room.create({
      data: { roomNumber: `BAN-0${i}`, roomType: RoomType.NON_AC, noOfBeds: 2, items: ['Double Bed', 'Geyser', 'Ensuite Bathroom'], price: 3000.0, circuitBungalowId: ban1.id },
    });
  }

  // 4. Jaffna Holiday Rest
  const jafRest = await prisma.circuitBungalow.create({
    data: {
      name: 'Jaffna Holiday Rest',
      slug: 'pubadmin-jaffna-holiday-rest',
      location: 'Nagadeepa Road, Velanai, Jaffna',
      latitude: 9.6469,
      longitude: 79.9181,
      noOfRooms: 25,
      department: 'Ministry of Public Administration',
      capacity: 50,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      description: '25-room holiday rest located on Velanai Island along Nagadeepa Road leading to Kurikadduwan Jetty.',
      rating: 4.5,
      amenities: ['AC Rooms', 'Dining Hall', 'Large Parking Lot', 'Security'],
      highlights: ['Direct route to Nagadeepa Jetty (KKD Jetty)', 'Kayts Causeway', 'Jaffna Fort (15 min drive)'],
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'Rest Manager',
      address: 'Nagadeepa Road, Velanai, Jaffna',
      telephoneNo: '+94 21 3004353 / 0774979252',
      circuitBungalowId: jafRest.id,
    },
  });

  const jafR1 = await prisma.room.create({
    data: { roomNumber: 'JAF-VIP-01', roomType: RoomType.AC, noOfBeds: 2, items: ['King Size Bed', 'AC', 'TV', 'Mini Fridge'], price: 3000.0, circuitBungalowId: jafRest.id },
  });
  await prisma.room.create({
    data: { roomNumber: 'JAF-AC-02', roomType: RoomType.AC, noOfBeds: 2, items: ['Queen Bed', 'AC', 'Attached Bath'], price: 2000.0, circuitBungalowId: jafRest.id },
  });
  await prisma.room.create({
    data: { roomNumber: 'JAF-STD-03', roomType: RoomType.NON_AC, noOfBeds: 2, items: ['Two Single Beds', 'Ceiling Fan'], price: 1500.0, circuitBungalowId: jafRest.id },
  });
  for (let i = 4; i <= 25; i++) {
    await prisma.room.create({
      data: { roomNumber: `JAF-STD-${i.toString().padStart(2, '0')}`, roomType: RoomType.NON_AC, noOfBeds: 2, items: ['Two Single Beds', 'Ceiling Fan'], price: 1500.0, circuitBungalowId: jafRest.id },
    });
  }

  // 5. Katharagama Holiday Rest (PubAdmin)
  const katRest = await prisma.circuitBungalow.create({
    data: {
      name: 'Katharagama Holiday Rest',
      slug: 'pubadmin-katharagama-holiday-rest',
      location: 'Kawantissaapura, Tissamaharama Road, Kataragama',
      latitude: 6.4181,
      longitude: 81.3328,
      noOfRooms: 27,
      department: 'Ministry of Public Administration',
      capacity: 60,
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      description: 'Rest complex situated in Kawantissaapura, serving pilgrims visiting Kataragama Sacred City.',
      rating: 4.6,
      amenities: ['AC / Non-AC Rooms', 'Dining Hall', 'Bus Parking', '24/7 Gate Guard'],
      highlights: ['Located in Kawantissaapura', '2 km to Kataragama Sacred City', 'Near Yala Safari gates'],
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'Manager - Katharagama Rest',
      address: 'Kawantissaapura, Tissamaharama',
      telephoneNo: '+94 47 3220999 / 0764666127',
      circuitBungalowId: katRest.id,
    },
  });

  const katR1 = await prisma.room.create({
    data: { roomNumber: 'KAT-AC-01', roomType: RoomType.AC, noOfBeds: 2, items: ['Double Bed', 'AC', 'Attached Bath'], price: 2000.0, circuitBungalowId: katRest.id },
  });
  for (let i = 2; i <= 27; i++) {
    await prisma.room.create({
      data: { roomNumber: `KAT-AC-${i.toString().padStart(2, '0')}`, roomType: RoomType.AC, noOfBeds: 2, items: ['Double Bed', 'AC', 'Attached Bath'], price: 2000.0, circuitBungalowId: katRest.id },
    });
  }

  // 6. Monaragala Holiday Rest
  const monRest = await prisma.circuitBungalow.create({
    data: {
      name: 'Monaragala Holiday Rest',
      slug: 'pubadmin-monaragala-holiday-rest',
      location: 'Kumbukkana Junction, Kumbukkana, Monaragala',
      latitude: 6.8831,
      longitude: 81.3852,
      noOfRooms: 8,
      department: 'Ministry of Public Administration',
      capacity: 16,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      description: 'Situated at Kumbukkana Junction along the Monaragala main road.',
      rating: 4.4,
      amenities: ['Air Conditioned Rooms', 'Parking', 'Dining Area'],
      highlights: ['Kumbukkana Junction', 'Kumbukkan Oya river bath spot', 'Monaragala Town (5 km)'],
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'Kumbukkana Caretaker',
      address: 'Kumbukkana Junction, Monaragala',
      telephoneNo: '+94 55 2270701 / 0702817576',
      circuitBungalowId: monRest.id,
    },
  });

  for (let i = 1; i <= 8; i++) {
    await prisma.room.create({
      data: { roomNumber: `MON-0${i}`, roomType: RoomType.AC, noOfBeds: 2, items: ['Double Bed', 'AC', 'Attached Bath'], price: 2000.0, circuitBungalowId: monRest.id },
    });
  }

  // =========================================================================
  // CATEGORY 2: LAND COMMISSIONER GENERAL'S DEPARTMENT (LCGD)
  // =========================================================================

  // 7. LCGD Nuwara Eliya (Meepilimana)
  const lcgdNE = await prisma.circuitBungalow.create({
    data: {
      name: "LCGD Circuit Bungalow - Nuwara Eliya (Meepilimana)",
      slug: 'lcgd-nuwaraeliya-meepilimana',
      location: 'Meepilimana, Nuwara Eliya',
      latitude: 6.9189,
      longitude: 80.8031,
      noOfRooms: 3,
      department: "Land Commissioner General's Department",
      capacity: 8,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      description: 'LCGD government bungalow in Meepilimana near Ambewela farm region.',
      rating: 4.8,
      amenities: ['Hot Water', 'Kitchen Facilities', 'Scenic Vistas'],
      highlights: ['Meepilimana Junction', 'Ambewela Dairy Farm (3 km)', 'Moon Plains viewpoint'],
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'Mr. Pradeep',
      address: "Gov. Circuit Bungalow LCGD, Meepilimana, Nuwara Eliya",
      telephoneNo: '077-3030366 / 074-3449283',
      circuitBungalowId: lcgdNE.id,
    },
  });

  const lcgdNeR1 = await prisma.room.create({
    data: { roomNumber: 'MEEP-01', roomType: RoomType.NON_AC, noOfBeds: 3, items: ['1 Double + 1 Single Bed', 'Geyser'], price: 1100.0, circuitBungalowId: lcgdNE.id },
  });
  for (let i = 2; i <= 3; i++) {
    await prisma.room.create({
      data: { roomNumber: `MEEP-0${i}`, roomType: RoomType.NON_AC, noOfBeds: 3, items: ['1 Double + 1 Single Bed', 'Geyser'], price: 1100.0, circuitBungalowId: lcgdNE.id },
    });
  }

  // 8. LCGD Katharagama
  const lcgdKat = await prisma.circuitBungalow.create({
    data: {
      name: "LCGD Circuit Bungalow - Katharagama",
      slug: 'lcgd-katharagama',
      location: 'New Kirivehera Road, Katharagama',
      latitude: 6.4225,
      longitude: 81.3321,
      noOfRooms: 3,
      department: "Land Commissioner General's Department",
      capacity: 12,
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      description: 'Conveniently situated along New Kirivehera Road, providing walking access to Kirivehera Stupa.',
      rating: 4.7,
      amenities: ['AC Room Available', 'Kitchen', 'Gated Parking Yard'],
      highlights: ['New Kirivehera Road', 'Walking distance to Kirivehera Stupa', 'Menik Ganga river walk'],
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'Mr. Anushka',
      address: "Gov. Circuit Bungalow LCGD, New Kirivehera Road, Katharagama",
      telephoneNo: '047-3487165 / 070-7777183',
      circuitBungalowId: lcgdKat.id,
    },
  });

  const lcgdKatR1 = await prisma.room.create({
    data: { roomNumber: 'KAT-01-AC', roomType: RoomType.AC, noOfBeds: 2, items: ['Double Bed', 'AC', 'Attached Bath'], price: 800.0, circuitBungalowId: lcgdKat.id },
  });
  for (let i = 2; i <= 3; i++) {
    await prisma.room.create({
      data: { roomNumber: `KAT-0${i}-AC`, roomType: RoomType.AC, noOfBeds: 2, items: ['Double Bed', 'AC', 'Attached Bath'], price: 800.0, circuitBungalowId: lcgdKat.id },
    });
  }

  // 9. LCGD Polonnaruwa
  const lcgdPol = await prisma.circuitBungalow.create({
    data: {
      name: "LCGD Circuit Bungalow - Polonnaruwa",
      slug: 'lcgd-polonnaruwa',
      location: 'Pothgul Place, New Town, Polonnaruwa',
      latitude: 7.9231,
      longitude: 81.0012,
      noOfRooms: 4,
      department: "Land Commissioner General's Department",
      capacity: 12,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      description: 'Located at Pothgul Place in New Town Polonnaruwa near Parakrama Samudra embankment.',
      rating: 4.6,
      amenities: ['AC Room Option', 'Garden', 'Spacious Veranda'],
      highlights: ['Pothgul Place, New Town', 'Parakrama Samudra bund (500m)', 'Pothgul Vehera ruins'],
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'Mr. Shantha',
      address: "Gov. Circuit Bungalow LCGD, Pothgul Place, New Town, Polonnaruwa",
      telephoneNo: '027-3274956 / 077-3030650',
      circuitBungalowId: lcgdPol.id,
    },
  });

  for (let i = 1; i <= 4; i++) {
    await prisma.room.create({
      data: { roomNumber: `POL-0${i}-AC`, roomType: RoomType.AC, noOfBeds: 2, items: ['Double Bed', 'AC'], price: 1500.0, circuitBungalowId: lcgdPol.id },
    });
  }

  // =========================================================================
  // CATEGORY 3: STATE TIMBER CORPORATION (STC)
  // =========================================================================

  // 10. STC Udawalawa
  const stcUda = await prisma.circuitBungalow.create({
    data: {
      name: 'STC Circuit Bungalow - Udawalawa (Thimbolketiya)',
      slug: 'stc-udawalawa-thimbolketiya',
      location: 'Thimbolketiya, Udawalawa, Sabaragamuwa Province',
      latitude: 6.4428,
      longitude: 80.8419,
      noOfRooms: 3,
      department: 'State Timber Corporation',
      capacity: 8,
      image: 'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=800&q=80',
      description: 'Shaded circuit bungalow located at Thimbolketiya near timber reserves, short drive from Udawalawe National Park.',
      rating: 4.6,
      amenities: ['Shaded Garden', 'Dining Area', 'Caretaker Cook'],
      highlights: ['Thimbolketiya Junction', 'Udawalawe Reservoir', 'Elephant Transit Home (10 min)'],
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'STC Circuit Caretaker',
      address: 'STC Circuit Bungalow, Thimbolketiya, Udawalawa',
      telephoneNo: '011-2866601',
      circuitBungalowId: stcUda.id,
    },
  });

  for (let i = 1; i <= 3; i++) {
    await prisma.room.create({
      data: { roomNumber: `STC-UDA-0${i}`, roomType: RoomType.NON_AC, noOfBeds: 2, items: ['Double Bed', 'Mosquito Net'], price: 2500.0, circuitBungalowId: stcUda.id },
    });
  }

  // 11. STC Nuwara Eliya (Kandapola)
  const stcKanda = await prisma.circuitBungalow.create({
    data: {
      name: 'STC Circuit Bungalow - Kandapola',
      slug: 'stc-kandapola-nuwaraeliya',
      location: 'Kandapola, Nuwara Eliya',
      latitude: 6.9882,
      longitude: 80.8251,
      noOfRooms: 3,
      department: 'State Timber Corporation',
      capacity: 10,
      image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
      description: 'High-altitude bungalow set in Kandapola amidst pine plantations.',
      rating: 4.8,
      amenities: ['Fireplace', 'Pine Plantation', 'Hot Water'],
      highlights: ['Kandapola Forest Reserve', 'Pedro Tea Estate nearby', 'High elevation town view'],
    },
  });

  await prisma.caretaker.create({
    data: {
      name: 'STC Kandapola Caretaker',
      address: 'STC Plantation, Kandapola, Nuwara Eliya',
      telephoneNo: '011-2866601',
      circuitBungalowId: stcKanda.id,
    },
  });

  for (let i = 1; i <= 3; i++) {
    await prisma.room.create({
      data: { roomNumber: `KAND-0${i}`, roomType: RoomType.NON_AC, noOfBeds: 2, items: ['King Bed', 'Heater'], price: 3500.0, circuitBungalowId: stcKanda.id },
    });
  }

  console.log('📅 Seeding Active Sample Bookings...');

  const futureFrom = new Date();
  futureFrom.setDate(futureFrom.getDate() + 7);
  const futureTo = new Date(futureFrom);
  futureTo.setDate(futureTo.getDate() + 2);

  await prisma.booking.create({
    data: {
      userId: govEmp1.id, // 245503B
      circuitBungalowId: neOld.id,
      roomId: neOldR1.id,
      fromDate: futureFrom,
      toDate: futureTo,
      status: BookingStatus.CONFIRMED,
      totalCost: 6000.0,
    },
  });

  await prisma.booking.create({
    data: {
      userId: govEmp2.id, // 245548P
      circuitBungalowId: lcgdKat.id,
      roomId: lcgdKatR1.id,
      fromDate: futureFrom,
      toDate: futureTo,
      status: BookingStatus.CONFIRMED,
      totalCost: 1600.0,
    },
  });

  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error executing seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });