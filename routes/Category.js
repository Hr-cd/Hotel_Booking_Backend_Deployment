import express from "express";
import { categoryController, createCategoryController, deleteCategoryCOntroller, selectedCategoryController, singleCategoryController, updateCategoryController } from "../controllers/Category.js";

const router = express.Router();

// create category
router.post("/create-category", createCategoryController);
router.get("/get-categories", categoryController)
router.put("/update-category/:id", updateCategoryController)
router.delete("/delete-category/:id", deleteCategoryCOntroller)
router.get("/single-category/:slug", singleCategoryController)
router.get("/select-category/:slug", selectedCategoryController);

export default router;