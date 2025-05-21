const { formatTime } = require('../utils/time-formatter');

// Middleware to log request times and add current time to response
const timeLogger = (req, res, next) => {
    const startTime = new Date();
    const formattedTime = formatTime(startTime);
    
    console.log(`[${formattedTime}] ${req.method} ${req.url}`);
    
    // Add current time to response locals
    res.locals.currentTime = formattedTime;
    
    // Add current time to response headers
    res.setHeader('X-Current-Time', formattedTime);
    
    next();
};

module.exports = { timeLogger };