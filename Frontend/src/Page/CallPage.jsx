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
    enabled: !!authUser?._id,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser?._id || !callId) {
      return;
    }

    let videoClient;
    let callInstance;
    let mounted = true;

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

        if (!mounted) return;

        setClient(videoClient);
        setCall(callInstance);

        console.log("Joined call successfully");
      } catch (error) {
        console.error("CALL ERROR:", error);
        toast.error("Failed to connect to call");
      } finally {
        if (mounted) {
          setIsConnecting(false);
        }
      }
    };

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

    await callInstance.join({ create: true });

    // Enable camera and mic for ALL participants
    await callInstance.camera.enable();
    await callInstance.microphone.enable();

    if (!mounted) return;

    setClient(videoClient);
    setCall(callInstance);

  } catch (error) {
    console.error("CALL ERROR:", error);
    toast.error("Failed to connect to call");
  } finally {
    if (mounted) setIsConnecting(false);
  }
};

      cleanup();
    
  }, [tokenData, authUser?._id, callId]);

  if (isLoading || isConnecting) {
    return <PageLoader />;
  }

  if (!client || !call) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            Failed to connect
          </h2>

          <p className="opacity-70">
            Please refresh and try again
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black">
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
        <SpeakerLayout />

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;