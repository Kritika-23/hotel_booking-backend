import express from "express";
import { globalSearch } from "../controllers/search.controller.js";

const searchRouter = express.Router();

searchRouter.get("/global", globalSearch);

export default searchRouter;