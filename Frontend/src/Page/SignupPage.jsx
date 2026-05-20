import { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { signup } from "../lib/api.js";
const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    FullName: "",
    email: "",
    password: "",
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // API CALL
  const signupUser = async (data) => {
  const res = await fetch(
    "https://talkio-3350.onrender.com/api/auth/signup",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );
    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Signup failed");
    }

    return result;
  };

  // MUTATION
  const {
    mutate: signupMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: signupUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });

      navigate("/onboarding");
    },
  });

  // SUBMIT
  const handleSignup = (e) => {
    e.preventDefault();

    console.log("Sending data:", signupData);

    signupMutation(signupData);
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-y-auto">

        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">

          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />

            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Talkio
            </span>
          </div>

          {/* ERROR */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.message}</span>
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div className="space-y-4">

              <div>
                <h2 className="text-xl font-semibold">
                  Create an Account
                </h2>

                <p className="text-sm opacity-70">
                  Join Talkio and start your language journey
                </p>
              </div>

              <div className="space-y-3">

                {/* FULL NAME */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">
                      Full Name
                    </span>
                  </label>

                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input input-bordered w-full"
                    value={signupData.FullName}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        FullName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* EMAIL */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">
                      Email
                    </span>
                  </label>

                  <input
                    type="email"
                    placeholder="john@gmail.com"
                    className="input input-bordered w-full"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">
                      Password
                    </span>
                  </label>

                  <input
                    type="password"
                    placeholder="********"
                    className="input input-bordered w-full"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        password: e.target.value,
                      })
                    }
                    required
                  />

                  <p className="text-xs opacity-70 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                {/* TERMS */}
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      required
                    />

                    <span className="text-xs leading-tight">
                      I agree to the{" "}
                      <span className="text-primary hover:underline">
                        terms of service
                      </span>{" "}
                      and{" "}
                      <span className="text-primary hover:underline">
                        privacy policy
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* BUTTON */}
              <button
                className="btn btn-primary w-full"
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* LOGIN */}
              <div className="text-center mt-4">
                <p className="text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

            </div>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">

          <div className="max-w-md p-8">

            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/v.png.png"
                alt="Language illustration"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with language partners worldwide
              </h2>

              <p className="opacity-70">
                Practice conversations, make friends,
                and improve language skills together
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;