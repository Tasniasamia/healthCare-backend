import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validationRequest } from "../../middleware/validationRequest";
import { reviewSchema } from "./review.validation";
import { reviewController } from "./review.controller";

const router = Router();
router.post(
  "/",
  checkAuth(Role.PATIENT),
  validationRequest(reviewSchema.createReviewSchema),
  reviewController.giveReview
);
export const reviewRoutes = router;
