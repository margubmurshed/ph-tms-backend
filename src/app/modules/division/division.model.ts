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
}, {
    timestamps: true,
    versionKey: false
})

divisionSchema.pre("validate", async function (next) {
    if (this.isModified("name")) {
        // Generate a unique slug based on the name
        // e.g. "Dhaka Division" => "dhaka-division"
        const baseSlug = this.name.toLowerCase().split(' ').join('-');
        let slug = `${baseSlug}-division`;
        let counter = 0;

        while (await Division.exists({ slug })) {
            counter++;
            slug = `${slug}-${counter}`;
        }
        this.slug = slug;
    }

    next();
})

divisionSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate() as Partial<IDivision>;
    if (update.name) {
        // Generate a unique slug based on the new name
        const baseSlug = update.name.toLowerCase().split(' ').join('-');
        let slug = `${baseSlug}-division`;
        let counter = 0;

        while (await Division.exists({ slug })) {
            counter++;
            slug = `${baseSlug}-${counter}`;
        }
        update.slug = slug;
    }
    this.setUpdate(update);

    next();
})

export const Division = model<IDivision>("Division", divisionSchema);