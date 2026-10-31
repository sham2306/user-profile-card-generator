const form = document.getElementById("profileForm");

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const profileData = {
        name: document.getElementById("name").value,
        profession: document.getElementById("profession").value,
        bio: document.getElementById("bio").value,
        skills: document.getElementById("skills").value,
        github: document.getElementById("github").value,
        linkedin: document.getElementById("linkedin").value
    };

    const message = document.getElementById("message");
    const preview = document.getElementById("profilePreview");

    message.textContent = "Generating your profile...";

    try {

        const response = await fetch("/api/profiles", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(profileData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Something went wrong");
        }

        preview.innerHTML = result.cardHTML;

        message.textContent =
            "✓ Professional profile generated successfully!";

        form.reset();

    } catch (error) {

        message.textContent = error.message;

    }

});