import express from 'express';
import Redis from 'ioredis';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables

// Load default configurations from config.env first
// These variables will be set in process.env
dotenv.config({ path: './config.env' });

// Load variables from .env if it exists.
// By default (without 'override: true'), dotenv will NOT overwrite any environment variables
// that are already set. So, if a variable is in both config.env and .env,
// the value from config.env will be used.
// .env is primarily for adding variables not present in config.env (e.g., secrets).
dotenv.config(); // Loads from default '.env' path

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Origin', 'Accept', 'X-Requested-With'],
    credentials: false,
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Redis Connection
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_URI = process.env.REDIS_URI || `redis://${REDIS_HOST}:6379`;

let redisAvailable = false;
const redisClient = new Redis(REDIS_URI, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,
  enableOfflineQueue: false,
});

redisClient.on('connect', () => {
  console.log('Connected to Redis at', REDIS_URI);
  redisAvailable = true;
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
  redisAvailable = false;
});

redisClient.on('end', () => {
  console.log('Redis connection closed');
  redisAvailable = false;
});

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the MERN Stack API' });
});

// Badge generator functions
function generateSvgBadge({
  title = 'hits',
  dailyCount = 0,
  totalCount = 0,
  titleBg = '#555',
  countBg = '#4c1',
  textColor = '#fff',
  edgeFlat = false,
  iconSvg = '',
  iconColor = '#fff',
}) {
  const paddingX = 10;
  const paddingY = 4;
  const fontSize = 11;
  const charWidth = 7;
  const iconWidth = iconSvg ? 20 : 0;
  const iconSpacing = iconSvg ? 5 : 0;

  const titleTextWidth = title.length * charWidth;
  const countText = `${dailyCount}/${totalCount}`;
  const countTextWidth = countText.length * charWidth;

  const titleSectionWidth =
    titleTextWidth + paddingX * 2 + iconWidth + iconSpacing;
  const countSectionWidth = countTextWidth + paddingX * 2;
  const totalWidth = titleSectionWidth + countSectionWidth;
  const height = 20;
  const borderRadius = edgeFlat ? 0 : 3;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
      <style>
        .titleText, .countText {
          font-family: Verdana, Geneva, DejaVu Sans, sans-serif;
          font-size: ${fontSize}px;
          fill: ${textColor};
          text-anchor: middle;
        }
        .icon {
          fill: ${iconColor};
        }
      </style>
      <rect x="0" y="0" width="${titleSectionWidth}" height="${height}" fill="${titleBg}" rx="${borderRadius}" ry="${borderRadius}" />
      <rect x="${titleSectionWidth}" y="0" width="${countSectionWidth}" height="${height}" fill="${countBg}" rx="${borderRadius}" ry="${borderRadius}" />
      
      ${iconSvg ? `<g class="icon" transform="translate(${paddingX}, ${(height - 14) / 2})">${iconSvg}</g>` : ''}
      
      <text x="${paddingX + iconWidth + iconSpacing + titleTextWidth / 2}" y="${height / 2 + paddingY}" class="titleText">${title}</text>
      <text x="${titleSectionWidth + countSectionWidth / 2}" y="${height / 2 + paddingY}" class="countText">${countText}</text>
    </svg>
  `;
}

async function getAndUpdateCounts(pageUrl, doIncrement = true) {
  try {
    if (!redisAvailable) {
      console.log('Redis is not available, using mock data');
      return {
        dailyCount: Math.floor(Math.random() * 100),
        totalCount: Math.floor(Math.random() * 1000),
      };
    }

    const dailyKey = `hits:daily:${pageUrl}:${new Date().toISOString().split('T')[0]}`;
    const totalKey = `hits:total:${pageUrl}`;
    let dailyCount = 0;
    let totalCount = 0;
    if (doIncrement) {
      dailyCount = await redisClient.incr(dailyKey);
      totalCount = await redisClient.incr(totalKey);
      await redisClient.expire(dailyKey, 60 * 60 * 24 * 2);
    } else {
      const dailyVal = await redisClient.get(dailyKey);
      const totalVal = await redisClient.get(totalKey);
      dailyCount = parseInt(dailyVal || '0');
      totalCount = parseInt(totalVal || '0');
    }
    return { dailyCount, totalCount };
  } catch (error) {
    console.error('Error updating/retrieving counts:', error);
    return {
      dailyCount: Math.floor(Math.random() * 100),
      totalCount: Math.floor(Math.random() * 1000),
    };
  }
}

// Badge endpoints
app.get('/api/count/incr/badge.svg', async (req, res) => {
  const {
    url: pageUrl,
    title,
    title_bg: titleBg,
    count_bg: countBg,
    edge_flat: edgeFlat,
  } = req.query;

  if (!pageUrl) {
    return res.status(400).send('URL parameter is required.');
  }

  try {
    const { dailyCount, totalCount } = await getAndUpdateCounts(pageUrl, true);
    const svg = generateSvgBadge({
      title: title || 'hits',
      dailyCount,
      totalCount,
      titleBg,
      countBg,
      edgeFlat: edgeFlat === 'true',
    });
    // Set response headers for SVG content and CORS
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.send(svg);
  } catch (error) {
    console.error('Error in /badge.svg:', error);
    res.status(500).send('Error generating badge');
  }
});

app.get('/api/count/keep/badge.svg', async (req, res) => {
  const {
    url: pageUrl,
    title,
    title_bg: titleBg,
    count_bg: countBg,
    edge_flat: edgeFlat,
  } = req.query;

  if (!pageUrl) {
    return res.status(400).send('URL parameter is required.');
  }

  try {
    const { dailyCount, totalCount } = await getAndUpdateCounts(pageUrl, false);
    const svg = generateSvgBadge({
      title: title || 'hits',
      dailyCount,
      totalCount,
      titleBg,
      countBg,
      edgeFlat: edgeFlat === 'true',
    });
    // Set response headers for SVG content and CORS
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.send(svg);
  } catch (error) {
    console.error('Error in /api/count/keep/badge.svg:', error);
    res.status(500).send('Error generating badge');
  }
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('../client/dist'));

  app.get('*', (req, res) => {
    res.sendFile(
      path.resolve(__dirname, '../', 'client', 'dist', 'index.html')
    );
  });
}

// Start server with port fallback
const startServer = (port) => {
  const server = app
    .listen(port)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(
          `Port ${port} is already in use, trying port ${port + 1}...`
        );
        server.close();
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    })
    .on('listening', () => {
      const actualPort = server.address().port;
      console.log(
        `Server running on port ${actualPort} in ${process.env.NODE_ENV} mode`
      );

      // Update client env if needed
      if (actualPort !== PORT) {
        console.log(
          `Note: Server running on different port than configured. API calls might need adjustment.`
        );
      }
    });
};

startServer(PORT);
