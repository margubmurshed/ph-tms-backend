import { Request, Response } from "express";
import httpStatus from "http-status-codes"
import { UserServices } from "./user.service";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";

const createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User created successfully!",
        data: user
    })
})

const getAllUsers = catchAsync(async(req:Request, res:Response) => {
    const result = await UserServices.getAllUsers();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All users retrieved successfully!",
        data: result.data,
        meta: result.meta
    })
})

export const UserControllers = {
    createUser,
    getAllUsers
}