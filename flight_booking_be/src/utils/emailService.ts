import { User } from "../models/entity/User";

let Mailgen = require("mailgen");
const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  REFRESH_TOKEN,
} = require("../config/auth");

import nodemailer from "nodemailer";
import { convertToLocationTimezone } from "./timezoneUtils";
const { google } = require("googleapis");

const emailResetPasswordTemplate = (user: User, link: string) => {
  var mailGenerator = new Mailgen({
    theme: "default",
    product: {
      // Appears in header & footer of e-mails
      name: "Mailgen",
      link: "https://mailgen.js/",
      // Optional logo
      // logo: 'https://mailgen.js/img/logo.png'
    },
  });

  // Prepare email contents
  var email = {
    body: {
      name: user.first_name,
      intro:
        "You have received this email because a password reset request for your account was received.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#DC4D2F",
          text: "Reset your password",
          link: link,
        },
      },
      outro:
        "If you did not request a password reset, no further action is required on your part.",
    },
  };

  // Generate an HTML email with the provided contents
  var emailBody = mailGenerator.generate(email);

  // Generate the plaintext version of the e-mail (for clients that do not support HTML)
  var emailText = mailGenerator.generatePlaintext(email);

  return { emailBody, emailText };
};

const bookingInvoiceTemplate = (booking: any, itinerary: any) => {
  console.log("booking", booking);

  const user = booking.user;

  var mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Flight Booking",
      link: "http://localhost:4200",
    },
  });

  var email = {
    body: {
      name: user.first_name,
      intro: "Thank you for your booking! Here are your flight details:",
      table: {
        data: [
          {
            item: "Booking ID",
            description: booking.booking_id,
          },
          {
            item: "Flight Route",
            description: `${itinerary.legs[0].origin_iata} to ${itinerary.legs[0].destination_iata}`,
          },
          {
            item: "Departure",
            description: convertToLocationTimezone(
              new Date(itinerary.legs[0].departure_time),
              user.timezone
            ),
          },
          {
            item: "Total Price",
            description: booking.total_price,
          },
        ],
      },

      action: {
        instructions: "To See more information, click it",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Confirm your booking",
          link: `http://localhost:4200/invoice?booking_id=${booking.booking_id}`,
        },
      },
      outro: "Looking forward to serving you on your journey!",
    },
  };

  var emailBody = mailGenerator.generate(email);
  var emailText = mailGenerator.generatePlaintext(email);

  return { emailBody, emailText };
};

const flightReminderTemplate = (itinerary: any, booking: any, user: any) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Flight Booking",
      link: "http://localhost:4200",
    },
  });

  const departureTime = convertToLocationTimezone(
    new Date(itinerary.legs[0].departure_time),
    user.timezone
  );

  const email = {
    body: {
      name: user.first_name,
      intro: `Your flight is departing in 3 hours!`,
      table: {
        data: [
          {
            item: "Flight",
            description: `${itinerary.legs[0].origin_iata} to ${itinerary.legs[0].destination_iata}`,
          },
          {
            item: "Departure Time",
            description: departureTime,
          },
          {
            item: "Booking ID",
            description: booking.booking_id,
          },
        ],
      },
      action: {
        instructions: "Click here to view your booking details:",
        button: {
          color: "#22BC66",
          text: "View Booking",
          link: `http://localhost:4200/invoice?booking_id=${booking.booking_id}`,
        },
      },
      outro: "Have a safe and pleasant journey!",
    },
  };

  const emailBody = mailGenerator.generate(email);
  const emailText = mailGenerator.generatePlaintext(email);

  return { emailBody, emailText };
};

const sendEmail = async (user: User, subject: string, message) => {
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  try {
    const accessToken = await oAuth2Client.getAccessToken();

    let config = {
      service: "Gmail", // your email domain
      auth: {
        type: "OAuth2",
        user: process.env.NODEJS_GMAIL_APP_USER, // your email address
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    };

    const transporter = nodemailer.createTransport(config);

    let mailOptions = {
      from: "support@flightbooking.com", // sender address
      to: user.email, // lemailBodyist of receivers
      subject: subject, // Subject line
      text: message.emailText, // plain text body
      html: message.emailBody, // html body
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error in sendPasswordResetEmail: ${error}`);
    return null;
  }
};

const sendBookingInvoice = async (booking, itinerary) => {
  const message = bookingInvoiceTemplate(booking, itinerary);
  const user = booking.user;
  await sendEmail(user, "Flight Booking Confirmation", message);
};

const sendPasswordResetEmail = async (
  user: User,
  link_reset_password: string
) => {
  const message = emailResetPasswordTemplate(user, link_reset_password);
  await sendEmail(user, "Password Reset", message);
};

const sendFlightReminder = async (itinerary, booking, user) => {
  const message = flightReminderTemplate(itinerary, booking, user);
  await sendEmail(user, "Flight Departure Reminder", message);
};

export {
  emailResetPasswordTemplate,
  sendEmail,
  bookingInvoiceTemplate,
  sendBookingInvoice,
  sendPasswordResetEmail,
  sendFlightReminder,
};
