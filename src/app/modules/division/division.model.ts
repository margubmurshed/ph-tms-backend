import { model, Schema } from "mongoose";
import { IDivision } from "./division.interface";

const divisionSchema = new Schema<IDivision>({
    name: {
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
    description: {
        type: String,
        trim: true
    },
    thumbnail: {
        type: String,
        trim: true
    }
},{
    timestamps: true,
    versionKey: false
})

export const Division = model<IDivision>("Division", divisionSchema);