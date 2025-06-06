const { CHATBOT_API_KEY } = require('../config/vf');

const chatbotAuthMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-chatbot-api-key'];
  if (apiKey === CHATBOT_API_KEY) {
    console.log("API key is valid");
    next();
  } else {
    res.status(401).json({ message: 'Invalid API key' });
  }
};

export {chatbotAuthMiddleware};