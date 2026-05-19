import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useAuthUser from "../hooks/useAuthUser";

import { useQuery } from "@tanstack/react-query";

import { getStreamToken } from "../lib/api";

import { useThemeStore } from "../store/useThemeStore";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import { StreamChat } from "stream-chat";

import toast from "react-hot-toast";

import ChatLoader from "../component/ChatLoader";
import CallButton from "../component/CallButton";

import "stream-chat-react/dist/css/v2/index.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const navigate = useNavigate();

  const { theme } = useThemeStore();

  const [chatClient, setChatClient] = useState(null);

  const [channel, setChannel] = useState(null);

  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser?._id,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser || !targetUserId) return;

    let client;

    const initChat = async () => {
      try {
        setLoading(true);

        console.log("Initializing Stream Chat...");

        client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.FullName,
            image: authUser.profilePicture || "",
          },
          tokenData.token
        );

        // UNIQUE CHANNEL ID
        const channelId = [authUser._id, targetUserId]
          .sort()
          .join("-");

        const currChannel = client.channel(
          "messaging",
          channelId,
          {
            members: [authUser._id, targetUserId],
          }
        );

        await currChannel.watch();

        setChatClient(client);

        setChannel(currChannel);

        console.log("Chat connected");
      } catch (error) {
        console.error(error);

        toast.error("Failed to connect chat");
      } finally {
        setLoading(false);
      }
    };

    initChat();

    // CLEANUP
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [tokenData, authUser, targetUserId]);

  // VIDEO CALL
  const handleVideoCall = async () => {
    if (!channel) return;

    try {
      const callId = crypto.randomUUID();

      // SEND CALL LINK
      await channel.sendMessage({
        text: `/call/${callId}`,
      });

      // NAVIGATE
      navigate(`/call/${callId}`);
    } catch (error) {
      console.error(error);

      toast.error("Failed to start video call");
    }
  };

  if (loading || !chatClient || !channel) {
    return <ChatLoader />;
  }

  return (
    <div className="h-[93vh]">

      <Chat
        client={chatClient}
        theme={
          [
            "dark",
            "night",
            "forest",
            "black",
            "luxury",
            "dracula",
            "business",
            "coffee",
            "sunset",
          ].includes(theme)
            ? "str-chat__theme-dark"
            : "str-chat__theme-light"
        }
      >

        <Channel channel={channel}>

          <div className="w-full relative h-full">

            {/* VIDEO CALL BUTTON */}
            <CallButton
              handleVideoCall={handleVideoCall}
            />

            <Window>

              <ChannelHeader />

              <MessageList />

              <MessageInput focus />

            </Window>
          </div>

          <Thread />

        </Channel>

      </Chat>
    </div>
  );
};

export default ChatPage;