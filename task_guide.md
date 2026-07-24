# GovStay AI - Development Task Guide

Welcome to the GovStay AI development team! This guide breaks down the remaining work into three distinct roles so that everyone can work efficiently without stepping on each other's toes. 

## 📌 Current System Status
*   **Data is ready:** We have the initial data filled in and ready to be used by the system.
*   **Agent module (Reserved):** The agent dashboard (where bookings are reviewed and confirmed) is already assigned and will be developed separately. You do not need to worry about this part.
*   **Authentication (Temporary Setup):** We are skipping a complex login/registration system for now. Instead, we will use a simple dropdown or button group in the top header. This will let you "switch" between being a normal user, an admin, or an agent. Depending on who is selected in the header, the website should only show the menus and tabs relevant to that specific person.

---

## 📐 General Guidelines for All Developers
To make sure our project stays healthy and easy to read, please follow these rules:
1.  **Write Clean Code:** Keep your files small and focused. If a file is getting too long, see if you can split parts of it into smaller, reusable pieces.
2.  **Keep Folders Organized:** Group related files together. For example, keep all booking-related visual pieces in a `booking` folder. Don't throw everything into one giant folder.
3.  **Name Things Clearly:** Use names that make sense. A button that submits a booking should be named something like `SubmitBookingButton`, not just `Button2`.
4.  **Communicate:** Since your features will eventually connect to each other, talk to your team if you need to change how data is shared.

---

## 👩‍💻 Sulashee: The Booking & Reservation Flow
**Goal:** Allow users to look at a bungalow, pick their dates, and submit a booking request without double-booking.

**Your Tasks:**
*   **Bungalow Details Page:** When a user clicks on a bungalow, show them the details of that place, including the specific rooms available inside it.
*   **Calendar & Date Selection:** Add a calendar where users can pick their check-in and check-out dates.
*   **Prevent Double Booking:** Make sure the system checks if the selected dates are already taken. If they are, prevent the user from selecting them.
*   **Payment Slip Upload:** During the booking process, give the user an option to upload a picture or PDF of their payment slip.
*   **Submit Request:** Wrap all this information up and save it as a "Pending Booking" so the agent can review it later.

---

## 👨‍💻 Pawani: Admin Dashboard (Data Management)
**Goal:** Give administrators a behind-the-scenes area to manage the bungalows and rooms available in the system.

**Your Tasks:**
*   **Admin Layout:** Create a simple layout that is only visible when "Admin" is selected in the top header login.
*   **Add/Edit Bungalows:** Create forms where an admin can add a new bungalow (name, description, pictures) or update an existing one.
*   **Add/Edit Rooms:** Create forms to add specific rooms inside those bungalows, including their capacity and price.
*   **View All Properties:** Create a list or table where the admin can see everything they have added to the system and delete items if necessary.

---

## 🧑‍💻 Tharushi: User Dashboard, Simple Login & Map Features
**Goal:** Build a simple login mechanism so developers can test the system, give users a place to track their activity, and show bungalows and nearby tourist attractions on a map.

**Your Tasks:**
*   **Simple Login Setup (For Testing):** Create a basic login or role-switching mechanism (like a dropdown in the top header). This allows everyone to switch between "User", "Admin", and "Agent" roles to test the system and see only their specific tabs.
*   **User Dashboard & My Bookings:** Create a private area just for users. Here, show a list of all the bookings a user has made and their status ("Pending", "Confirmed", or "Rejected"). This is crucial to check if the simple login and booking system are working together correctly.
*   **Interactive Bungalow Map:** Add a map view where users can see exactly where the bungalows are located.
*   **Nearby Tourist Places:** When a user clicks on a bungalow on the map, show them nearby tourist attractions or places of interest. You can use a free, open external API to find and display these nearby places.

---

## 🗄️ Database Sample Data (Reference)
Here is a quick look at some of the actual data in our system (from the database). Use this as a reference when building your features so you know exactly what fields are available to work with.

### Users (users)
| Name | Username | Password | Role | Emp ID |
| :--- | :--- | :--- | :--- | :--- |
| Dr. K. L. Perera | superadmin | adminpassword123 | SUPER_ADMIN | (null) |
| Sunil Wickramasinghe | pubadmin_admin | deptpassword123 | DEPT_ADMIN | (null) |
| Kamani Jayawardena | lands_admin | deptpassword123 | DEPT_ADMIN | (null) |
| Ravidu Rajapaksha | ravidu_245503b | userpassword123 | GOV_EMPLOYEE | 245503B |
| Anura Fernando | anura_245548p | userpassword123 | GOV_EMPLOYEE | 245548P |
| Champa De Silva | champa_245516r | userpassword123 | GOV_EMPLOYEE | 245516R |
| Lalith Gunawardena | lalith_245506l | userpassword123 | GOV_EMPLOYEE | 245506L |
| Kasun Rathnayake | kasun_public | publicpassword123 | PUBLIC_USER | (null) |

### Circuit Bungalows (circuit_bungalows)
| Name | Department | Capacity | Price | Location |
| :--- | :--- | :--- | :--- | :--- |
| Public Admin Holiday Bungalow - Nuwara Eliya (Old) | Public Administration | 10 | 5000 | Nuwara Eliya |
| Public Admin Holiday Bungalow - Diyatalawa (A) | Public Administration | 8 | 4000 | Diyatalawa |
| Jaffna Holiday Rest | Public Administration | 12 | 6000 | Jaffna |
| LCGD Circuit Bungalow - Nuwara Eliya | LCGD | 6 | 3500 | Nuwara Eliya |
| STC Circuit Bungalow - Udawalawa | STC | 8 | 4500 | Udawalawa |

### Rooms (rooms)
| Room Number | Room Type | No Of Beds | Bungalow |
| :--- | :--- | :--- | :--- |
| 101 | AC | 2 | Nuwara Eliya (Old) |
| 102 | NON_AC | 3 | Nuwara Eliya (Old) |
| A1 | NON_AC | 2 | Diyatalawa (A) |

### Bookings (bookings)
| Booking ID | User | Bungalow | From Date | To Date | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| bk_001 | Kasun Rathnayake | Nuwara Eliya (Old) | 2026-08-10 | 2026-08-12 | CONFIRMED |
| bk_002 | Kasun Rathnayake | Diyatalawa (A) | 2026-08-15 | 2026-08-17 | CANCELLED |

---

## 📁 Project Folder Structure
Here is the exact folder structure you will be working with. Since we are using Next.js, both our frontend and backend live in this same project.

```text
govstay-ai/
├── app/                  # Frontend pages & Backend APIs live here
│   ├── api/              # BACKEND: All API endpoints (e.g., /api/bookings)
│   ├── browse/           # FRONTEND: The Bungalow browsing page
│   ├── dashboard/        # FRONTEND: Admin and User dashboards
│   └── page.tsx          # FRONTEND: The main landing page
├── components/           # Reusable UI pieces (Buttons, Navbars, Cards)
├── lib/                  # Shared helper functions and database connection
│   └── prisma.ts         # The main database connection file
└── prisma/               # Database structure
    ├── schema.prisma     # Where all our database tables are defined
    └── seed.ts           # The sample data file
```

## 🔌 How to Connect Frontend and Backend
To make the system work, the visual pages (Frontend) need to communicate with the database (Backend). Here is a simple guide on how to do that in Next.js.

### 1. The Backend (Creating the API)
When you need to get data from the database or save new data, you create a route inside `app/api/`.
*   Create a file called `route.ts` inside a new folder, for example: `app/api/bookings/route.ts`.
*   Inside this file, you write a function like `GET` (to fetch data) or `POST` (to save data) using our `prisma` database connection.
*   **Example:**
    ```typescript
    // File: app/api/bookings/route.ts
    import { NextResponse } from 'next/server';
    import { prisma } from '@/lib/prisma';

    export async function POST(request: Request) {
      const data = await request.json();
      // Save data to database using Prisma
      const newBooking = await prisma.booking.create({ data });
      return NextResponse.json(newBooking);
    }
    ```

### 2. The Frontend (Calling the API)
In your React components (the UI), you will call that API endpoint using the standard `fetch` command.
*   Use a "Client Component" (by adding `"use client";` at the very top of your file) if you need buttons and interactivity.
*   **Example:**
    ```typescript
    // File: app/browse/BookingForm.tsx
    "use client";

    export default function BookingForm() {
      const handleBooking = async () => {
        // Send data to our backend API
        const response = await fetch('/api/bookings', {
          method: 'POST',
          body: JSON.stringify({ /* booking data here */ })
        });
        
        if (response.ok) {
          alert("Booking successful!");
        }
      };

      return <button onClick={handleBooking}>Book Now</button>;
    }
    ```

**Summary:** Write your database code in `app/api/`, and call those URLs (`/api/...`) from your buttons and forms inside your `app/` pages!
