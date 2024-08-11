const express = require("express");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Set up port
const port = process.env.PORT || 8319;

// Middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1d" }));

// Custom middleware to add request time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// API routes
const apiRouter = express.Router();

apiRouter.get("/time", (req, res) => {
  res.json({ currentTime: req.requestTime });
});

apiRouter.get("/env", (req, res) => {
  res.json({ nodeEnv: process.env.NODE_ENV });
});

apiRouter.post("/echo", (req, res) => {
  res.json(req.body);
});

app.use("/api", apiRouter);

// Main route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Start server
if (process.env.NODE_ENV === "production") {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, "ssl", "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "ssl", "cert.pem")),
  };

  https.createServer(httpsOptions, app).listen(443, () => {
    console.log("HTTPS Server running on port 443");
  });
} else {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("Shutting down gracefully...");
  app.close(() => {
    console.log("Closed out remaining connections");
    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Monitor memory usage
setInterval(() => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Memory usage: ${Math.round(used * 100) / 100} MB`);
}, 60000);
