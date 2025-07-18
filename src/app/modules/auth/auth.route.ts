import { Request, Response, Router } from "express";
import { AuthControllers } from "./auth.controller";
import checkAuth from "../../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import validateRequest from "../../../middlewares/validateRequest";
import { resetPasswordZodSchema } from "./auth.validation";
import passport from "passport";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin)
router.post("/logout", AuthControllers.logOut)
router.post("/refresh-token", AuthControllers.getNewAccessToken)
router.post("/reset-password", checkAuth(...Object.values(Role)), validateRequest(resetPasswordZodSchema), AuthControllers.resetPassword)
router.get("/google", (req: Request, res:Response) => {
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: redirect as string
    })(req, res);
})
router.get("/google/callback", passport.authenticate("google", {failureRedirect: "/login"}), AuthControllers.googleCallbackController)

export const AuthRoutes = router;