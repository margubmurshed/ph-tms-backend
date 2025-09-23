import z from "zod";

export const createDivisionZodSchema = z.object({
    name: z
        .string({ invalid_type_error: "Name must be string" })
        .min(5, { message: "Name must be at least 5 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." }),
    description: z
        .string({ invalid_type_error: "Description must be string" })
        .max(500, { message: "Description cannot exceed 500 characters." })
        .optional(),
    thumbnail: z
        .string({ invalid_type_error: "Thumbnail must be string" })
        .url({ message: "Thumbnail must be a valid URL." })
        .optional(),
})

export const updateDivisionZodSchema = createDivisionZodSchema.partial();