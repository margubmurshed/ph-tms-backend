import { model, Schema } from "mongoose";
import { ITour, ITourType } from "./tour.interface";

const tourTypeSchema = new Schema<ITourType>({
    name: {type: String, required: true, unique: true, trim: true}
}, {
    timestamps: true,
    versionKey: false
})

export const TourType = model<ITourType>("TourType", tourTypeSchema);

const tourSchema = new Schema<ITour>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    images: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        trim: true
    },
    thumbnail: {
        type: String,
        trim: true
    },
    costFrom: {
        type: Number,
        min: 0
    },
    location: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    included: {
        type: [String],
        default: []
    },
    excluded: {
        type: [String],
        default: []
    },
    amenities: {
        type: [String],
        default: []
    },
    tourPlan: {
        type: [String],
        default: []
    },
    maxGuests: {
        type: Number,
        min: 1
    },
    minGuests: {
        type: Number,
        min: 1
    },
    division: {
        type: Schema.Types.ObjectId,
        ref: "Division",
        required: true
    },
    tourType: {
        type: Schema.Types.ObjectId,
        ref: "TourType",
        required: true
    }
},{
    timestamps: true,
    versionKey: false
})

export const Tour = model<ITour>("Tour", tourSchema);