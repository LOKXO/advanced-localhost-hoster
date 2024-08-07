const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('combined'));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const apiRouter = express.Router();

apiRouter.get('/time', (req, res) => {
  res.json({ currentTime: req.requestTime });
});

apiRouter.get('/env', (req, res) => {
  res.json({ nodeEnv: process.env.NODE_ENV });
});

apiRouter.post('/echo', (req, res) => {
  res.json(req.body);
});

app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

if (process.env.NODE_ENV === 'production') {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'))
  };

  https.createServer(httpsOptions, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });
} else {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

const gracefulShutdown = () => {
  console.log('Received kill signal, shutting down gracefully');
  app.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

setInterval(() => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Memory usage: ${Math.round(used * 100) / 100} MB`);
}, 60000);