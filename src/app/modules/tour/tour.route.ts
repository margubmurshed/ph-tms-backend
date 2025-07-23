import { Router } from "express";
import { TourControllers } from "./tour.controller";
import checkAuth from "../../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import validateRequest from "../../../middlewares/validateRequest";
import { createTourTypeZodSchema, createTourZodSchema, updateTourZodSchema } from "./tour.validation";

const router = Router();

// ----------------- Tour Types Routes -----------------
router.post("/create-tour-type", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createTourTypeZodSchema), TourControllers.createTourType);
router.get("/tour-types", TourControllers.getAllTourTypes);
router.get("/tour-types/:id", TourControllers.getSingleTourType);
router.patch("/tour-types/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createTourTypeZodSchema), TourControllers.updateTourType);
router.delete("/tour-types/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), TourControllers.deleteTourType);

// ----------------- Tours Routes -----------------
router.post("/create", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createTourZodSchema) ,TourControllers.createTour);
router.get("/", TourControllers.getAllTours);
router.get("/:id", TourControllers.getSingleTour);
router.patch("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(updateTourZodSchema) ,TourControllers.updateTour);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), TourControllers.deleteTour);

export const TourRoutes = router;