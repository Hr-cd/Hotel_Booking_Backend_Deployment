import express from "express";
import { createPostController, deletePostController, getAllPostController, getPostController, popularPostController, postFiltersController, relatedPostController, searchBookings, updatePostController} from "../controllers/Post.js";
import { get } from "mongoose";

const routes = express.Router();

routes.post('/create-post', createPostController)
routes.get('/get-post/:slug', getPostController)
routes.get('/get-all-posts', getAllPostController)
routes.put('/update-post/:id', updatePostController)
routes.delete('/delete-post/:id', deletePostController)
routes.get("/related-post/:pid/:cid", relatedPostController);
routes.get("/search/:keyword", searchBookings);
routes.post("/product-filters", postFiltersController);
routes.get("/popular-post", popularPostController)

export default routes;