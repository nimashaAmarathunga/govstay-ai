export type Bungalow = {
  id: number;
  slug: string;
  title: string;
  location: string;
  price: string;
  image: string;
  rating: string;
  amenities: string[];
  description: string;
  highlights: string[];
  propertyType: string;
  capacity: string;
  rooms: string;
  checkIn: string;
};

export const BUNGALOWS: Bungalow[] = [
  {
    id: 1,
    slug: "nuwara-eliya-rest-house",
    title: "Nuwara Eliya Rest House",
    location: "Nuwara Eliya, Central Province",
    price: "Rs. 18,500",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHtjFwAj-lsUvWvMM4b5izQJgtLPrniT_NaZ-YiGrw33YJ8RniIPjmTjSUw8FYJuKsHIvNV-bCVhSpjQmZXftPv6MvjkVYu--XWXSnEEOrYKb8kSgvMlvP9n0aFegBq7P46C_SlEcyZhVnfmyJVGXybDENXRBVKIL-4GFglCZGhqGfITPMZQGP9OXoJAFn19ilHm-WduLmEUl3IEbSe6lBKWeRfdJXvKUpJKf1nAQ1PoM31nZXCwnJ",
    rating: "4.8",
    amenities: ["Garden View", "Fireplace", "Steward Service"],
    description: "Set among the cool hills of Nuwara Eliya, this welcoming government rest house combines classic colonial character with peaceful garden views. It is a comfortable base for exploring the town, tea country, and nearby walking trails.",
    highlights: ["Quiet garden setting", "Classic fireplace lounge", "Close to Gregory Lake"],
    propertyType: "Circuit bungalow",
    capacity: "Up to 6 guests",
    rooms: "3 bedrooms",
    checkIn: "From 2:00 PM",
  },
  {
    id: 2,
    slug: "galle-fort-heritage-bungalow",
    title: "Galle Fort Heritage Bungalow",
    location: "Galle, Southern Province",
    price: "Rs. 22,000",
    image: "https://images.unsplash.com/photo-1542314831-c6a4d14cdce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: "4.8",
    amenities: ["Ocean View", "Historical", "AC"],
    description: "Stay close to the ramparts and ocean breeze in a heritage bungalow shaped by Galle's unmistakable coastal history. Restored details, cool interiors, and an easy walk to the fort make this a memorable southern escape.",
    highlights: ["Walkable to Galle Fort", "Heritage architecture", "Air-conditioned rooms"],
    propertyType: "Heritage bungalow",
    capacity: "Up to 4 guests",
    rooms: "2 bedrooms",
    checkIn: "From 2:00 PM",
  },
  {
    id: 3,
    slug: "kandy-lake-view-circuit",
    title: "Kandy Lake View Circuit",
    location: "Kandy, Central Province",
    price: "Rs. 15,000",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: "4.8",
    amenities: ["Lake View", "AC", "WiFi"],
    description: "Enjoy an elevated view over Kandy Lake from this centrally located circuit bungalow. With practical modern comforts and quick access to the city's cultural landmarks, it suits both short visits and relaxed family stays.",
    highlights: ["Panoramic lake outlook", "Fast WiFi included", "Near Temple of the Tooth"],
    propertyType: "City circuit bungalow",
    capacity: "Up to 4 guests",
    rooms: "2 bedrooms",
    checkIn: "From 2:00 PM",
  },
  {
    id: 4,
    slug: "yala-safari-lodge",
    title: "Yala Safari Lodge (Gov)",
    location: "Yala, Southern Province",
    price: "Rs. 25,000",
    image: "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: "4.8",
    amenities: ["Safari Access", "Full Board", "Guide"],
    description: "Make an early start for Yala National Park from this government safari lodge. Full-board hospitality, guided excursions, and generous outdoor spaces make it an ideal base for a focused wildlife break.",
    highlights: ["Easy park access", "Full-board stay", "Experienced local guide"],
    propertyType: "Safari lodge",
    capacity: "Up to 6 guests",
    rooms: "3 bedrooms",
    checkIn: "From 2:00 PM",
  },
];

export function getBungalowBySlug(slug: string) {
  return BUNGALOWS.find((bungalow) => bungalow.slug === slug);
}
