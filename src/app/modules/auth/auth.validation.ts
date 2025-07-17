import z from "zod";

export const resetPasswordZodSchema = z.object({
    oldPassword: z
        .string({ invalid_type_error: "Old Password must be string" })
        .min(8, { message: "Old Password must be at least 8 characters long." })
        .regex(/^(?=.*[A-Z])/, {
            message: "Old Password must contain at least 1 uppercase letter.",
        })
        .regex(/^(?=.*[!@#$%^&*])/, {
            message: "Old Password must contain at least 1 special character.",
        })
        .regex(/^(?=.*\d)/, {
            message: "Old Password must contain at least 1 number.",
        }),
    newPassword: z
        .string({ invalid_type_error: "New Password must be string" })
        .min(8, { message: "New Password must be at least 8 characters long." })
        .regex(/^(?=.*[A-Z])/, {
            message: "New Password must contain at least 1 uppercase letter.",
        })
        .regex(/^(?=.*[!@#$%^&*])/, {
            message: "New Password must contain at least 1 special character.",
        })
        .regex(/^(?=.*\d)/, {
            message: "New Password must contain at least 1 number.",
        })
})