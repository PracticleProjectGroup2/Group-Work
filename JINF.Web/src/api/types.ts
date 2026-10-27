// Mirrors the models in JINF.Api/Models. Enums are sent as strings, which needs
// JsonStringEnumConverter on the API side (otherwise they arrive as 0/1/2).

export type ReportType = "Lost" | "Found";
export type ItemStatus = "Open" | "Claimed" | "Returned" | "Archived";
export type ClaimStatus = "Pending" | "Approved" | "Rejected";
export type Role = "User" | "Admin";

export interface Category {
  id: number;
  name: string;
  isSensitive: boolean;
}

export interface Location {
  id: number;
  name: string;
}


export interface ItemReport {
    id: number;
    reportType: ReportType;
    title: string;
    description: string;

    // Nested fields used by the frontend
    category: Category;
    location: Location;

    // Flat fields returned by the backend
    categoryId?: number;
    categoryName?: string;
    locationId?: number;
    locationName?: string;

    eventDate: string;
    status: ItemStatus;
    createdAt: string;
    photoUrl?: string;
    reporterId: string;
}

export interface Claim {
  id: number;
  itemReportId: number;
  itemTitle: string;
  claimantName: string;
  proofOfOwnership: string;
  status: ClaimStatus;
  createdAt: string;
    decisionReason?: string;
    itemStatus?: ItemStatus;
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    roles?: Role[];
}


export interface ItemFilters {
  q?: string;
  type?: ReportType;
  categoryId?: number;
  locationId?: number;
}

export interface NewReport {
  reportType: ReportType;
  title: string;
  description: string;
  categoryId: number;
  locationId: number;
  eventDate: string;
  photo?: File;
}

export interface Stats {
  open: number;
  claimed: number;
  returned: number;
  pendingClaims: number;
}
