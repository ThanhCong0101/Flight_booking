import OpenAI from "openai";

import dotenv from "dotenv";
dotenv.config();

const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openai = new OpenAI(configuration);

export default openai;
