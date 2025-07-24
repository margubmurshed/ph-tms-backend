import { Router } from "express"
import { UserRoutes } from "../app/modules/user/user.route";
import { AuthRoutes } from "../app/modules/auth/auth.route";
import { DivisionRoutes } from "../app/modules/division/divison.route";
import { TourRoutes } from "../app/modules/tour/tour.route";
import { bookingRoutes } from "../app/modules/booking/booking.route";
import { PaymentRoutes } from "../app/modules/payment/payment.route";

export const router = Router();
const moduleRoutes = [
    {path: "/user", route: UserRoutes},
    {path: "/auth", route: AuthRoutes},
    {path: "/division", route: DivisionRoutes},
    {path: "/tour", route: TourRoutes},
    {path: "/booking", route: bookingRoutes},
    {path: "/payment", route: PaymentRoutes},
]

moduleRoutes.forEach(route => {
    router.use(route.path, route.route)
})