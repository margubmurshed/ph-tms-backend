import z from "zod";

export const createTourTypeZodSchema = z.object({
    name: z
        .string({ invalid_type_error: "Name must be string" })
        .min(5, { message: "Name must be at least 5 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." })
})

export const createTourZodSchema = z.object({
    title: z
        .string({ invalid_type_error: "Title must be a string" })
        .min(5, { message: "Title must be at least 5 characters long." })
        .max(100, { message: "Title cannot exceed 100 characters." }),
    images: z
        .array(z.string().url({ message: "Each image must be a valid URL" }))
        .optional(),
    description: z
        .string({ invalid_type_error: "Description must be a string" })
        .max(500, { message: "Description cannot exceed 500 characters." })
        .optional(),
    thumbnail: z
        .string({ invalid_type_error: "Thumbnail must be a string" })
        .url({ message: "Thumbnail must be a valid URL" })
        .optional(),
    costFrom: z
        .number({ invalid_type_error: "Cost must be a number" })
        .min(0, { message: "Cost must be a positive number." })
        .optional(),
    location: z
        .string({ invalid_type_error: "Location must be a string" })
        .max(100, { message: "Location cannot exceed 100 characters." })
        .optional(),
    startDate: z
        .string({ invalid_type_error: "Start date must be a string in ISO format." })
        .refine((val) => !isNaN(Date.parse(val)), { message: "Start date must be a string in ISO format." })
        .transform((val) => new Date(val))
        .optional(),
    endDate: z
        .string({ invalid_type_error: "End date must be a string in ISO format" })
        .refine((val) => !isNaN(Date.parse(val)), { message: "End date must be a string in ISO format." })
        .transform((val) => new Date(val))
        .optional(),
    departureLocation: z
        .string({ invalid_type_error: "Departure location must be a string" })
        .max(100, { message: "Departure location cannot exceed 100 characters." })
        .optional(),
    arrivalLocation: z
        .string({ invalid_type_error: "Arrival location must be a string" })
        .max(100, { message: "Arrival location cannot exceed 100 characters." })
        .optional(),
    included: z
        .array(z.string().max(100, { message: "Each included item cannot exceed 100 characters." }))
        .optional(),
    excluded: z
        .array(z.string().max(100, { message: "Each excluded item cannot exceed 100 characters." }))
        .optional(),
    amenities: z
        .array(z.string().max(100, { message: "Each amenity cannot exceed 100 characters." }))
        .optional(),
    minGuests: z
        .number({ invalid_type_error: "Minimum guests must be a number" })
        .min(1, { message: "Minimum guests must be at least 1." })
        .optional(),
    maxGuests: z
        .number({ invalid_type_error: "Maximum guests must be a number" })
        .min(1, { message: "Maximum guests must be at least 1." })
        .optional(),
    tourPlan: z
        .array(z.string().max(500, { message: "Each tour plan item cannot exceed 500 characters." }))
        .optional(),
    tourType: z
        .string({ invalid_type_error: "Tour type must be a string" })
        .min(24, { message: "Tour type ID must be at least 24 characters long." })
        .max(24, { message: "Tour type ID cannot exceed 24 characters." }),
    division: z
        .string({ invalid_type_error: "Division must be a string" })
        .min(24, { message: "Division ID must be at least 24 characters long." })
        .max(24, { message: "Division ID cannot exceed 24 characters." })
})

export const updateTourZodSchema = createTourZodSchema
.partial()
.omit({ tourType: true, division: true })
.extend({
    deletedImages: z.array(z.string()).optional()
})
.strip();
// strips extra fields silently;