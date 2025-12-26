

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const admin = require('../models/admin');

const verifyJwtUser = async (req, res, next) => {
    try {
        // Extract tokens from cookies
        const accessToken = req.cookies?.accessToken;
        // If no tokens are present
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: "No authentication tokens found"
            });
        }

        let user;

        // Verify access token first
        if (accessToken) {
            try {
                const decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
                user = await User.findById(decodedAccessToken?._id).select("-user_password -user_accessToken");
                console
                if (!user) {
                    return res.json({
                        success: false,
                        status: 401,
                        message: "Invalid access token"
                    });
                }

                // Check if user is inactive - auto logout
                if (user.user_status === "Inactive") {
                    const options = {
                        httpOnly: true,
                        sameSite: "none",
                        secure: true,
                        maxAge: 0
                    };

                    return res
                        .status(401)
                        .clearCookie("accessToken", options)
                        .clearCookie("refreshToken", options)
                        .json({
                            success: false,
                            status: 401,
                            message: "Your account has been deactivated. Please contact your administrator.",
                            deactivated: true
                        });
                }
            } catch (accessTokenError) {
                // If access token is expired or invalid, check refresh token
                return res.status(401).json({
                    success: false,
                    status: 401,
                    message: "Access token expired "
                });
            }
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('JWT Verification Error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during authentication",
            error: error.message
        });
    }
};
const verifyJwtAdmin = async (req, res, next) => {
    try {
        // Extract tokens from cookies

        const accessToken = req.cookies?.accessToken;


        // If no tokens are present
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: "No authentication tokens found"
            });
        }

        let user;

        // Verify access token first
        if (accessToken) {
            try {
                const decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
                user = await admin.findById(decodedAccessToken?._id).select("-admin_password -accessToken");
                console
                if (!user) {
                    return res.json({
                        success: false,
                        status: 401,
                        message: "Invalid access token"
                    });
                }
            } catch (accessTokenError) {
                // If access token is expired or invalid, check refresh token
                return res.status(401).json({
                    success: false,
                    status: 401,
                    message: "Access token expired "
                });
            }
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('JWT Verification Error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during authentication",
            error: error.message
        });
    }
};

const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken; // HTTP-only cookie
    if (!token) {
        return res.status(401).json({ message: 'Access Denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Verify the token
        req.user = decoded; // Attach user data to the request
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid Token' });
    }
};

module.exports = { verifyJwtUser, verifyJwtAdmin, verifyToken };