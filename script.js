let currentQuestion = 0;
let score = 0;
let quizData = [];
let unattemptedQuestions = 0;
let isLoggedIn = false;
let currentUser = null;
let timer = null;
let timeLeft = 0;
let activeLanguage = null;
let userBadges = [];

// Load Home Page
function loadHome() {
    clearInterval(timer);
    activeLanguage = null;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('.nav-item:first-child').classList.add('active');
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="home-content">
            <div class="hero-section">
                <h1>Master Your Coding Skills</h1>
                <p>Challenge yourself with interactive quizzes in Java, C, and Python</p>
                <div class="action-buttons">
                    <button class="primary-btn" onclick="loadQuiz('java')">Start Java Quiz</button>
                    <button class="secondary-btn" onclick="loadQuiz('c')">Try C</button>
                    <button class="secondary-btn" onclick="loadQuiz('python')">Try Python</button>
                </div>
            </div>
            <div class="features">
                <div class="feature-card">
                    <i class="fas fa-puzzle-piece"></i>
                    <h3>Interactive Quizzes</h3>
                    <p>Test your knowledge with our carefully crafted questions</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-chart-pie"></i>
                    <h3>Track Progress</h3>
                    <p>Visualize your performance with detailed analytics</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-trophy"></i>
                    <h3>Earn Badges</h3>
                    <p>Get rewarded for your achievements and progress</p>
                </div>
            </div>
            ${isLoggedIn ? renderUserBadges() : ''}
        </div>
    `;
}

// Render User Badges
function renderUserBadges() {
    if (!userBadges || userBadges.length === 0) {
        return '';
    }
    
    return `
        <div class="badges-section">
            <h2>Your Badges</h2>
            <div class="badges-container">
                ${userBadges.map(badge => `
                    <div class="badge-item" title="${badge.description}">
                        <div class="badge-icon ${badge.type}">
                            <i class="${badge.icon}"></i>
                        </div>
                        <span>${badge.name}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Award Badges Based on Performance
function awardBadges(language, percentage) {
    const newBadges = [];
    
    // Performance badges
    if (percentage >= 90) {
        newBadges.push({
            name: `${capitalizeFirstLetter(language)} Master`,
            type: 'gold',
            icon: 'fas fa-crown',
            description: `Achieved an outstanding score of ${percentage}% in the ${language.toUpperCase()} quiz`
        });
    } else if (percentage >= 70) {
        newBadges.push({
            name: `${capitalizeFirstLetter(language)} Pro`,
            type: 'silver',
            icon: 'fas fa-award',
            description: `Achieved a great score of ${percentage}% in the ${language.toUpperCase()} quiz`
        });
    } else if (percentage >= 50) {
        newBadges.push({
            name: `${capitalizeFirstLetter(language)} Apprentice`,
            type: 'bronze',
            icon: 'fas fa-medal',
            description: `Achieved a solid score of ${percentage}% in the ${language.toUpperCase()} quiz`
        });
    }
    
    // First attempt badge
    const hasTakenBefore = userBadges.some(badge => 
        badge.name.toLowerCase().includes(language.toLowerCase())
    );
    
    if (!hasTakenBefore) {
        newBadges.push({
            name: `${capitalizeFirstLetter(language)} Explorer`,
            type: 'blue',
            icon: 'fas fa-compass',
            description: `Completed your first ${language.toUpperCase()} quiz`
        });
    }
    
    // Perfect score badge
    if (percentage === 100) {
        newBadges.push({
            name: `Perfect ${capitalizeFirstLetter(language)}`,
            type: 'rainbow',
            icon: 'fas fa-star',
            description: `Achieved a perfect 100% score in the ${language.toUpperCase()} quiz`
        });
    }
    
    // Add new badges to user's collection
    newBadges.forEach(badge => {
        // Check if badge already exists
        const badgeExists = userBadges.some(existingBadge => 
            existingBadge.name === badge.name
        );
        
        if (!badgeExists) {
            userBadges.push(badge);
        }
    });
    
    return newBadges;
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Show Registration/Login Popup
function showLoginPopup(language) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <h2>Join CodeQuiz</h2>
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" placeholder="Choose a username" required>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="Your email address" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Create a password" required>
            </div>
            <div class="buttons">
                <button type="button" onclick="closePopup()">Cancel</button>
                <button type="submit">Get Started</button>
            </div>
        </form>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    // Store the language to load after login
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        
        // Simple registration/login process
        isLoggedIn = true;
        currentUser = { username, email };
        
        // Update login button in navbar
        document.querySelector('.login-btn span').textContent = username;
        
        // Close popup and load the quiz
        closePopup();
        initializeQuiz(language);
        
        // Show welcome toast
        showToast(`Welcome, ${username}! Your quiz is ready.`, 'success');
    });
}

// Show Toast Notification
function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        document.body.removeChild(existingToast);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="${type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentNode.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    }, 5000);
}

// Close Popup
function closePopup() {
    const overlay = document.querySelector('.overlay');
    const popup = document.querySelector('.popup');
    
    if (overlay) document.body.removeChild(overlay);
    if (popup) document.body.removeChild(popup);
}

// Check if user is logged in before starting quiz
function loadQuiz(language) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[onclick="loadQuiz('${language}')"]`).classList.add('active');
    
    activeLanguage = language;
    
    if (!isLoggedIn) {
        showLoginPopup(language);
    } else {
        initializeQuiz(language);
    }
}

// Initialize Quiz Data
function initializeQuiz(language) {
    clearInterval(timer);
    
    if (language === 'java') {
        quizData = [
            {
                question: "What is the size of a char in Java?",
                options: ["1 byte", "2 bytes", "4 bytes"],
                answer: "2 bytes",
                attempted: false
            },
            {
                question: "Which of the following is not a Java keyword?",
                options: ["class", "struct", "interface"],
                answer: "struct",
                attempted: false
            },
            {
                question: "What is the default value of a boolean in Java?",
                options: ["true", "false", "null"],
                answer: "false",
                attempted: false
            },
            {
                question: "Which method is used to start a thread in Java?",
                options: ["start()", "run()", "execute()"],
                answer: "start()",
                attempted: false
            },
            {
                question: "What is the superclass of all classes in Java?",
                options: ["Object", "Super", "Parent"],
                answer: "Object",
                attempted: false
            },
            {
                question: "Which keyword is used to define a constant in Java?",
                options: ["const", "final", "static"],
                answer: "final",
                attempted: false
            },
            {
                question: "What is the output of `System.out.println(5 + '5')` in Java?",
                options: ["55", "10", "Error"],
                answer: "55",
                attempted: false
            },
            {
                question: "Which collection class allows duplicate elements?",
                options: ["Set", "List", "Map"],
                answer: "List",
                attempted: false
            },
            {
                question: "What is the default value of an int in Java?",
                options: ["0", "1", "null"],
                answer: "0",
                attempted: false
            },
            {
                question: "Which of the following is a marker interface in Java?",
                options: ["Runnable", "Serializable", "Comparator"],
                answer: "Serializable",
                attempted: false
            }
        ];
    } else if (language === 'c') {
        quizData = [
            {
                question: "What is the output of sizeof(int) in C?",
                options: ["2 bytes", "4 bytes", "8 bytes"],
                answer: "4 bytes",
                attempted: false
            },
            {
                question: "Which of the following is used to allocate memory in C?",
                options: ["malloc", "new", "allocate"],
                answer: "malloc",
                attempted: false
            },
            {
                question: "What is the correct syntax for a function in C?",
                options: ["function myFunc() {}", "void myFunc() {}", "def myFunc() {}"],
                answer: "void myFunc() {}",
                attempted: false
            },
            {
                question: "What is the output of `printf('%d', 5 / 2)` in C?",
                options: ["2", "2.5", "Error"],
                answer: "2",
                attempted: false
            },
            {
                question: "Which header file is used for input/output in C?",
                options: ["<stdio.h>", "<iostream>", "<input.h>"],
                answer: "<stdio.h>",
                attempted: false
            },
            {
                question: "What is the correct way to access a structure member?",
                options: ["structure->member", "structure.member", "structure::member"],
                answer: "structure.member",
                attempted: false
            },
            {
                question: "What does the 'const' keyword do in C?",
                options: ["Defines a constant variable", "Creates a constructor", "Allocates constant memory"],
                answer: "Defines a constant variable",
                attempted: false
            },
            {
                question: "Which operator is used for pointer dereferencing?",
                options: ["&", "*", "->"],
                answer: "*",
                attempted: false
            },
            {
                question: "What is the purpose of 'void' in a function declaration?",
                options: ["No parameters required", "No return value", "Both A and B can be correct"],
                answer: "Both A and B can be correct",
                attempted: false
            },
            {
                question: "Which function is used to read a character in C?",
                options: ["getc()", "scan()", "readchar()"],
                answer: "getc()",
                attempted: false
            }
        ];
    } else if (language === 'python') {
        quizData = [
            {
                question: "What is the correct way to create a function in Python?",
                options: ["function myFunc():", "def myFunc():", "create myFunc():"],
                answer: "def myFunc():",
                attempted: false
            },
            {
                question: "Which of these is NOT a Python data type?",
                options: ["list", "tuple", "array"],
                answer: "array",
                attempted: false
            },
            {
                question: "How do you create a dictionary in Python?",
                options: ["{key:value}", "[key:value]", "dict(key=value)"],
                answer: "{key:value}",
                attempted: false
            },
            {
                question: "What does pip stand for in Python?",
                options: ["Preferred Installer Program", "Python Installation Package", "Package Installation Python"],
                answer: "Preferred Installer Program",
                attempted: false
            },
            {
                question: "How is a code block indicated in Python?",
                options: ["Brackets", "Indentation", "Parentheses"],
                answer: "Indentation",
                attempted: false
            },
            {
                question: "Which of the following is a mutable data type in Python?",
                options: ["String", "Tuple", "List"],
                answer: "List",
                attempted: false
            },
            {
                question: "What is the output of `print(3 * '7')` in Python?",
                options: ["21", "777", "Error"],
                answer: "777",
                attempted: false
            },
            {
                question: "Which module is used for working with regular expressions in Python?",
                options: ["regex", "re", "pyregex"],
                answer: "re",
                attempted: false
            },
            {
                question: "Which of the following is NOT a valid method for a list in Python?",
                options: ["append()", "insert()", "sort()"],
                answer: "insert()",
                attempted: false
            },
            {
                question: "What is the correct Python syntax to import the Math module?",
                options: ["import math", "include math", "using math"],
                answer: "import math",
                attempted: false
            }
        ];
    }
    
    // Reset variables
    currentQuestion = 0;
    score = 0;
    unattemptedQuestions = quizData.length;
    timeLeft = 60 * 10; // 10 minutes in seconds
    
    // Update quiz UI
    renderQuiz();
    startTimer();
}

// Start Quiz Timer
function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            showResults();
        } else {
            updateTimerDisplay();
        }
    }, 1000);
    
    updateTimerDisplay();
}

// Update Timer Display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    const timerElement = document.querySelector('.timer span');
    if (timerElement) {
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}

// Render Quiz Question
function renderQuiz() {
    const content = document.getElementById('content');
    const question = quizData[currentQuestion];
    const progressPercentage = (currentQuestion / quizData.length) * 100;
    
    content.innerHTML = `
        <div class="quiz-container">
            <div class="progress-bar">
                <div class="progress" style="width: ${progressPercentage}%"></div>
            </div>
            
            <div class="question-header">
                <span class="question-counter">Question ${currentQuestion + 1} of ${quizData.length}</span>
                <div class="timer"><i class="fas fa-clock"></i> <span>10:00</span></div>
            </div>
            
            <div class="quiz-question">
                <p>${question.question}</p>
                <div id="options" class="options">
                    ${question.options.map((option, index) => `
                        <div class="option">
                            <input type="radio" id="option${index}" name="answer" value="${option}">
                            <label for="option${index}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="button-container">
                <button class="button skip-button" onclick="skipQuestion()">
                    <i class="fas fa-forward"></i> Skip
                </button>
                <button class="button next-button" onclick="checkAnswer()">
                    <i class="fas fa-arrow-right"></i> ${currentQuestion === quizData.length - 1 ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    `;
    
    updateTimerDisplay();
}

// Skip Question
function skipQuestion() {
    quizData[currentQuestion].attempted = true;
    
    currentQuestion++;
    if (currentQuestion >= quizData.length) {
        showResults();
    } else {
        renderQuiz();
    }
}

// Check Answer
function checkAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    
    if (selectedOption) {
        const answer = selectedOption.value;
        
        if (answer === quizData[currentQuestion].answer) {
            score++;
        }
        
        quizData[currentQuestion].attempted = true;
        unattemptedQuestions--;
        
        currentQuestion++;
        if (currentQuestion >= quizData.length) {
            showResults();
        } else {
            renderQuiz();
        }
    } else {
        showToast("Please select an answer!", "info");
    }
}

// Show Quiz Results
function showResults() {
    clearInterval(timer);
    
    const content = document.getElementById('content');
    const percentage = Math.round((score / quizData.length) * 100);
    const attempted = quizData.length - unattemptedQuestions;
    
    // Award badges
    const newBadges = awardBadges(activeLanguage, percentage);
    
    content.innerHTML = `
        <div class="result-container">
            <div class="result-header">
                <h2>Quiz Completed!</h2>
                <p>Here's how you performed in the ${activeLanguage.toUpperCase()} quiz</p>
            </div>
            
            <div class="user-info">
                <h3>${currentUser.username}</h3>
                <p>${currentUser.email}</p>
            </div>
            
            <div class="score-summary">
                <div class="score-card">
                    <h3>${attempted}</h3>
                    <p>Questions Attempted</p>
                </div>
                <div class="score-card">
                    <h3>${score}</h3>
                    <p>Correct Answers</p>
                </div>
                <div class="score-card total">
                    <h3>${percentage}%</h3>
                    <p>Overall Score</p>
                </div>
            </div>
            
            <div class="chart-container">
                <canvas id="resultsChart"></canvas>
            </div>
            
            ${newBadges.length > 0 ? `
                <div class="new-badges-container">
                    <h3>Badges Earned</h3>
                    <div class="badges-row">
                        ${newBadges.map(badge => `
                            <div class="badge-item" title="${badge.description}">
                                <div class="badge-icon ${badge.type}">
                                    <i class="${badge.icon}"></i>
                                </div>
                                <span>${badge.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <button class="action-button" onclick="loadHome()">
                <i class="fas fa-home"></i> Back to Home
            </button>
            <button class="action-button" onclick="loadQuiz('${activeLanguage}')">
                <i class="fas fa-redo"></i> Try Again
            </button>
        </div>
    `;
    
    // Create results chart
    createResultsChart();
}

// Create Results Chart
function createResultsChart() {
    const ctx = document.getElementById('resultsChart').getContext('2d');
    
    const correct = score;
    const incorrect = quizData.length - unattemptedQuestions - score;
    const skipped = unattemptedQuestions;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Correct', 'Incorrect', 'Skipped'],
            datasets: [{
                data: [correct, incorrect, skipped],
                backgroundColor: [
                    '#4CAF50',  // Bright green for correct
                    '#F44336',  // Bright red for incorrect
                    '#9E9E9E'   // Grey for skipped
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '65%'
        }
    });
}

// Add styles for toast notifications and badges
const customStyles = document.createElement('style');
customStyles.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: var(--border-radius);
        background-color: var(--white);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 1000;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease forwards;
    }
    
    .toast.success {
        border-left: 4px solid var(--success);
    }
    
    .toast.error {
        border-left: 4px solid var(--error);
    }
    
    .toast.info {
        border-left: 4px solid var(--primary);
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }
    
    .toast-content i {
        font-size: 1.5rem;
    }
    
    .toast-content i.fa-check-circle {
        color: var(--success);
    }
    
    .toast-content i.fa-info-circle {
        color: var(--primary);
    }
    
    .toast button {
        background: none;
        border: none;
        color: var(--gray);
        cursor: pointer;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.3rem;
    }
    
    .toast button:hover {
        color: var(--dark);
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .option {
        position: relative;
        margin-bottom: 0.8rem;
    }
    
    .option input[type="radio"] {
        position: absolute;
        opacity: 0;
    }
    
    .option label {
        display: block;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: var(--border-radius);
        cursor: pointer;
        transition: var(--transition);
    }
    
    .option label:hover {
        background-color: rgba(79, 70, 229, 0.05);
        border-color: var(--primary);
    }
    
    .option input[type="radio"]:checked + label {
        background-color: rgba(79, 70, 229, 0.1);
        border-color: var(--primary);
        font-weight: 500;
    }
    
    /* Badge styles */
    .badges-section {
        margin-top: 2rem;
        padding: 2rem;
        background-color: var(--white);
        border-radius: var(--border-radius);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .badges-section h2 {
        margin-bottom: 1.5rem;
        text-align: center;
    }
    
    .badges-container, .badges-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        justify-content: center;
    }
    
    .badge-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100px;
        cursor: pointer;
        transition: transform 0.2s;
    }
    
    .badge-item:hover {
        transform: translateY(-5px);
    }
    
    .badge-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.5rem;
        font-size: 1.8rem;
        color: white;
    }
    
    .badge-icon.gold {
        background: linear-gradient(45deg, #FFD700, #FFA500);
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    }
    
    .badge-icon.silver {
        background: linear-gradient(45deg, #C0C0C0, #A9A9A9);
        box-shadow: 0 0 10px rgba(192, 192, 192, 0.5);
    }
    
    .badge-icon.bronze {
        background: linear-gradient(45deg, #CD7F32, #8B4513);
        box-shadow: 0 0 10px rgba(205, 127, 50, 0.5);
    }
    
    .badge-icon.blue {
        background: linear-gradient(45deg, #1E90FF, #0000CD);
        box-shadow: 0 0 10px rgba(30, 144, 255, 0.5);
    }
    
    .badge-icon.rainbow {
        background: linear-gradient(45deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #8B00FF);
        box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
    }
    
    .badge-item span {
        font-size: 0.9rem;
        font-weight: 500;
        text-align: center;
    }
    
    .new-badges-container {
        margin: 2rem 0;
        padding: 1.5rem;
        background-color: #FFF9E5;
        border-radius: var(--border-radius);
        border-left: 4px solid #FFD700;
    }
    
    .new-badges-container h3 {
        margin-bottom: 1rem;
        color: #B8860B;
    }
    
    @keyframes badgePulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    .new-badges-container .badge-item {
        animation: badgePulse 1.5s infinite;
    }
`;
document.head.appendChild(customStyles);

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadHome();
});