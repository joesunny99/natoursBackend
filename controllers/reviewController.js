const catchAsync = require("./../utils/catchAsync");
const Review = require("../models/reviewModel");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }
  const reviews = await Review.find(filter);

  res.status(200).json({
    message: "Success",
    length: reviews.length,
    data: reviews,
  });
});

exports.postReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const review = await Review.create(req.body);

  res.status(200).json({
    message: "Success",
    data: review,
  });
});

// exports.postReview = catchAsync((req, res) => {

//     res.status(200).json({
//         message:"Success"
//     })
// });
