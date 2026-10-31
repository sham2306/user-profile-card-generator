require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Profile = require("./models/Profile");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// HTML escaping
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];
    });
}

// Validate social media URLs
function safeURL(value) {
    if (!value) return "";

    try {
        const parsed = new URL(value);

        if (parsed.protocol === "http:" ||
            parsed.protocol === "https:") {
            return parsed.href;
        }

        return "";
    } catch {
        return "";
    }
}

// Generate profile card HTML



function generateProfileCard(profile) {

    const name = escapeHTML(profile.name);
    const profession = escapeHTML(profile.profession);
    const bio = escapeHTML(profile.bio);

    const initials = profile.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");

    const skills = profile.skills.map(skill =>
        `<span class="skill">${escapeHTML(skill)}</span>`
    ).join("");

    const github = safeURL(profile.github);
    const linkedin = safeURL(profile.linkedin);

    return `
        <div class="profile-card">

            <div class="profile-top">

                <div class="avatar">
                    ${escapeHTML(initials)}
                </div>

                <div>
                    <h3>${name}</h3>
                    <span class="profession">
                        ${profession}
                    </span>
                </div>

            </div>

            <div class="profile-divider"></div>

            <h4>ABOUT ME</h4>
            <p class="profile-about">${bio}</p>

            <h4>TECHNICAL SKILLS</h4>

            <div>
                ${skills || "No skills added"}
            </div>

            <div class="social-links">

                ${github ? `
                    <a href="${escapeHTML(github)}"
                    target="_blank"
                    rel="noopener noreferrer">
                    GitHub ↗</a>` : ""}

                ${linkedin ? `
                    <a href="${escapeHTML(linkedin)}"
                    target="_blank"
                    rel="noopener noreferrer">
                    LinkedIn ↗</a>` : ""}

            </div>

        </div>
    `;
}

// Create profile API
app.post("/api/profiles", async (req, res) => {

    try {

const { name, profession, bio, skills, github, linkedin } = req.body;
if (!name?.trim() || !profession?.trim() || !bio?.trim()) {            return res.status(400).json({
                error: "Name and Bio are required"
            });
        }

        // String manipulation
        const processedName = name.trim().replace(/\s+/g, " ");
        const processedBio = bio.trim();

        const processedSkills = (skills || "")
            .split(",")
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);

        // Save profile in MongoDB
        const profile = await Profile.create({
            name: processedName,
            profession: profession.trim(),
            bio: processedBio,
            skills: processedSkills,
            github: safeURL(github),
            linkedin: safeURL(linkedin)
        });

        // Generate dynamic HTML
        const cardHTML = generateProfileCard(profile);

        res.status(201).json({
            message: "Profile created successfully",
            profileId: profile._id,
            cardHTML: cardHTML
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error while creating profile"
        });

    }
});

// Get all profiles
app.get("/api/profiles", async (req, res) => {

    try {

        const profiles = await Profile.find()
            .sort({ createdAt: -1 });

        res.json(profiles);

    } catch (error) {

        res.status(500).json({
            error: "Unable to retrieve profiles"
        });

    }
});

// Connect MongoDB and start server
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {

        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    })
    .catch(error => {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    });