const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash the password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    
    next();
});

// Method to generate auth token
userSchema.methods.generateAuthToken = function() {
    const user = this;
    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET || '5845aa83e869a60b359bde97c1c90a758c9cc067d40d2386614418d20558bfa2328b84a00d24924116ff46ef281bdca5f644ebb3f6080883daa86da812582e07',
        { expiresIn: '7d' }
    );
    
    return token;
};

// Method to check if password is correct
userSchema.methods.comparePassword = async function(password) {
    const user = this;
    return await bcrypt.compare(password, user.password);
};

// Remove sensitive data when sending user object
userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    
    delete userObject.password;
    
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = { User };