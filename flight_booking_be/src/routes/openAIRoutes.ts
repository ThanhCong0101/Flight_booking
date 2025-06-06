import * as express from "express";
const router = express.Router();
import colors from "colors";
import { z } from 'zod';
import { zodResponseFormat } from "openai/helpers/zod";

import openai from "../config/open-ai";
import { chatbotAuthMiddleware } from "../middleware/chatbotAuthMiddleware";

// Function to create dynamic Zod schema from request body format
const createDynamicSchema = (format: Record<string, any>) => {
  const schemaMap = {
    string: z.string(),
    number: z.number(),
    boolean: z.boolean(),
    array: z.array(z.any()),
    object: z.record(z.any()),
    any: z.any()
  };

  const buildSchema = (obj: Record<string, any>): z.ZodType => {
    const schemaObj: Record<string, any> = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        schemaObj[key] = buildSchema(value);
      } else {
        schemaObj[key] = schemaMap[value as keyof typeof schemaMap] || z.any();
      }
    });

    return z.object(schemaObj);
  };

  return buildSchema(format);
};

// In-memory storage for chat history (temporary, use a database for production)
let chatHistories = {};

// Helper to construct prompt
function constructPrompt(chatHistory, prompt: string, userMessage: string) {
  const systemMessage = {
    role: "system",
    content: prompt,
  };

  return [
    systemMessage,
    ...chatHistory,
    { role: "user", content: userMessage },
  ];
}

router.post("/chat", chatbotAuthMiddleware, async (req, res) => {
  const { message, prompt_voiceflow, sessionId, isJSONResponse } = req.body; // Expecting { "sessionId": "unique_user_id", "query": "user's message" }

  console.log(colors.blue("message: "), message);
  console.log(colors.blue("sessionId: "), sessionId);
  console.log(colors.blue("prompt_voiceflow: "), prompt_voiceflow);

  // console.log(colors.blue("prompt_voiceflow: "), prompt_voiceflow); 

  if (!sessionId || !message) {
    return res
      .status(400)
      .json({ error: "sessionId and message are required" });
  }

  // Initialize chat history for new sessions
  if (!chatHistories[sessionId]) {
    chatHistories[sessionId] = [];
  }

  try {
    // Construct prompt
    const prompt = constructPrompt(
      chatHistories[sessionId],
      prompt_voiceflow,
      message
    );

    // const sampleReq = {
    //   "duration": {
    //     "min": "number",
    //     "max": "number",
    //     "multiCityMin": "number",
    //     "multiCityMax": "number"
    //   },
    // }
    // const dynamicSchema = createDynamicSchema(sampleReq);

    // console.log("dynamicSchema:", dynamicSchema)
    
    // Send the message to OpenAI API for chat completion
    let completion
    let reply = '';
    if(isJSONResponse){
      // completion = await openai.chat.completions.create({
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // You can change this to gpt-4 or another model if needed
        messages: prompt,
        temperature: 0.7, // Add temperature for response variability
        max_tokens: 500, // Limit response length
        // response_format: zodResponseFormat(dynamicSchema, "schema"),
        response_format: { type: "json_object" }
        // messages: [{ role: "user", content: message }],
      });

      console.log("message is JSON:", completion.choices[0].message.content.trim())
      reply = completion.choices[0].message.content.trim();
    }else{
      // completion = await openai.chat.completions.create({
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // You can change this to gpt-4 or another model if needed
        messages: prompt,
        temperature: 0.7, // Add temperature for response variability
        max_tokens: 500, // Limit response length
        // messages: [{ role: "user", content: message }],
      });
      
      console.log("message is text:", completion.choices[0])
      reply = completion.choices[0].message.content;
    }

    

    chatHistories[sessionId].push(
      { role: "user", content: message },
      { role: "assistant", content: reply }
    );

    // const responseMessage = completion.choices[0].message.content;

    // console.log("responseMessage: ", responseMessage);  

    // Truncate chat history if it's too long
    const maxMessages = 10;
    if (chatHistories[sessionId].length > maxMessages) {
      chatHistories[sessionId] = chatHistories[sessionId].slice(-maxMessages);
    }

    res.json({ reply: reply });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    res.status(500).send("Error processing the request");
  }
});

module.exports = router;
