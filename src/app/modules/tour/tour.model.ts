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
        unique: true,
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
    departureLocation: {
        type: String,
        trim: true
    },
    arrivalLocation: {
        type: String,
        trim: true
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

tourSchema.pre("validate", async function (next) {
    if (this.isModified("title")) {
        // Generate a unique slug based on the title
        // e.g. "Dhaka Division" => "dhaka-division"
        const baseSlug = this.title.toLowerCase().split(' ').join('-');
        let slug = `${baseSlug}`;
        let counter = 0;

        while (await Tour.exists({ slug })) {
            counter++;
            slug = `${slug}-${counter}`;
        }
        this.slug = slug;
    }
    next();
})

tourSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate() as Partial<ITour>;
    if (update.title) {
        // Generate a unique slug based on the new title
        const baseSlug = update.title.toLowerCase().split(' ').join('-');
        let slug = `${baseSlug}`;
        let counter = 0;

        while (await Tour.exists({ slug })) {
            counter++;
            slug = `${baseSlug}-${counter}`;
        }
        update.slug = slug;
    }
    this.setUpdate(update);

    next();
})

export const Tour = model<ITour>("Tour", tourSchema);