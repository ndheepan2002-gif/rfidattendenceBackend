const axios = require("axios");

exports.sendSMS = async (mobile, message) => {
  try {
    console.log("FAST2SMS KEY:", process.env.FAST2SMS_API_KEY);
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message: message,
        language: "english",
        numbers: mobile,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY, // MUST be valid
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ SMS Sent:", response.data);
    return response.data;

  } catch (err) {
    console.error(
      "❌ SMS Error:",
      err.response?.data || err.message
    );
    return null;
  }
};
