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
router.patch(
  "/:id",
  checkAuth(Role.PATIENT),
  validationRequest(reviewSchema.updateReviewSchema),
  reviewController.updateReview
);
router.delete(
  "/:id",
  checkAuth(Role.PATIENT),
  reviewController.deleteReview
);
router.get('/',checkAuth(Role.ADMIN,Role.SUPER_ADMIN),reviewController.getAllReviews);
router.get('/my_review',checkAuth(Role.DOCTOR,Role.PATIENT),reviewController.getAllReviews);

export const reviewRoutes = router;
