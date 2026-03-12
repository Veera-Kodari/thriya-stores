const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
        },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        phone: { type: String, trim: true, default: '' },
        gender: { type: String, enum: ['', 'male', 'female', 'other'], default: '' },
        dateOfBirth: { type: Date, default: null },
        profilePic: { type: String, default: '' },
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        addresses: [
            {
                label: { type: String, default: 'Home' },
                fullName: { type: String, required: true },
                phone: { type: String, required: true },
                addressLine1: { type: String, required: true },
                addressLine2: { type: String, default: '' },
                city: { type: String, required: true },
                state: { type: String, required: true },
                pincode: { type: String, required: true },
                isDefault: { type: Boolean, default: false },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON responses
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
