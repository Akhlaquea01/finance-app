import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            throw new ApiError(400, "User does not exist");
        }

        const obj = {
            videoDetails: {},
            videoLikes: 0,
            commentLikes: 0,
            tweetLikes: 0
        };

        return res.json(new ApiResponse(200, obj));
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, undefined, "Something went wrong", error)
        );
    }
});


const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        return res.status(200).json(new ApiResponse(200, [], "No videos published yet"));
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, undefined, "Something went wrong", error)
        );
    }
});


export {
    getChannelStats,
    getChannelVideos
};