const catchAsync = require("./../utils/catchAsync");
const Review = require("../models/reviewModel");

exports.getAllReviews = catchAsync(async(req, res, next) => {
  const reviews = await Review.find().populate("user").populate("tour");
  
  res.status(200).json({
    message: "Success",
    data: reviews,
  });

});

exports.postReview = catchAsync(async (req, res, next) => {
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
