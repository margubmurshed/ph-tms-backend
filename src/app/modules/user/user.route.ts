import { Router } from "express";
import { Role } from "./user.interface";
import { UserControllers } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import validateRequest from "../../../middlewares/validateRequest";
import checkAuth from "../../../middlewares/checkAuth";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
    "/register",
    multerUpload.single("file"),
    validateRequest(createUserZodSchema),
    UserControllers.createUser
);
router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    UserControllers.getAllUsers
);

router.get(
    "/me",
    checkAuth(...Object.values(Role)),
    UserControllers.getMe
);
router.patch(
    "/:id",
    checkAuth(...Object.values(Role)),
    multerUpload.single("file"),
    validateRequest(updateUserZodSchema),
    UserControllers.updateUser
)

export const UserRoutes = router;
