// 📄 Filename: static/js/information.js

document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("submit-query");
    const speakBtn = document.getElementById("speak-button");
    const readBtn = document.getElementById("read-aloud");
    const muteBtn = document.getElementById("mute-response");
    const responseBox = document.getElementById("ai-response");
    const spinner = document.getElementById("loading-spinner");
    const userQuery = document.getElementById("user-query");

    let conversationHistory = [];
    let currentUtterance = null;

    // Voice recognition setup
    const recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Submit typed query
    submitBtn.addEventListener("click", async() => {
        const query = userQuery.value.trim();
        if (query === "") return;
        speechSynthesis.cancel(); // Cancel any speaking before sending new query
        await sendQuery(query);
    });

    // Voice input
    speakBtn.addEventListener("click", () => {
        responseBox.innerHTML += `<div><strong>You:</strong> 🎙️ Listening...</div>`;
        recognition.start();
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userQuery.value = transcript;
    };

    recognition.onend = async() => {
        const query = userQuery.value.trim();
        if (query !== "") {
            speechSynthesis.cancel();
            await sendQuery(query);
        }
    };

    recognition.onerror = (event) => {
        console.error("🎤 Speech recognition error:", event.error);
        responseBox.innerHTML += `<div class="error">❌ Speech recognition error: ${event.error}</div>`;
    };

    // Read last response aloud
    readBtn.addEventListener("click", () => {
        const lastResponse = conversationHistory.filter(m => m.role === "assistant").pop();
        if (lastResponse) {
            speakText(lastResponse.content);
        }
    });

    // Mute current speech only
    muteBtn.addEventListener("click", () => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            currentUtterance = null;
        }
    });

    function speakText(text) {
        if (!text) return;
        speechSynthesis.cancel(); // Stop previous speech if ongoing
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            const englishVoice = voices.find(v => v.lang === 'en-US') || voices[0];
            utterance.voice = englishVoice;
        }
        currentUtterance = utterance;
        speechSynthesis.speak(utterance);
    }

    async function sendQuery(query) {
        spinner.style.display = "block";
        userQuery.value = "";

        conversationHistory.push({ role: "user", content: query });
        responseBox.innerHTML += `<div><strong>You:</strong> ${query}</div>`;

        try {
            const res = await fetch("/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: query,
                    mode: "information",
                    history: conversationHistory
                })
            });

            const data = await res.json();
            spinner.style.display = "none";

            if (data.response) {
                conversationHistory.push({ role: "assistant", content: data.response });
                responseBox.innerHTML += `<div><strong>Companion:</strong> ${data.response}</div>`;
                speakText(data.response);
            } else {
                responseBox.innerHTML += `<div class="error">⚠️ Sorry, no response received.</div>`;
            }
        } catch (error) {
            spinner.style.display = "none";
            console.error("❌ Fetch error:", error);
            responseBox.innerHTML += `<div class="error">❌ An error occurred: ${error.message}</div>`;
        }

        // Scroll to bottom
        responseBox.scrollTop = responseBox.scrollHeight;
    }
});