const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    profession: {
        type: String,
        required: true,
        trim: true
    },

    bio: {
        type: String,
        required: true
    },

    skills: {
        type: [String],
        default: []
    },

    github: String,
    linkedin: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Profile", profileSchema);