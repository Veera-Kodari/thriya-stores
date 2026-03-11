const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { PORT } = require('../config');
const connectDB = require('../config/db');
const routes = require('../routes');
const { requestLogger } = require('../middleware/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(requestLogger);

// API Routes
app.use('/api', routes);

// Serve React frontend (only if build exists)
const clientBuildPath = path.join(__dirname, '..', '..', 'client', 'build');
if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get('/{*splat}', (req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}

// Connect to MongoDB, then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});