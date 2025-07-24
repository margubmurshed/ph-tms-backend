import mongoose from "mongoose";
import z from "zod";

export const zodObjectId = z
    .string()
    .refine(
        val => mongoose.isValidObjectId(val),
        { message: "Invalid ObjectId format" }
    )