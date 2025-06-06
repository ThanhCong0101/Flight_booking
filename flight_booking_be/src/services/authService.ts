import { User } from "../models/entity/User";
import { addEmailResetPasswordJob } from "../queues/emailResetPasswordQueue";

const {
  emailResetPasswordTemplate,
  sendEmail,
} = require("../utils/emailService");

const jwt = require("jsonwebtoken");

const generateToken = async (payload, secretSignature, tokenLife) => {
  try {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        secretSignature,
        {
          algorithm: "HS256",
          expiresIn: tokenLife,
        },
        (err, token) => {
          if (err) {
            console.log(`Error in generate access token: ${err}`);
            reject(err);
          } else {
            resolve(token);
          }
        }
      );
    });
  } catch (error) {
    console.log(`Error in generate access token: ${error}`);
    return null;
  }
};

const verifyToken = async (token, secretKey) => {
  try {
    return new Promise((resolve) => {
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.log(`Error in verify access token:  + ${error}`);
    return null;
  }
};

const decodeToken = async (token, secretKey) => {
  try {
    return new Promise((resolve) => {
      jwt.verify(
        token,
        secretKey,
        { ignoreExpiration: true },
        (err, decoded) => {
          if (err) {
            console.log(`Error in decode access token: ${err}`);
            resolve(null);
          } else {
            resolve(decoded);
          }
        }
      );
    });
  } catch (error) {
    console.log(`Error in decode access token: ${error}`);
    return null;
  }
};

const generatePasswordResetToken = async (user: User, secretSignature) => {
  const payload = {
    user_id: user.user_id,
    email: user.email,
  };

  const token = await generateToken(payload, secretSignature, "1h");

  return token;
};

const sendPasswordResetEmail = async (user: User, token: string) => {
  try {
    if (!process.env.FRONTEND_URL) {
      throw new Error("FRONTEND_URL environment variable is not set");
    }
    const resetUrl = new URL("/password-reset", process.env.FRONTEND_URL);
    resetUrl.searchParams.append("token", token);
    resetUrl.searchParams.append("email", user.email);
    const link_reset_password = resetUrl.toString();

    await addEmailResetPasswordJob(user, link_reset_password)

  } catch (error) {
    console.log(`Error in sendPasswordResetEmail: ${error}`);
    throw error;
  }
};

export {
  generateToken,
  verifyToken,
  decodeToken,
  generatePasswordResetToken,
  sendPasswordResetEmail,
};
