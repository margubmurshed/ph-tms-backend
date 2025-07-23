import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { DivisionServices } from "./division.service";

const createDivision = catchAsync(async(req:Request, res:Response) => {
    const division = await DivisionServices.createDivision(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Division created successfully!",
        data: division
    })
});

const getAllDivisions = catchAsync(async(req:Request, res:Response) => {
    const query = req.query as Record<string, string>;
    const result = await DivisionServices.getAllDivisions(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All divisions retrieved successfully!",
        data: result.data,
        meta: result.meta
    })
});

const getSingleDivision = catchAsync(async(req:Request, res:Response) => {
    const slug = req.params.slug;
    const result = await DivisionServices.getSingleDivision(slug);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Division retrieved successfully!",
        data: result.data,
    })
});

const updateDivision = catchAsync(async(req: Request, res: Response) => {
    const divisionId = req.params.id;
    const result = await DivisionServices.updateDivision(divisionId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Division updated successfully!",
        data: result
    })
})

const deleteDivision = catchAsync(async(req: Request, res: Response) => {
    const divisionId = req.params.id;
    const result = await DivisionServices.deleteDivision(divisionId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Division deleted successfully!",
        data: result
    })
})

export const DivisionController = {
    createDivision,
    getAllDivisions,
    updateDivision,
    deleteDivision,
    getSingleDivision
}