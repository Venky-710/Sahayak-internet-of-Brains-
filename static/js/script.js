// Simulate API Key and Mode-based Response
const apiKey = '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'; // Use an API key for the LLM (e.g., OpenAI, Gemini)
let selectedMode = '';

// Mode Selection
document.getElementById('religion-mode').addEventListener('click', () => {
    selectedMode = 'religion';
    updateMode();
});

document.getElementById('wellness-mode').addEventListener('click', () => {
    selectedMode = 'wellness';
    updateMode();
});

document.getElementById('order-mode').addEventListener('click', () => {
    selectedMode = 'order';
    updateMode();
});

document.getElementById('information-mode').addEventListener('click', () => {
    selectedMode = 'information';
    updateMode();
});

// Update UI based on the selected mode
function updateMode() {
    // Here, you could change the page layout or update the message based on the selected mode
    const responseContainer = document.getElementById('ai-response');
    const modeMessage = {
        religion: "You are in Religious Companion Mode. Ask about religious teachings, stories, etc.",
        wellness: "You are in Wellness Mode. Ask about health, wellness, exercises, etc.",
        order: "You are in Order Mode. Place your food or product order.",
        information: "You are in Information Mode. Ask about general knowledge or specific topics."
    };

    // Update the page
    responseContainer.textContent = modeMessage[selectedMode];
}

// Handle speech input (using the Web Speech API)
document.getElementById('speak-button').addEventListener('click', () => {
    const recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = async function(event) {
        const query = event.results[0][0].transcript;
        document.getElementById('user-query').value = query;
        showLoading(true);
        const response = await getAIResponse(query);
        document.getElementById('ai-response').textContent = response;
        showLoading(false);
    };
});

// Handle query submission (text input)
document.getElementById('submit-query').addEventListener('click', async() => {
    const query = document.getElementById('user-query').value;
    if (query) {
        showLoading(true);
        const response = await getAIResponse(query);
        document.getElementById('ai-response').textContent = response;
        showLoading(false);
    }
});

// Get AI response based on mode
async function getAIResponse(query) {
    const prompt = generatePrompt(selectedMode, query);

    try {
        const response = await fetch('/ask-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, mode: selectedMode, prompt: prompt })
        });
        const data = await response.json();
        return data.answer;
    } catch (error) {
        return "Sorry, I couldn't find an answer. Please try again later.";
    }
}

// Generate the appropriate prompt for the LLM based on the mode
function generatePrompt(mode, query) {
    switch (mode) {
        case 'religion':
            return `Respond to the following query about religious topics, focusing on stories and teachings, in a way that is engaging and easy for a senior citizen to understand: ${query}`;
        case 'wellness':
            return `Respond to the following query about health and wellness, offering supportive and informative advice suitable for a senior citizen: ${query}`;
        case 'order':
            return `Help place an order for food or a product. Here is the order request: ${query}`;
        case 'information':
            return `Respond to the following query about general knowledge or specific topics. Query: ${query}`;
        default:
            return `Provide an answer to the following query: ${query}`;
    }
}

// Show or hide the loading spinner
function showLoading(isLoading) {
    const spinner = document.getElementById('loading-spinner');
    const responseText = document.getElementById('ai-response');
    if (isLoading) {
        spinner.style.display = 'inline-block';
        responseText.textContent = "I'm processing your query... Please wait.";
    } else {
        spinner.style.display = 'none';
    }
}

// Read aloud the response using the Web Speech API
document.getElementById('read-aloud').addEventListener('click', () => {
    const textToRead = document.getElementById('ai-response').textContent;
    const speech = new SpeechSynthesisUtterance(textToRead);
    window.speechSynthesis.speak(speech);
});