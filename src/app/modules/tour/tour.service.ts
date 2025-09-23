import AppError from "../../errorHelpers/AppError";
import { tourSearchableFields, tourTypeSearchableFields } from "./tour.constant";
import { ITour, ITourType } from "./tour.interface"
import { Tour, TourType } from "./tour.model"
import httpStatus from "http-status-codes";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";

const createTourType = async (payload: ITourType) => {
    const doesTourTypeExist = await TourType.findOne({ name: payload.name });
    if (doesTourTypeExist) {
        throw new AppError("Tour type already exists", httpStatus.BAD_REQUEST);
    }
    const tourType = await TourType.create(payload);
    return tourType
}

const getAllTourTypes = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(TourType.find(), query);
    const tourTypes = queryBuilder
        .filter()
        .search(tourTypeSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        tourTypes.build(),
        queryBuilder.getMetaData()
    ]);
    return { data, meta };
}

const getSingleTourType = async (tourTypeId: string) => {
    const tourType = await TourType.findById(tourTypeId);
    if (!tourType) {
        throw new AppError("Tour type not found", httpStatus.NOT_FOUND);
    }
    return {
        data: tourType
    };
}

const updateTourType = async (tourTypeId: string, payload: Partial<ITourType>) => {
    const doesTourTypeExist = await TourType.findById(tourTypeId);
    if (!doesTourTypeExist) {
        throw new AppError("Tour type not found", httpStatus.NOT_FOUND);
    }
    const duplicateTourType = await TourType.findOne({
        name: payload.name,
        _id: { $ne: tourTypeId }
    });
    if (duplicateTourType) {
        throw new AppError("A tour type with this name already exists", httpStatus.BAD_REQUEST);
    }

    const updatedTourType = await TourType.findByIdAndUpdate(tourTypeId, payload, {
        new: true,
        runValidators: true
    });

    return updatedTourType
}

const deleteTourType = async (tourTypeId: string) => {
    const doesTourTypeExist = await TourType.findById(tourTypeId);
    if (!doesTourTypeExist) {
        throw new AppError("Tour type not found", httpStatus.NOT_FOUND);
    }
    await TourType.findByIdAndDelete(tourTypeId);
    return null;
}


/* Tour Services------------------------- */

const createTour = async (payload: ITour) => {
    const doesTourExist = await Tour.findOne({ title: payload.title });

    if (doesTourExist) {
        throw new AppError("Tour with this title already exists", httpStatus.BAD_REQUEST);
    }

    const tour = await Tour.create(payload);
    return tour;
}



const getAllTours = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Tour.find().populate([
        {path: 'division', select: 'name'},
        {path: 'tourType', select: 'name'},
    ]), query);
    const tours = queryBuilder
        .filter()
        .search(tourSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        tours.build(),
        queryBuilder.getMetaData()
    ]);

    return {
        data,
        meta
    };
}

const getSingleTour = async (slug: string) => {
    const tour = await Tour.findOne({ slug });
    if (!tour) {
        throw new AppError("Tour not found", httpStatus.NOT_FOUND);
    }
    return {
        data: tour
    };
}

const updateTour = async (tourId: string, payload: Partial<ITour>) => {
    const doesTourExist = await Tour.findById(tourId);
    if (!doesTourExist) {
        throw new AppError("Tour not found", httpStatus.NOT_FOUND);
    }

    const existingImages = Array.isArray(doesTourExist.images) ? [...doesTourExist.images] : [];
    const isImageUploaded = Array.isArray(payload.images) && payload.images.length > 0;
    const uploadedImages = isImageUploaded ? [...payload.images as string[]] : [];

    let filteredOldImages = existingImages;

    // remove deleted urls
    if (Array.isArray(payload.deletedImages) && payload.deletedImages.length) {
        filteredOldImages = existingImages.filter((imageURL: string) => !payload.deletedImages?.includes(imageURL))
    }
    payload.images = [...filteredOldImages, ...uploadedImages];

    const updatedTour = await Tour.findByIdAndUpdate(tourId, payload, {
        new: true,
        runValidators: true
    });

    if (
        Array.isArray(payload.deletedImages) &&
        payload.deletedImages.length &&
        existingImages.length
    ) {
        const deletableImages = payload.deletedImages.filter((url) => existingImages.includes(url));
        if(deletableImages.length){
            await Promise.all(deletableImages.map(imageURL => deleteImageFromCloudinary(imageURL)));
        }
    }

    return updatedTour;
}

const deleteTour = async (tourId: string) => {
    const doesTourExist = await Tour.findById(tourId);
    if (!doesTourExist) {
        throw new AppError("Tour not found", httpStatus.NOT_FOUND);
    }
    await Tour.findByIdAndDelete(tourId);
    return null;
}

export const TourServices = {
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