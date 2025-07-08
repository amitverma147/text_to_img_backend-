import userModel from "../models/User.model.js";
import FormData from "form-data";
import axios from "axios";

export const generateImage = async (req, res) => {
  try {
    const { userId, prompt } = req.body;
    const user = await userModel.findById({ userId });
    if (!user || !prompt) {
      return res.json({ success: false, message: "Missing Details" });
    }
    if (user.crediBalance === 0 || userModel.crediBalance < 0) {
      return res.json({
        success: false,
        message: "No Credit Balance",
        crediBalance: user.crediBalance,
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API,
        },
        responseType: "arraybuffer",
      }
    );
    const base64Image = Buffer.from(data, "binary").toString("base64");
    const resultImage = `data:image/png;base64,${base64Image}`;
    await userModel.findByIdAndUpdate(user._id, {
      crediBalance: user.crediBalance - 1,
    });
    res.json({
      success: true,
      message: "Image Generated",
      crediBalance: user.crediBalance - 1,
      resultImage,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
