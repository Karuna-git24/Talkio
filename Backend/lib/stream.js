import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.log("Stream API key or Secret is missing");
    
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async ( { user_id,FullName,email,image}) => {
  try{
    if(!user_id){
        throw new Error("user_id missing")
    }
    const streamUser ={
        id:user_id,
        name:FullName || "User",
        email:email
    };
    await streamClient.upsertUser(streamUser);
    return streamUser;
  }catch(error){
    console.log(error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  try {
    return streamClient.createToken(userId.toString());
  } catch (error) {
    console.log("Error generating stream token", error);
  }
};