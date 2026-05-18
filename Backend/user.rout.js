import express from 'express';
import { getRecommendedUsers, getMyFriends } from './user.controller.js';
import { protectRoute } from './middleware/auth.middleware.js';
import {
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    getOutgoingFriendRequests
} from './user.controller.js';

const router = express.Router();
//Apply auth middleware to all route
router.use(protectRoute);
router.get("/",getRecommendedUsers);
router.get("/friend",getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);

export default router;