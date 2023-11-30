const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("user", "admin"),
    reviewController.postReview
  )
  .get(reviewController.getAllReviews);

module.exports = router;
