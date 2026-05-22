const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Initialize Gemini API
// Note: Requires GEMINI_API_KEY in .env

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

// @desc    Generate blog post from image and optional prompt
// @route   POST /api/ai/generate
// @access  Private
exports.generatePost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const { prompt } = req.body;
    
    // Defer initialization so that process.env is loaded
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const defaultPrompt = "Analyze this image and generate an engaging blog post about it. Return the output in STRICT JSON format with three fields: 'title' (a catchy string), 'content' (a multi-paragraph engaging blog post string in markdown format), and 'tags' (an array of strings). Do NOT include markdown code block backticks around the json, just output raw JSON text.";
    const finalPrompt = prompt ? `${defaultPrompt} Additionally, focus on this context: ${prompt}` : defaultPrompt;

    const imageParts = [
      fileToGenerativePart(req.file.path, req.file.mimetype)
    ];

    const result = await model.generateContent([finalPrompt, ...imageParts]);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting in Gemini's response
    text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    // Delete local file after processing
    fs.unlinkSync(req.file.path);

    try {
      const jsonResponse = JSON.parse(text);
      res.status(200).json({ success: true, data: jsonResponse });
    } catch (parseError) {
      console.error("Failed to parse Gemini output as JSON", text);
      res.status(500).json({ success: false, error: 'Failed to generate valid structured content from AI' });
    }

  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
