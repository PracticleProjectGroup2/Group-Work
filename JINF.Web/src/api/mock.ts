import type { Category, Claim, ItemReport, Location } from "./types";

// Sample data used until the API endpoints are ready (VITE_USE_MOCKS=true)

export const categories: Category[] = [
  { id: 1, name: "Electronics", isSensitive: false },
  { id: 2, name: "Keys", isSensitive: false },
  { id: 3, name: "Clothing & bags", isSensitive: false },
  { id: 4, name: "Books & stationery", isSensitive: false },
  { id: 5, name: "Student card", isSensitive: true },
  { id: 6, name: "ID document", isSensitive: true },
  { id: 7, name: "Bank card", isSensitive: true },
];

export const locations: Location[] = [
  { id: 1, name: "Reception" },
  { id: 2, name: "Library" },
  { id: 3, name: "Cafeteria" },
  { id: 4, name: "Lab 1" },
  { id: 5, name: "Lab 2" },
  { id: 6, name: "Lecture room 3" },
  { id: 7, name: "Parking area" },
];

const cat = (id: number) => categories.find((c) => c.id === id)!;
const loc = (id: number) => locations.find((l) => l.id === id)!;

export const items: ItemReport[] = [
  { id: 42, reportType: "Found", title: "Black Lenovo charger", description: "65W USB-C charger left plugged in at the back of the lab.", category: cat(1), location: loc(4), eventDate: "2026-10-21", status: "Open", createdAt: "2026-10-21T10:12:00Z", reporterId: "u2" },
  { id: 41, reportType: "Found", title: "Blue hoodie", description: "Navy blue hoodie, size M, small paint mark on the sleeve.", category: cat(3), location: loc(3), eventDate: "2026-10-20", status: "Open", createdAt: "2026-10-20T13:40:00Z", reporterId: "u3" },
  { id: 40, reportType: "Found", title: "Student card", description: "Handed in at reception.", category: cat(5), location: loc(2), eventDate: "2026-10-20", status: "Open", createdAt: "2026-10-20T09:05:00Z", reporterId: "u2" },
  { id: 39, reportType: "Lost", title: "Casio calculator", description: "fx-991ZA PLUS with my initials scratched on the back.", category: cat(4), location: loc(6), eventDate: "2026-10-19", status: "Open", createdAt: "2026-10-19T15:20:00Z", reporterId: "u1" },
  { id: 38, reportType: "Found", title: "Car keys with red keyring", description: "Toyota key with a red bottle-opener keyring.", category: cat(2), location: loc(7), eventDate: "2026-10-18", status: "Claimed", createdAt: "2026-10-18T07:50:00Z", reporterId: "u3" },
  { id: 37, reportType: "Found", title: "Wireless earbuds case", description: "White case, no earbuds inside.", category: cat(1), location: loc(2), eventDate: "2026-10-16", status: "Returned", createdAt: "2026-10-16T11:30:00Z", reporterId: "u2" },
  { id: 36, reportType: "Lost", title: "Grey backpack", description: "Grey Herschel backpack with a laptop sleeve.", category: cat(3), location: loc(3), eventDate: "2026-10-15", status: "Open", createdAt: "2026-10-15T12:10:00Z", reporterId: "u1" },
];

export const claims: Claim[] = [
  { id: 7, itemReportId: 42, itemTitle: "Black Lenovo charger", claimantName: "Sipho N.", proofOfOwnership: "There's a strip of green tape near the plug end.", status: "Pending", createdAt: "2026-10-22T08:15:00Z" },
  { id: 6, itemReportId: 41, itemTitle: "Blue hoodie", claimantName: "Megan V.", proofOfOwnership: "Paint mark on the left sleeve from art class, tag cut out.", status: "Pending", createdAt: "2026-10-21T16:02:00Z" },
  { id: 5, itemReportId: 38, itemTitle: "Car keys with red keyring", claimantName: "Johan B.", proofOfOwnership: "Toyota Corolla key, keyring is a bottle opener.", status: "Approved", createdAt: "2026-10-18T10:00:00Z" },
];
