import { QueryBuilder } from "../../../utils/QueryBuilder";
import AppError from "../../errorHelpers/AppError";
import { divisionSearchableFields } from "./division.constant";
import { IDivision } from "./division.interface";
import { Division } from "./division.model";
import httpStatus from "http-status-codes";

const createDivision = async (payload: IDivision) => {
    const { name } = payload;
    const doesDivisionNameExist = await Division.findOne({name})

    if (doesDivisionNameExist) {
        throw new AppError("Division name already exists", 400);
    }

    const division = await Division.create(payload);
    return division;
}

const getAllDivisions = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Division.find(), query);
    const divisions = queryBuilder.filter().search(divisionSearchableFields).fields().sort().paginate();

    const [data, meta] = await Promise.all([
        divisions.build(),
        queryBuilder.getMetaData()
    ]);

    return {data,meta};
}

const getSingleDivision = async (slug: string) => {
    const division = await Division.findOne({ slug });
    return {
        data: division
    };
}

const updateDivision = async (divisionId: string, payload: Partial<IDivision>) => {
    // dhaka divion exists => update to same dhaka division
    const doesDivisionExist = await Division.findById(divisionId);
    if (!doesDivisionExist) {
        throw new AppError("Division not found", httpStatus.NOT_FOUND);
    }

    const updatedDivision = await Division.findByIdAndUpdate(divisionId, payload, {
        new: true,
        runValidators: true
    });
    return updatedDivision;
}

const deleteDivision = async (divisionId: string) => {
    const doesDivisionExist = await Division.findById(divisionId);
    if (!doesDivisionExist) {
        throw new AppError("Division not found", httpStatus.NOT_FOUND);
    }

    await Division.findByIdAndDelete(divisionId);
    return null
}

export const DivisionServices = {
    createDivision,
    getAllDivisions,
    updateDivision,
    deleteDivision,
    getSingleDivision
}