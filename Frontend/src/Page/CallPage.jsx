
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamCall,
  CallControls,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  PaginatedGridLayout,
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
    enabled: !!authUser?._id,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser?._id || !callId) {
      return;
    }

    let mounted = true;

    let videoClient;
    let callInstance;

    const initCall = async () => {
      try {
        setIsConnecting(true);

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,

          user: {
            id: authUser._id,
            name: authUser.FullName || "User",
            image: authUser.profilePicture || "",
          },

          token: tokenData.token,
        });

        callInstance = videoClient.call("default", callId);

        await callInstance.getOrCreate();

        await callInstance.join();

        // ENABLE CAMERA + MIC
        await callInstance.camera.enable();
        await callInstance.microphone.enable();

        if (!mounted) return;

        setClient(videoClient);
        setCall(callInstance);

        console.log("Call connected");
      } catch (error) {
        console.error("CALL ERROR:", error);
        toast.error("Failed to connect to call");
      } finally {
        if (mounted) {
          setIsConnecting(false);
        }
      }
    };

    initCall();

    return () => {
      mounted = false;

      const cleanup = async () => {
        try {
          if (callInstance) {
            await callInstance.leave();
          }
        } catch (error) {
          console.log("Call already left");
        }

        try {
          if (videoClient) {
            await videoClient.disconnectUser();
          }
        } catch (error) {
          console.log("User already disconnected");
        }
      };

      cleanup();
    };
  }, [tokenData, authUser?._id, callId]);

  if (isLoading || isConnecting) {
    return <PageLoader />;
  }

  if (!client || !call) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Failed to connect
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black overflow-hidden">
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
      <div className="h-screen relative bg-black">
        {/* SHOW ALL PARTICIPANTS */}
        <PaginatedGridLayout />

        {/* CONTROLS */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;

