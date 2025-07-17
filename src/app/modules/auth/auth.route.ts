import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import checkAuth from "../../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import validateRequest from "../../../middlewares/validateRequest";
import { resetPasswordZodSchema } from "./auth.validation";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin)
router.post("/logout", AuthControllers.logOut)
router.post("/refresh-token", AuthControllers.getNewAccessToken)
router.post("/reset-password", checkAuth(...Object.values(Role)), validateRequest(resetPasswordZodSchema), AuthControllers.resetPassword)

export const AuthRoutes = router;