import {upsertStreamUser} from "./lib/stream.js"
import jwt from "jsonwebtoken"
import User from "./MODELS/User.js";

export const checkAuthUser = async (req, res) => {
  res.set("Cache-Control", "no-store");  // ✅ ADD THIS
  res.status(200).json({ user: req.user });
};
export async function signup(req, res) {
  try {
    console.log("🔥 BODY:", req.body);

    const { FullName, email, password } = req.body;

    // ✅ Validation
    if (!FullName || !email || !password) {
      console.log(" Missing fields");
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (password.length < 6) {
      console.log("Password too short");
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(" Invalid email");
      return res.status(400).json({ message: "Invalid email address" });
    }

    // ✅ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(" Email already exists");
      return res.status(400).json({ message: "Email already in use" });
    }

    // ✅ Avatar
    const randomAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${
      FullName || "User"
    }${Math.random()}`

    // ✅ Create user (NO save() again)
    const newUser = await User.create({
      FullName,
      email,
      password,
      profilePicture: randomAvatar,
    });

    console.log(" USER SAVED:", newUser);

    // ✅ Stream (optional)
    try {
      await upsertStreamUser({
        userId: newUser?._id.toString(),
        name: newUser.FullName,
        email: newUser.email,
        image: newUser.profilePicture || "",
      });

      console.log(`✅ Stream user created for ${newUser.FullName}`);
    } catch (error) {
      console.log(" Stream error:", error.message);
    }

    // ✅ Token
    const token = jwt.sign(
      { userid: newUser?._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    // ✅ Cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path:"/"
    });

    console.log(" Cookie sent");

    // ✅ Response
    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });

  } catch (error) {
    console.log(" SIGNUP ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    console.log("LOGIN BODY:", req.body);

    const { email, password } = req.body;

    // ✅ Validate input
    if (!email || !password) {
      console.log(" Missing fields");
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // ✅ Find user
    const user = await User.findOne({ email });

    if (!user) {
      console.log(" User not found");
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 🔍 Debug passwords
    console.log(" Entered Password:", password);
    console.log(" Stored Hashed Password:", user.password);

    // ✅ Compare password
    const isPasswordCorrect = await user.matchPassword(password);

    console.log("🟢 Password Match:", isPasswordCorrect);

    if (!isPasswordCorrect) {
      console.log(" Password incorrect");
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ✅ Create token
    const token = jwt.sign(
      { userid: user?._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    // ✅ Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    console.log(" Cookie sent successfully");

    // ✅ Send response
    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.log(" LOGIN ERROR:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
export function logout(req, res) {
  res.clearCookie("jwt",{
    path:"/",
  });
  res.status(200).json({ message: "Logged out successfully" });
}
export async function onboard(req, res) {
  try {
    const userId = req.user?._id;

    const {
      FullName,
      bio,
      nativeLanguage,
      learningLanguage,
      location,
      profilePicture,
    } = req.body;

    // Validation
    if (!FullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "Please provide all required fields",
        missingFields: [
          !FullName && "FullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        FullName,
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        profilePicture,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Stream user update
    try {
      await upsertStreamUser({
        userId: updatedUser?._id.toString(),
        name: updatedUser.FullName,
        image: updatedUser.profilePicture || "",
      });

      console.log(`Stream user updated for ${updatedUser.FullName}`);
    } catch (err) {
      console.log("Stream error:", err.message);
    }

    res.status(200).json({
      message: "Onboarding completed successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.log("Error in onboarding controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}



