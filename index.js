const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer();
app.use(cors());

// Ganti dengan API Key PixelDrain kamu
const PIXELDRAIN_API_KEY = process.env.PIXELDRAIN_API_KEY;

// 📤 Endpoint upload gambar ke PixelDrain
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const form = new FormData();
  form.append("file", req.file.buffer, req.file.originalname);

  try {
    const response = await axios.post("https://pixeldrain.com/api/file", form, {
      headers: {
        Authorization:
          "Basic " + Buffer.from(":" + PIXELDRAIN_API_KEY).toString("base64"),
        ...form.getHeaders(),
      },
    });

    const fileId = response.data.id;
    res.json({
      success: true,
      id: fileId,
      url: `https://pixeldrain.com/api/file/${fileId}?download`,
    });
  } catch (error) {
    console.error("Upload error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

// ❌ Endpoint DELETE gambar dari PixelDrain
app.delete("/delete/:id", async (req, res) => {
  const fileId = req.params.id;

  try {
    const response = await axios.delete(
      `https://pixeldrain.com/api/file/${fileId}`,
      {
        headers: {
          Authorization:
            "Basic " + Buffer.from(":" + PIXELDRAIN_API_KEY).toString("base64"),
        },
      }
    );

    res.json({ success: true, deleted: true });
  } catch (err) {
    console.error("Delete error:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
