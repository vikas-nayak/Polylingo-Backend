const express = require("express");
const translatte = require("translatte");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3004;

app.use(express.json());
app.use(cors());

app.get("/", (res, req) => {
  res.send("Working");
});

app.get("/translate", async (req, res) => {
  try {
    const texts = Array.isArray(req.query.text)
      ? req.query.text
      : [req.query.text];
    const targetLanguage = req.query.to;

    // Use Promise.all to concurrently translate multiple texts
    const translationPromises = texts.map(async (text) => {
      const translation = await translatte(text, { to: targetLanguage });
      return { originalText: text, translatedText: translation.text };
    });

    // Wait for all translations to complete
    const translations = await Promise.all(translationPromises);

    res.json(translations);
  } catch (error) {
    res.status(500).json({ error: "Translation error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
