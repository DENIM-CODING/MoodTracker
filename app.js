// i haven't added the code for which timeline would update if localStroage is cleared by user then he would have to reload

const logBtn = document.getElementById("log-button");
const emotionDiv = document.getElementsByClassName("emotion-option");
const msgInput = document.getElementById("message-box");
const addEmotionBtn = document.getElementById("add-emotion-button");

const canvas = document.getElementById("emotionCanvas");
const ctx = canvas.getContext("2d");

//if no event just render timeline heading otherwise all heading
const storedData = localStorage.getItem("events");
if(storedData !== null){
    drawTimeline(JSON.parse(storedData));
}else{
    timelineHeading();
}

function emotionFunc(element){
    for (let i = 0; i < emotionDiv.length; i++) {
        if(emotionDiv[i].classList.contains("selected"))
            emotionDiv[i].classList.remove("selected");
    }
    element.classList.add("selected");
    console.log(element);
}



for (let i = 0; i < emotionDiv.length; i++) {
    emotionDiv[i].addEventListener("click", (event) => {
        emotionFunc(event.target); 
    });
}

//log mood btn event listener
logBtn.addEventListener("click", function(){
    const quoteBox = document.getElementById('quote-box');
    if(document.getElementsByClassName("selected").length==0){
        alert("Select emotion")
        return;
    }
    const selectedEmotion = document.getElementsByClassName("selected")[0].id;
    const message = msgInput.value.trim();
    if(message.length>100){
        alert("Message can't be greater than 100 characters")
        msgInput.value = "";
        msgInput.placeholder = "Add a message...";
        quoteBox.innerText = `"Every day may not be good, but there is something good in every day."`;
        for (let i = 0; i < emotionDiv.length; i++) {
            if(emotionDiv[i].classList.contains("selected"))
                emotionDiv[i].classList.remove("selected");
        }
        return;
    }
    const date = new Date();
    //const dateString = date.toDateString();
    const dateString = date.toISOString().split("T")[0]; // "2025-03-20"

    const storedData = localStorage.getItem("events");
    let events = [];
    if(storedData !== null){
        events = JSON.parse(storedData);
    }
    const existingLog = events.find(event => event.date === dateString);
    
    if (existingLog) {
        alert("You have already logged your mood for today!");
        for (let i = 0; i < emotionDiv.length; i++) {
            if(emotionDiv[i].classList.contains("selected"))
                emotionDiv[i].classList.remove("selected");
        }
        msgInput.value = "";
        msgInput.placeholder = "Add a message...";
        quoteBox.innerText = `"Every day may not be good, but there is something good in every day."`;
        return;
    }
    const mood = {
        date: dateString,
        text: message,
        mood: selectedEmotion
    }
    
    events.push(mood);
    console.log(events);
    localStorage.setItem("events", JSON.stringify(events));
    console.log(localStorage.getItem("events"));
    msgInput.value = "";
    msgInput.placeholder = "Add a message...";
    quoteBox.innerText = `"Every day may not be good, but there is something good in every day."`;
    for (let i = 0; i < emotionDiv.length; i++) {
        if(emotionDiv[i].classList.contains("selected"))
            emotionDiv[i].classList.remove("selected");
    }
    alert("Mood logged successfully!"); 
    drawTimeline(events);

});


//changes for slightly shifting the timeline
function drawTimeline(events) {
    let padding = 50; // Extra space at the top and bottom
    let gap = 50; // Space between events
    let shiftLeft = 45; // Amount to shift everything to the left
    canvas.width = 1200;
    canvas.height = (events.length) * gap + padding * 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Draw vertical timeline line (shifted left)
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(200 - shiftLeft, padding); // Start point (top)
    ctx.lineTo(200 - shiftLeft, canvas.height - padding); // End point
    ctx.stroke();

    // Draw "Timeline" title at the top (shifted left)
    ctx.fillStyle = "#00ccff";
    ctx.beginPath();
    ctx.arc(200 - shiftLeft, padding, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Timeline", 230 - shiftLeft, padding + 5);

    // Draw events on the timeline
    ctx.font = "16px Arial";

    const moodEmojis = {
        happy: "😁",
        sad: "😔",
        neutral: "😐",
        nervous: "😥",
        angry: "😤"
    };
    
    events.forEach((event, index) => {
        let yPos = padding + (index + 1) * gap; 

        // Draw event circle (shifted left)
        ctx.fillStyle = "#ffcc00";
        ctx.beginPath();
        ctx.arc(200 - shiftLeft, yPos, 10, 0, Math.PI * 2);
        ctx.fill();

        // Set text color
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "right";
        ctx.fillText(event.date, 170 - shiftLeft, yPos + 5);

        ctx.textAlign = "left";

        let moodText = event.mood.charAt(0).toUpperCase() + event.mood.slice(1); // Capitalize mood
        let emoji = moodEmojis[event.mood] || ""; // Get emoji or empty string
        let fullText = `${emoji} ${moodText} - ${event.text}`; 

        ctx.fillText(fullText, 230 - shiftLeft, yPos + 5); 

        // Update event position for further use if needed
        event.y = yPos;
    });
}


function timelineHeading(){
    canvas.width = 1200;
    let padding = 50;
    ctx.fillStyle = "#00ccff"; 
    ctx.beginPath();
    ctx.arc(200 - 45 , padding, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Timeline", 230 - 45, padding + 5);
}




const filterButtons = document.querySelectorAll(".filter-btn");

// Function to filter logs based on selected timeframe
function filterLogs(filterType) {
    
    const storedData = localStorage.getItem("events");
if (!storedData) return;

let events = JSON.parse(storedData);
const today = new Date();
today.setHours(0, 0, 0, 0); // Normalize to midnight

if (filterType !== "all") {
    events = events.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0); // Normalize to midnight

        if (filterType === "day") return eventDate.getTime() === today.getTime();
        if (filterType === "week") return (today - eventDate) / (1000 * 60 * 60 * 24) < 7;
        if (filterType === "month") {
            return (
                eventDate.getFullYear() === today.getFullYear() && 
                eventDate.getMonth() === today.getMonth()
            );
        }
    });
}



drawTimeline(events);

    
    document.querySelector(".filter-btn.active")?.classList.remove("active");
    document.querySelector(`[data-filter="${filterType}"]`).classList.add("active");
}

// Add event listeners to filter buttons
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterLogs(btn.dataset.filter);
    });
});


filterLogs("all");


const quotes = {
    happy: [
        "Happiness is not something ready-made. It comes from your own actions.",
        "The best way to cheer yourself up is to try to cheer someone else up.",
        "Keep smiling, because life is a beautiful thing and there's so much to smile about."
    ],
    sad: [
        "Tears come from the heart and not from the brain.",
        "Sadness flies away on the wings of time.",
        "Turn your wounds into wisdom."
    ],
    neutral: [
        "Sometimes, it's okay to be neutral and just observe life.",
        "Balance is not something you find, it’s something you create.",
        "The calm before the storm can sometimes be peaceful."
    ],
    nervous: [
        "Being nervous means you care, just breathe and take your time.",
        "Do one thing every day that scares you.",
        "Courage is not the absence of fear, but the triumph over it."
    ],
    angry: [
        "For every minute you remain angry, you give up sixty seconds of peace of mind.",
        "Holding onto anger is like drinking poison and expecting the other person to die.",
        "Speak when you are angry and you will make the best speech you will ever regret."
    ]
};

function selectEmotion(emotion) {
    const quoteBox = document.getElementById('quote-box');
    const randomQuote = quotes[emotion][Math.floor(Math.random() * quotes[emotion].length)];
    quoteBox.innerText = `"${randomQuote}"`;
}


function formatDate(dateStr) {
    let dateObj = new Date(dateStr);
    return dateObj.toISOString().split("T")[0]; // "YYYY-MM-DD"
}



document.addEventListener("DOMContentLoaded", function () {
    let calendarEl = document.getElementById("calendar");
    let calendar;

    // Function to get stored moods from localStorage
    function getStoredMoods() {
        return JSON.parse(localStorage.getItem("events")) || [];
    }

    // Function to format date to YYYY-MM-DD
    function formatDate(dateStr) {
        let dateObj = new Date(dateStr);
        return dateObj.toISOString().split("T")[0];
    }

    

    function loadCalendar() {
        let storedMoods = getStoredMoods();
        let moodEmojis = {
            happy: "😁 Happy",
            sad: "😔 Sad",
            neutral: "😐 Neutral",
            nervous: "😥 Nervous",
            angry: "😤 Angry"
        };
    
        let events = storedMoods.map(event => ({
            title: moodEmojis[event.mood] || event.mood,
            start: event.date // Directly use stored "YYYY-MM-DD"
        }));
    
        calendarEl.innerHTML = ""; // Clear previous instance
    
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            timeZone: "local",
            events: events,
            height: "auto"
        });
    
        calendar.render();
    }
    
    // Open calendar popup and load events
    document.getElementById("calendar-btn").addEventListener("click", function () {
        let calendarPopup = document.getElementById("calendar-popup");
        calendarPopup.style.display = "flex"; // Show the popup

        // Load the calendar after the popup is displayed
        setTimeout(loadCalendar, 0);
    });

    // Close calendar popup
    document.getElementById("close-calendar").addEventListener("click", function () {
        document.getElementById("calendar-popup").style.display = "none"; // Hide the popup
    });
});