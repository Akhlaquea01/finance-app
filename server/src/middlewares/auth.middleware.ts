import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // console.log(token);
        if (!token) {
            return res.status(401).json(
                new ApiResponse(401, undefined, "Invalid access token", new Error("Invalid access token"))
            );
        }

        if (!process.env.ACCESS_TOKEN_SECRET) {
            return res.status(500).json(
                new ApiResponse(500, undefined, "Server configuration error: ACCESS_TOKEN_SECRET is not set", new Error("ACCESS_TOKEN_SECRET is not set"))
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json(
                new ApiResponse(401, undefined, "Invalid access token", new Error("Invalid access token"))
            );
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json(
            new ApiResponse(401, undefined, "Invalid access token", new Error("Invalid access token"))
        );
    }

});