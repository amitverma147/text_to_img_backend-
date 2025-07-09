import userModel from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim().toLowerCase();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user data
    const userData = {
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
    };

    // Save user to database
    const newUser = new userModel(userData);
    const user = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Send response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing Details",
      });
    }
    const sanitizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials ",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Password",
      });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const userCredits = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find user and check if exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user credits
    res.status(200).json({
      success: true,
      credits: user.creditBalance || 0,
      user: {
        id: user._id,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("User credits error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { registerUser, loginUser, userCredits };
