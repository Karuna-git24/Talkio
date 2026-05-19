import {
  BellIcon,
  LogOutIcon,
  ShipWheelIcon,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import useAuthUser from "../hooks/useAuthUser.js";

import ThemeSelector from "./ThemeSelector.jsx";

import { logout } from "../lib/api";

import { createAvatar } from "@dicebear/core";

import { adventurer } from "@dicebear/collection";

const Navbar = () => {
  const { authUser } = useAuthUser();

  const location = useLocation();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const isChatPage =
    location.pathname.startsWith("/chat");

  // LOGOUT
  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });

      navigate("/login");
    },
  });

  // SAFE AVATAR
  const avatar =
    authUser?.profilePicture ||
    createAvatar(adventurer, {
      seed: authUser?.FullName || "User",
    }).toDataUri();

  return (
    <nav
      className="
        bg-base-200
        border-b border-base-300
        sticky top-0
        z-30
        h-16
        flex items-center
      "
    >

      <div
        className="
          container
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          w-full
        "
      >

        <div className="flex items-center justify-between w-full">

          {/* LOGO ONLY ON CHAT PAGE */}
          {isChatPage ? (

            <Link
              to="/"
              className="
                flex items-center gap-2.5
              "
            >

              <ShipWheelIcon
                className="
                  size-8
                  text-primary
                "
              />

              <span
                className="
                  text-2xl
                  font-bold
                  font-mono
                  bg-clip-text
                  text-transparent
                  bg-gradient-to-r
                  from-primary
                  to-secondary
                  tracking-wider
                "
              >
                Talkio
              </span>
            </Link>

          ) : (
            <div />
          )}

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3 sm:gap-4">

            {/* NOTIFICATIONS */}
            <Link to="/notifications">

              <button
                className="
                  btn btn-ghost btn-circle
                "
              >

                <BellIcon
                  className="
                    h-6
                    w-6
                    text-base-content
                    opacity-70
                  "
                />
              </button>
            </Link>

            {/* THEME */}
            <ThemeSelector />

            {/* USER AVATAR */}
            <div className="avatar">

              <div className="w-9 rounded-full">

                <img
                  src={avatar}
                  alt="User Avatar"
                  className="
                    w-10
                    h-10
                    rounded-full
                    object-cover
                    border border-base-300
                  "
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* LOGOUT */}
            <button
              className="
                btn btn-ghost btn-circle
              "
              onClick={() => logoutMutation()}
            >

              <LogOutIcon
                className="
                  h-6
                  w-6
                  text-base-content
                  opacity-70
                "
              />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;