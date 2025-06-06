const userService2 = require("../services/userServices");
const bcrypt = require("bcrypt");

const randToken = require("rand-token");

import { User } from "../models/entity/User";
import CustomError from "../utils/CustomError";

const {
  generateToken,
  verifyToken,
  decodeToken,
  generatePasswordResetToken,
  sendPasswordResetEmail,
} = require("../services/authService");

const {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_LIFE,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_LIFE,
  refreshTokenSize,
} = require("../config/jwt");

const auth = require("../config/auth");
const SALT_ROUNDS = auth.SALT_ROUNDS;

const register = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new CustomError("Invalid email format.", 400);
    }

    // Password strength check
    if (password.length < 8) {
      throw new CustomError(
        "Password must be at least 8 characters long.",
        400
      );
    }

    const user = await userService2.getUsersByFields({ email: email });

    console.log("user", user);

    if (user &&user.length > 0) {
      throw new CustomError("Account name already exists.", 409);
    }

    const hashPassword = bcrypt.hashSync(password, SALT_ROUNDS);

    const newUser = {
      email: email,
      password: hashPassword,
    };

    const createUser = await userService2.createUser(newUser);
    if (!createUser || createUser.length === 0) {
      throw new CustomError(
        "There was an error creating your account, please try again.",
        400
      );
    }
    return res.status(201).json({
      email,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    console.log("email", email);

    let user = await userService2.getUsersByFields({ email: email });

    console.log("user in authControl", user);
    if (user[0] === undefined) {
      throw new CustomError("Email does not exist.", 401);
    }

    const isPasswordValid = bcrypt.compareSync(password, user[0].password);

    if (!isPasswordValid) {
      throw new CustomError("Password is incorrect.", 401);
    }

    const dataForAccessToken = {
      user_id: user[0].user_id,
      email: user[0].email,
      role: user[0].role,
    };
    const accessToken = await generateToken(
      dataForAccessToken,
      ACCESS_TOKEN_SECRET,
      ACCESS_TOKEN_LIFE
    );

    if (!accessToken) {
      throw new CustomError("Login failed, please try again.", 401);
    }

    // generate a random refresh token

    // console.log(REFRESH_TOKEN_SECRET, REFRESH_TOKEN_LIFE);

    let refreshToken = await generateToken(
      dataForAccessToken,
      REFRESH_TOKEN_SECRET,
      REFRESH_TOKEN_LIFE
    );

    user = await userService2.updateUserByEmail(user[0].email, {
      refresh_token: refreshToken,
    });

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Must be false for HTTP in development
      sameSite: "lax",
      path: "/",
      domain: "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("user in auth controller", user);

    return res.status(200).json({
      message: "Login successful.",
      accessToken,
      refreshToken,
      role: user.role,
      timezone: user.timezone,
      email: user.email,
      avatar: user.profile_picture,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  try {
    const email = req.body.email; // Assuming you have user info from auth middleware

    console.log(email);

    let user = await userService2.getUsersByFields({ email });

    console.log(user);

    // Clear refresh token in database
    await userService2.updateUserByEmail(user[0].email, {
      refresh_token: null,
    });

    // Clear cookies
    res.clearCookie("refreshToken");

    // Return success with cleared access token
    return res.status(200).json({
      accessToken: null,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Logout failed",
      error: error.message,
    });
  }
};

const verifyUser = async (access_token) => {
  try {
    // Verify token validity
    const isValidToken = await verifyToken(
      access_token,
      process.env.ACCESS_TOKEN_SECRET
    );
    if (!isValidToken) {
      throw new Error("Invalid access token");
    }

    // Decode token to get user data
    const decoded = await decodeToken(
      access_token,
      process.env.ACCESS_TOKEN_SECRET
    );
    if (!decoded) {
      throw new Error("Failed to decode token");
    }

    // Check if user exists in database
    const user = await User.findOne({
      where: { user_id: decoded.user_id },
      select: [
        "user_id",
        "email",
        "first_name",
        "last_name",
        "phone_number",
        "profile_picture",
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      isValid: true,
      user: user,
    };
  } catch (error) {
    console.log(`Error in verify user: ${error}`);
    return {
      isValid: false,
      error: error.message,
    };
  }
};

const refreshToken = async (req, res, next) => {
  try {
    // Get access token from header
    const accessTokenFromHeader = req.headers.authorization?.replace(
      "Bearer ",
      ""
    );
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!accessTokenFromHeader || !refreshTokenFromCookie) {
      throw new CustomError("Tokens not found.", 400);
    }

    // Decode access token đó
    const decoded = await decodeToken(
      accessTokenFromHeader,
      ACCESS_TOKEN_SECRET
    );

    if (!decoded) {
      throw new CustomError("Access token is invalid.", 400);
    }

    // Get email from payload
    const email = decoded.email;

    let user = await userService2.getUsersByFields({ email: email });
    if (user.length === 0) {
      throw new CustomError("User does not exist.", 401);
    }

    if (refreshTokenFromCookie !== user[0].refresh_token) {
      throw new CustomError("Refresh token is invalid.", 400);
    }

    // Create new access token
    const dataForAccessToken = {
      user_id: user[0].user_id,
      email,
      role: user[0].role,
    };

    const accessToken = await generateToken(
      dataForAccessToken,
      ACCESS_TOKEN_SECRET,
      ACCESS_TOKEN_LIFE
    );
    if (!accessToken) {
      throw new CustomError(
        "Access token generation failed, please try again.",
        400
      );
    }

    // generate a random refresh token
    // let refreshToken = randToken.generate(refreshTokenSize);
    // user = await userService2.updateUserByEmail(user[0].email, {
    //   refresh_token: refreshToken,
    // });

    // // Set refresh token in HTTP-only cookie
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: false, // Must be false for HTTP in development
    //   sameSite: "lax",
    //   path: "/",
    //   domain: "localhost",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const requestPasswordReset = async (req, res, next) => {
  const userEmail = req.body.email;
  const user = await userService2.getUsersByFields({ email: userEmail });

  if (!user[0]) {
    return res.status(401).send({
      status: 401,
      message: "Email does not exist.",
      // info: info.messageId,
      // preview: nodemailer.getTestMessageUrl(info),
    });
    // throw new CustomError("Email does not exist.", 401);
  }

  const access_token_password = await generatePasswordResetToken(
    user[0],
    ACCESS_TOKEN_SECRET
  );

  try {
    sendPasswordResetEmail(user[0], access_token_password).then(
      () => {
        return res.status(200).send({
          status: 200,
          message: "Email sent",
          // info: info.messageId,
          // preview: nodemailer.getTestMessageUrl(info),
        });
      },
      (error) => {
        throw new CustomError("Email sending failed.", 400);
      }
    );
  } catch (error) {
    next(error);
  }
};

const verifyResetPasswordRequest = async (req, res, next) => {
  try {
    const token = req.body.token;

    const verified = await verifyToken(token, ACCESS_TOKEN_SECRET);

    if (!verified) {
      throw new CustomError("Invalid token", 401);
    } else {
      const decoded = await decodeToken(token, ACCESS_TOKEN_SECRET);

      const user = await userService2.getUsersByFields({
        user_id: decoded.user_id,
        email: decoded.email,
      });

      if (!user || user.length > 1) {
        throw new CustomError("Invalid token", 401);
      }

      const tempAccessToken = await generatePasswordResetToken(
        user[0],
        ACCESS_TOKEN_SECRET
      );

      res.status(200).json({
        tempAccessToken,
        message: "successful verification",
      });
    }
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    const decode = await decodeToken(token, ACCESS_TOKEN_SECRET);

    const user = await userService2.getUserById(decode.user_id);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const dataForAccessToken = {
      email: user.email,
    };
    const accessToken = await generateToken(
      dataForAccessToken,
      ACCESS_TOKEN_SECRET,
      ACCESS_TOKEN_LIFE
    );

    if (accessToken) {
      // generate a random refresh token
      let refreshToken = randToken.generate(refreshTokenSize);

      const hashPassword = bcrypt.hashSync(password, SALT_ROUNDS);

      const userUpdate = await userService2.updateUser(user.user_id, {
        password: hashPassword,
        refresh_token: refreshToken,
        first_name: "Minh Quang",
      });

      if (!userUpdate) {
        throw new CustomError("Failed to update password", 400);
      }

      res.status(200).json({
        user: userUpdate,
        message: "Password reset successful",
      });
    } else {
      throw new CustomError("Failed to update password", 400);
    }
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res) => {
  const password = req.body.password;
  const user_id = req.body.user_id;

  try {
    console.log("user_id", user_id);
    console.log("password", password);
    const user = await userService2.getUserById(user_id);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const dataForAccessToken = {
      email: user.email,
    };
    const accessToken = await generateToken(
      dataForAccessToken,
      ACCESS_TOKEN_SECRET,
      ACCESS_TOKEN_LIFE
    );

    if (accessToken) {
      // generate a random refresh token
      let refreshToken = randToken.generate(refreshTokenSize);

      const hashPassword = bcrypt.hashSync(password, SALT_ROUNDS);

      const userUpdate = await userService2.updateUser(user.user_id, {
        password: hashPassword,
        refresh_token: refreshToken,
      });

      if (!userUpdate) {
        throw new CustomError("Failed to update password", 400);
      }

      return res.status(200).json({
        message: "Password reset successful",
      });
    } else {
      throw new CustomError("Failed to update password", 400);
    }
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const checkTokenExpiration = async (req, res) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;

  console.log("refresh Token From Cookie", refreshTokenFromCookie);

  if (!refreshTokenFromCookie) {
    return res.status(401).json({
      message: "Refresh Token is missing",
      expired: true,
    });
  }
  try {
    let user = await userService2.getUsersByFields({
      refresh_token: refreshTokenFromCookie,
    });

    console.log("user", user);

    if (!user || user.length === 0) {
      return res.status(401).json({
        message: "Refresh Token is invalid",
        expired: true,
      });
    }
    return res.status(200).json({
      message: "Refresh Token is valid",
      expired: false,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Refresh Token is error",
      expired: false,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyUser,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyResetPasswordRequest,
  changePassword,
  checkTokenExpiration,
};
