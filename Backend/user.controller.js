import jwt from "jsonwebtoken";
import User from "./MODELS/User.js";
import FriendRequest from "./MODELS/friendrequest.js";

export async function getRecommendedUsers(req , res){
    try{
        const currentUserId = req.user.id;
        const currentUser=req.user;

        const recommendedUsers = await User.find({
            $and:[
                {_id:{$ne: currentUserId}},// Exclude the current user
                {_id:{$nin: currentUser.friends}},// Exclude the user's friends
                {isOnboarded:true} // Only include users who have completed onboarding
            ]
        })
        res.status(200).json({users: recommendedUsers});

    }catch(error){
        console.log("Error getting recommended users:", error);
        res.status(500).json({error:"Internal server error"});
        }
}

export async function getMyFriends(req , res){
    try{
        const user = await User.findById(req.user.id).select("friends").
        populate("friends","FullName profilePic nativeLanguage learningLanguage");

        res.status(200).json({friends: user.friends});
    }catch(error){
        console.log("Error getting friends:", error);
        res.status(500).json({error:"Internal server error"});
    }
}

export async function sendFriendRequest(req , res){
    try{
        const myId = req.user.id;
        const {id:recipientId} = req.params;

        // prevent sending friend request to self
        if (myId.toString() === recipientId.toString()) {
      return res.status(400).json({ error: "You cannot send a friend request to yourself" });
    }

        const recipient = await User.findById(recipientId);
        if(!recipient){
            return res.status(404).json({error:"Recipient user not found"});
        }

       // check if they are already friends
        if (myId.toString() === recipientId.toString()) {
      return res.status(400).json({ error: "You cannot send a friend request to yourself" });
    }

        //check if a request already exists
        const existingRequest = await FriendRequest.findOne({
            $or :[
                {sender:myId, recipient:recipientId},
                {sender:recipientId, recipient:myId}
            ],
        });
        if(existingRequest){
            return res
            .status(400)
            .json({error:"A friend request already exists between you and this user"

            });
    }
    const friendRequest = await FriendRequest.create({
        sender:myId,
        recipient:recipientId,
    });
    res.status(201).json({message:"Friend request sent successfully", friendRequest});

    }catch(error){
        console.log("Error sending friend request:", error);
        res.status(500).json({error:"Internal server error"});
    }

    }

    export async function acceptFriendRequest(req , res){
        try{
            const {id:requestId} = req.params;
            const friendRequest = await FriendRequest.findById(requestId);

            if(!friendRequest){
                return res.status(404).json({error:"Friend request not found"});
            }

            if(friendRequest.recipient.toString() !== req.user.id){
                return res.status(403).json({error:"You are not authorized to accept this friend request"});
            }
            friendRequest.status = "accepted";
            await friendRequest.save();

            // Add each other as friends
            await User.findByIdAndUpdate(friendRequest.sender,{
                $addToSet:{friends:friendRequest.recipient},
            });
            await User.findByIdAndUpdate(friendRequest.recipient,{
                $addToSet:{friends:friendRequest.sender},
            });
            res.status(200).json({message:"Friend request accepted successfully"});

        }catch(error){
            console.log("Error accepting friend request:", error);
            res.status(500).json({error:"Internal server error"});
        }
    }

    export async function getFriendRequests(req , res){
        try{
            const incomingReqs= await FriendRequest.find({
                recipient:req.user.id,
                status:"pending",
            }).populate("sender","FullName profilePic nativeLanguage learningLanguage");

            const acceptingReqs = await FriendRequest.find({
                sender:req.user.id,
                status:"accepted",
            }).populate("recipient","FullName profilePic");

            res.status(200).json({incomingReqs , acceptingReqs});
        }catch(error){
            console.log("Error getting friend requests:", error);
            res.status(500).json({error:"Internal server error"});
        }
    }

    export async function getOutgoingFriendRequests(req , res){
        try{
            const outgoingReqs = await FriendRequest.find({
                sender:req.user.id,
                status:"pending",
            }).populate("recipient","FullName profilePic nativeLanguage learningLanguage");
            res.status(200).json({outgoingReqs});
        }catch(error){
            console.log("Error getting outgoing friend requests:", error);
            res.status(500).json({error:"Internal server error"});
        }
    }