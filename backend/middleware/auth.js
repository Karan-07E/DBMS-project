const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization').replace('Bearer ', '');
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '5845aa83e869a60b359bde97c1c90a758c9cc067d40d2386614418d20558bfa2328b84a00d24924116ff46ef281bdca5f644ebb3f6080883daa86da812582e07');
        
        // Find user with matching id and token
        const user = await User.findById(decoded._id);
        
        if (!user) {
            throw new Error();
        }
        
        // Add user to request object
        req.user = user;
        req.token = token;
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

module.exports = auth;