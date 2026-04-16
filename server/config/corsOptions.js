const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Dynamic CORS mapping for Production
    methods: ["GET", "POST"]
};

module.exports = corsOptions;
