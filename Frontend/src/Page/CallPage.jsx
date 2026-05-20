import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import { StreamVideoClient } from "@stream-io/video-client";

import "@stream-io/video-react-sdk/dist/css/styles.css";

import toast from "react-hot-toast";
import PageLoader from "../component/pageloader.jsx";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser || !callId) return;

    let videoClient;
    let callInstance;

    const initCall = async () => {
      try {
        setIsConnecting(true);

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: authUser?._id,
            name: authUser?.FullName,
            image: authUser?.profilePicture || "",
          },
          token: tokenData.token,
        });

        callInstance = videoClient.call("default", callId);

        await callInstance.join({
          create: true,
        });

        setClient(videoClient);
        setCall(callInstance);

        console.log("Call joined successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to connect to call");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      const cleanup = async () => {
        if (callInstance) {
          await callInstance.leave();
        }

        if (videoClient) {
          await videoClient.disconnectUser();
        }
      };

      cleanup();
    };
  }, [tokenData, authUser, callId]);

  if (isLoading || isConnecting) {
    return <PageLoader />;
  }

  if (!client || !call) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Failed to connect
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <CallContent />
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

const CallContent = () => {
  const navigate = useNavigate();

  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      toast.success("Call ended");
      navigate("/");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <div className="h-screen relative">
        <SpeakerLayout />
        <CallControls />
      </div>
    </StreamTheme>
  );
};

export default CallPage;