const OpenAI = require("openai");
const dotenv = require("dotenv");
const Car = require("../models/car.model.js");
const User = require("../models/user.model.js"); 

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});


const getAiRecommendations = async (req, res) => {
  try {
    const { budget, carType, brand, userId } = req.body; 

    if (!budget) {
      return res.status(400).json({ message: "Budget is required." });
    }

    const cars = await Car.find({
      price: { $lte: budget },
      ...(carType && { type: carType }),
      ...(brand && { brand }),
    }).limit(10);

    const carDataString = cars.length
      ? cars.map(c => `${c.brand} ${c.name} (${c.year}) - $${c.price}`).join(", ")
      : "No matching cars found.";

    const prompt = `
Suggest the top 5 cars available in the USA under $${budget}.
Include ${carType ? "only " + carType : "any type"} cars.
${brand ? "Focus on " + brand + " brand." : ""}
${carDataString ? "Use the following car data: " + carDataString : ""}
Mention model, year, price, and one-line reason.
Answer in simple bullet list format.
`;

    const aiResponse = await openai.responses.create({
      model: "gpt-5-nano",
      input: prompt,
      store: false,
    });

    const reply = aiResponse.output_text || "No AI response received.";

 
    if (userId) {
      await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            savedSearches: {
              query: `Car Recommendations under $${budget} (${carType || "any type"}) ${brand ? "- " + brand : ""}`,
              reply,
              date: new Date(),
            },
          },
        },
        { new: true }
      );
    }

    return res.status(200).json({
      message: "✅ AI Car Recommendations Generated",
      aiReply: reply,
      carsFound: cars,
    });
  } catch (err) {
    console.error("❌ Error in getAiRecommendations:", err.message);
    return res.status(500).json({
      message: `Internal server error: ${err.message}`,
    });
  }
};


const handleCarQuery = async (req, res) => {
  try {
    const { query, userId } = req.body;
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Query is required." });
    }

    const carKeywords = [
      "car", "cars", "suv", "sedan", "hatchback", "electric", "engine",
      "fuel", "hybrid", "mileage", "price", "model", "brand", "toyota",
      "honda", "bmw", "tesla", "audi", "recommend", "buy", "sell"
    ];

    const isCarRelated = carKeywords.some((word) =>
      query.toLowerCase().includes(word)
    );

    if (!isCarRelated) {
      return res.status(200).json({
        message: "🚫 Non-Car Query",
        aiReply:
          "Sorry, I’m designed to answer questions only about cars, car prices, models, or recommendations. Please ask something related to cars. 🚗",
      });
    }

    const cars = await Car.find().limit(10);
    const carDataString = cars.length
      ? cars.map((c) => `${c.brand} ${c.name} (${c.year}) - $${c.price}`).join(", ")
      : "No car data available.";

    const prompt = `
You are an AI car expert.
User Query: "${query}"
${carDataString ? "Available cars: " + carDataString : ""}
Answer briefly and clearly.
`;

    const aiResponse = await openai.responses.create({
      model: "gpt-5-nano",
      input: prompt,
      store: true,
    });

    const reply = aiResponse.output_text || "I couldn't find an answer.";

    if (userId) {
      await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            savedSearches: { query, reply, date: new Date() },
          },
        },
        { new: true }
      );
    }

    return res.status(200).json({
      message: "✅ AI Car Chat Response",
      aiReply: reply,
    });
  } catch (err) {
    console.error("❌ Error in handleCarQuery:", err.message);
    return res.status(500).json({
      message: `Internal server error: ${err.message}`,
    });
  }
};


module.exports = { getAiRecommendations, handleCarQuery };
