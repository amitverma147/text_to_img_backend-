import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer token format)
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : req.headers.token; // Fallback to direct token header

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify JWT token
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token contains user ID
    if (!tokenDecode.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User ID not found.",
      });
    }

    // Attach user ID to request object
    req.body.userId = tokenDecode.id;
    

    next(); // Continue to next middleware/route handler
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format.",
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

export default userAuth;
