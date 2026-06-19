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
    if (!tokenData?.token || !authUser?._id || !targetUserId) {
      return;
    }

    let isMounted = true;

    const client = StreamChat.getInstance(STREAM_API_KEY);

    const initChat = async () => {
      try {
        setLoading(true);

        console.log("Initializing Stream Chat...");

        // CONNECT USER
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.FullName || "User",
            image: authUser.profilePicture || "",
          },
          tokenData.token
        );

        // UNIQUE CHANNEL ID
        const channelId = [authUser._id, targetUserId]
          .sort()
          .join("-");

        // CREATE CHANNEL
        const currChannel = client.channel(
          "messaging",
          channelId,
          {
            members: [authUser._id, targetUserId],
          }
        );

        // WATCH CHANNEL
        await currChannel.watch();

        if (!isMounted) return;

        setChatClient(client);

        setChannel(currChannel);

        console.log("Chat connected successfully");
      } catch (error) {
        console.error("CHAT ERROR:", error);

        toast.error("Failed to connect chat");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initChat();

    // CLEANUP
    return () => {
      isMounted = false;

      client.disconnectUser();
    };
  }, [tokenData?.token, authUser?._id, targetUserId]);

  // VIDEO CALL
  const handleVideoCall = async () => {
    if (!channel) return;

    try {
      const callId = crypto.randomUUID();

      // SEND CALL MESSAGE
      await channel.sendMessage({
        text: `/call/${callId}`,
      });

      // NAVIGATE TO CALL
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
    <div className="h-screen overflow-hidden">
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
          <div className="relative h-full w-full">
            
            {/* VIDEO CALL BUTTON */}
            <CallButton handleVideoCall={handleVideoCall} />

            <Window>
              <ChannelHeader />

              {/* SCROLLABLE MESSAGE AREA */}
              <div className="flex-1 overflow-y-auto">
                <MessageList />
              </div>

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