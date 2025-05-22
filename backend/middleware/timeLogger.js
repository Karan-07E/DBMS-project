const moment = require('moment');

/**
 * Middleware to log the time taken for each request
 */
const timeLogger = (req, res, next) => {
  // Record start time
  const start = moment();
  
  // Store original end function
  const originalSend = res.send;
  
  // Override res.send
  res.send = function() {
    // Calculate time taken
    const duration = moment().diff(start);
    
    // Log request method, path, and time taken
    console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
    
    // Call original send function
    return originalSend.apply(res, arguments);
  };
  
  next();
};

module.exports = timeLogger;
