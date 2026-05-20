import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router-dom";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { capitalize } from "../lib/utils";

import FriendCard from "../component/FriendCard";

import NoFriendsFound from "../component/NoFriendFound";
import { getLanguageFlag } from "../lib/utils";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
      queryFn: async () => {
    const res = await getUserFriends();
    return res.friends;
  },
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
    const res = await getRecommendedUsers();
    return res.users; 
  },
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
  queryFn: async () => {
    const res = await getOutgoingFriendReqs();
    return res || [];
  },
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

 useEffect(() => {
  const outgoingIds = new Set();

  if (Array.isArray(outgoingFriendReqs)) {
    outgoingFriendReqs.forEach((req) => {
      if (req?.recipient?._id) {
        outgoingIds.add(req.recipient._id);
      }
    });
  }

  setOutgoingRequestsIds(outgoingIds);
}, [outgoingFriendReqs]);

 return (
  <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 bg-base-100 overflow-y-auto">
    <div className="max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold">Your Friends</h1>
          <p className="text-sm opacity-70 mt-1">
            Connect and chat with your language partners
          </p>
        </div>

        <Link
          to="/notifications"
          className="btn btn-outline rounded-xl"
        >
          <UsersIcon className="size-4" />
          Friend Requests
        </Link>
      </div>

      {/* FRIENDS SECTION */}
      {loadingFriends ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : friends.length === 0 ? (
        <NoFriendsFound />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-16">
          {friends.map((friend) => (
            <FriendCard key={friend?._id} friend={friend} />
          ))}
        </div>
      )}

      {/* RECOMMENDED USERS */}
      <section>
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Meet New Learners
          </h2>

          <p className="text-base-content/70">
            Discover language exchange partners based on your interests
          </p>
        </div>

        {loadingUsers ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : recommendedUsers.length === 0 ? (
          <div className="card bg-base-200 border border-base-300 rounded-2xl">
            <div className="card-body items-center text-center py-10">
              <h3 className="text-xl font-semibold">
                No recommendations available
              </h3>

              <p className="opacity-70">
                Check back later for more users
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recommendedUsers.map((user) => {
              const hasRequestBeenSent =
                outgoingRequestsIds.has(user?._id);

              return (
                <div
                  key={user?._id}
                  className="card bg-base-200 border border-base-300 rounded-2xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="card-body">

                    {/* USER INFO */}
                    <div className="flex items-center gap-4">

                      <div className="avatar">
                        <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img
                            src={
                              user?.profilePicture ||
                              "/avatar.png"
                            }
                            alt={user?.FullName || "User"}
                            className="object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">
                          {user?.FullName}
                        </h3>

                        {user?.location && (
                          <div className="flex items-center text-sm opacity-70 mt-1">
                            <MapPinIcon className="size-4 mr-1" />
                            <span className="truncate">
                              {user?.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* LANGUAGES */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="badge badge-secondary badge-lg">
                        {getLanguageFlag(user?.nativeLanguage)}
                        Native:{" "}
                        {capitalize(user?.nativeLanguage)}
                      </span>

                      <span className="badge badge-outline badge-lg">
                        {getLanguageFlag(user?.learningLanguage)}
                        Learning:{" "}
                        {capitalize(user?.learningLanguage)}
                      </span>
                    </div>

                    {/* BIO */}
                    <div className="min-h-[60px]">
                      {user?.bio ? (
                        <p className="text-sm opacity-70 line-clamp-3">
                          {user?.bio}
                        </p>
                      ) : (
                        <p className="text-sm opacity-50 italic">
                          No bio available
                        </p>
                      )}
                    </div>

                    {/* BUTTON */}
                    <button
                      className={`btn w-full rounded-xl mt-2 ${
                        hasRequestBeenSent
                          ? "btn-disabled"
                          : "btn-primary"
                      }`}
                      onClick={() =>
                        sendRequestMutation(user?._id)
                      }
                      disabled={
                        hasRequestBeenSent || isPending
                      }
                    >
                      {hasRequestBeenSent ? (
                        <>
                          <CheckCircleIcon className="size-4" />
                          Request Sent
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="size-4" />
                          Send Friend Request
                        </>
                      )}
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  </div>
 );
};

export default HomePage;
