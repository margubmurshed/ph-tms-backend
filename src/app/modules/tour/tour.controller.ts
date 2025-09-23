import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { TourServices } from "./tour.service";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { ITour } from "./tour.interface";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";


/* Tour Type Controllers ------------------------------------------------*/
const createTourType = catchAsync(async (req: Request, res: Response) => {
    const tourType = await TourServices.createTourType(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Tour type created successfully!",
        data: tourType
    });
})

const getAllTourTypes = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const result = await TourServices.getAllTourTypes(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All tour types retrieved successfully!",
        data: result.data,
        meta: result.meta
    });
})

const getSingleTourType = catchAsync(async (req: Request, res: Response) => {
    const tourTypeId = req.params.id;
    const result = await TourServices.getSingleTourType(tourTypeId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour type retrieved successfully!",
        data: result.data,
    });
})

const updateTourType = catchAsync(async (req: Request, res: Response) => {
    const tourTypeId = req.params.id;
    const updatedTourType = await TourServices.updateTourType(tourTypeId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour type updated successfully!",
        data: updatedTourType
    });
})

const deleteTourType = catchAsync(async (req: Request, res: Response) => {
    const tourTypeId = req.params.id;
    const result = await TourServices.deleteTourType(tourTypeId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour type deleted successfully!",
        data: result
    });
})

/* Tour Controllers ----------------------------------------------------------*/
const createTour = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as Record<string, Express.Multer.File[]>
    const thumbnailFile = files.thumbnail?.[0]
    const imageFiles = files.images || []

    const payload: ITour = {
        ...req.body,
        images: imageFiles.map(file => file.path),
        thumbnail: thumbnailFile ? thumbnailFile.path : "",
        user: (req.user as JwtPayload).userId
    }

    if (!payload.images || payload.images.length === 0) {
        throw new AppError("At least one image is required for the tour.", httpStatus.BAD_REQUEST);
    }
    if (!payload.thumbnail) {
        throw new AppError("Thumbnail image is required for the tour.", httpStatus.BAD_REQUEST);
    }

    const tour = await TourServices.createTour(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Tour created successfully!",
        data: tour
    });
})

const getAllTours = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const result = await TourServices.getAllTours(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All tours retrieved successfully!",
        data: result.data,
        meta: result.meta
    });
})
const getSingleTour = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await TourServices.getSingleTour(slug);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All tours retrieved successfully!",
        data: result.data
    });
})

const updateTour = catchAsync(async (req: Request, res: Response) => {
    const tourId = req.params.id;
    const payload: Partial<ITour> = {
        ...req.body,
        images: (req.files as Express.Multer.File[]).map(file => file.path)
    }
    const updatedTour = await TourServices.updateTour(tourId, payload);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour updated successfully!",
        data: updatedTour
    });
})

const deleteTour = catchAsync(async (req: Request, res: Response) => {
    const tourId = req.params.id;
    const result = await TourServices.deleteTour(tourId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour deleted successfully!",
        data: result
    });
})

export const TourControllers = {
    createTourType,
    getAllTourTypes,
    getSingleTourType,
    updateTourType,
    deleteTourType,
    createTour,
    getAllTours,
    updateTour,
    deleteTour,
    getSingleTour
}