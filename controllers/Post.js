import cloudinary from "../config/Cloudinary.js";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Post from "../models/Post.js";
import slugify from "slugify";

export const createPostController = async (req, res) => {
  try {
    const {
      title,
      hotelLocation,
      description,
      category,
      isAvailable,
      guest,
      price,
      nearArea,
      facilities,
    } = req.body;

    let files = req.files?.images; // use let, not const

    // normalize: always make files an array
    if (!files) {
      return res.status(400).json({ message: "Please upload 3 images." });
    }
    if (!Array.isArray(files)) {
      files = [files]; // wrap single file into array
    }

    if (files.length !== 3) {
      return res.status(400).json({ message: "Please upload 3 images." });
    }

    const imageUrls = await Promise.all(
      files.map((file) =>
        cloudinary.uploader
          .upload(file.tempFilePath)
          .then((results) => results.secure_url)
      )
    );

    const newPost = new Post({
      title,
      hotelLocation,
      description,
      category,
      images: imageUrls,
      isAvailable,
      guest,
      price,
      nearArea,
      facilities,
      slug: slugify(title, { lower: true }),
    });

    await newPost.save();

    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
      console.log("REQ.FILES ===>", req.files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getPostController = async (req, res) => {
    try {
    const product = await Post.findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
        success: true,
        message: "Single Product Fetched",
        product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product",
      error,
    });
  }
};

export const getAllPostController = async (req, res) => {
  try {
    const posts = await Post.find({});
    // .populate("category");
    res.status(200).send({
      success: true,
      message: "All Products Fetched",
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting all products",
      error,
    });
  }
};

export const updatePostController = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      hotelLocation,
      description,
      facilities,
      nearArea,
      category,
      guest,
      isAvailable,
      price,
    } = req.body;
    const files = req.files?.images;

    // Find the existing post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Validate fields (optional for update)
    if (
      !title &&
      !hotelLocation &&
      !description &&
      !facilities &&
      !nearArea &&
      !category &&
      !guest &&
      isAvailable === undefined &&
      !price &&
      !files
    ) {
      return res.status(400).json({ message: "No fields provided to update." });
    }

    // Handle image update
    let updatedImages = post.images;
    if (files && files.length === 3) {
      // Delete old images from Cloudinary
      await Promise.all(
        post.images.map((url) => {
          const publicId = url.split("/").pop().split(".")[0];
          return cloudinary.uploader.destroy(publicId);
        })
      );

      // Upload new images
      updatedImages = await Promise.all(
        files.map((file) =>
          cloudinary.uploader
            .upload(file.tempFilePath)
            .then((result) => result.secure_url)
        )
      );
    } else if (files && files.length !== 3) {
      return res
        .status(400)
        .json({ message: "Please upload exactly 3 images." });
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(hotelLocation && { hotelLocation }),
        ...(description && { description }),
        ...(facilities && { facilities }),
        ...(nearArea && { nearArea }),
        ...(category && { category }),
        ...(guest && { guest }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(price && { price }),
        ...(files && { images: updatedImages }),
        ...(title && { slug: slugify(title, { lower: true }) }),
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Post updated successfully!", post: updatedPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePostController = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).send({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

export const relatedPostController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await Post.find({
      category: cid,
      _id: { $ne: pid },
    })
      .select("-photo")
      .limit(2)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

export const searchBookings = async (req, res) => {
  try {
    const { keyword } = req.params;

    // Split the keyword into individual words
    const words = keyword.split(" ");

    // Build the query to match any word in the description
    const results = await Post.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        {
          description: {
            $regex: words.join("|"), // Matches any of the words
            $options: "i", // Case-insensitive
          },
        },
      ],
    }).select("title hotelLocation description");

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

export const postFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    // Build query object
    let args = {};
    if (checked?.length) args.guest = { $in: checked }; // Match guest count
    if (radio?.length === 2) args.price = { $gte: radio[0], $lte: radio[1] }; // Match price range

    // Fetch filtered posts
    const products = await Post.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error while filtering products:", error);
    res.status(400).send({
      success: false,
      message: "Error while filtering products",
      error,
    });
  }
};

export const popularPostController = async (req, res) => {
  try {
    const popularPosts = await Post.find({}).sort({ views: -1 }).limit(5);

    res.status(200).send({
      success: true,
      message: "Top 5 popular posts fetched successfully",
      posts: popularPosts,
    });
  } catch (error) {
    console.error("Error fetching popular posts:", error);
    res.status(500).send({
      success: false,
      message: "Error while fetching popular posts",
      error,
    });
  }
};