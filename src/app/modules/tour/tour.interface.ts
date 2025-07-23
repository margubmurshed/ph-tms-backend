import { Types } from "mongoose";

export interface ITourType {
    name: string;
}

export interface ITour{
    title: string;
    slug: string;
    images?: string[];
    description?: string;
    thumbnail?: string;
    costFrom?: number;
    location?: string;
    startDate?: Date;
    endDate?: Date;
    departureLocation?: string;
    arrivalLocation?: string;
    included?: string[];
    excluded?: string[];
    amenities?: string[];
    tourPlan?: string[];
    maxGuests?: number;
    minGuests?: number;
    division: Types.ObjectId; // Reference to the division
    tourType: Types.ObjectId; // Reference to the tour type
}