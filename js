/* ========================================
   TruthLens - Lesson Page JavaScript
   ======================================== */

// Lesson Management
const lessons = [
    { id: 1, title: "What are Deepfakes?", module: "Module 1: Introduction", duration: "15 minutes" },
    { id: 2, title: "History of Deepfakes", module: "Module 1: Introduction", duration: "18 minutes" },
    { id: 3, title: "Technology Behind It", module: "Module 1: Introduction", duration: "20 minutes" },
    { id: 4, title: "Visual Artifacts", module: "Module 2: Detection Basics", duration: "22 minutes" },
    { id: 5, title: "Audio Inconsistencies", module: "Module 2: Detection Basics", duration: "19 minutes" },
    { id: 6, title: "Behavioral Clues", module: "Module 2: Detection Basics", duration: "21 minutes" },
    { id: 7, title: "Forensic Analysis", module: "Module 3: Advanced Techniques", duration: "25 minutes" },
    { id: 8, title: "Detection Tools", module: "Module 3: Advanced Techniques", duration: "24 minutes" },
    { id: 9, title: "Case Studies", module: "Module 3: Advanced Techniques", duration: "30 minutes" }
];

let currentLesson = 1;
let completedLessons = [1]; // Start with first lesson completed
let scrollProgress = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    updateLessonDisplay();
    updateProgress();
});

// Initialize page
function initializePage() {
    // Load from localStorage if available
    const saved = localStorage.getItem('truthlens_lesson_data');
    if (saved) {
        const data = JSON.parse(saved);
        currentLesson = data.currentLesson || 1;
        completedLessons = data.completedLessons || [1];
    }
    
    updateSidebarState();
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar lesson items
    const lessonItems = document.querySelectorAll('.lesson-item');
    lessonItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const lessonNum = parseInt(this.getAttribute('data-lesson'));
            navigateToLesson(lessonNum);
            closeSidebar();
        });
    });

    // Scroll event for progress bar
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.addEventListener('scroll', function() {
            updateScrollProgress(this);
        });
    }

    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const toggle = document.getElementById('sidebarToggle');
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !toggle.contains(e.target)) {
            closeSidebar();
        }
    });

    // Window resize event
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            document.getElementById('sidebar').classList.remove('active');
            document.getElementById('sidebarToggle').classList.remove('active');
        }
    });
}

// Navigate to lesson
function navigateToLesson(lessonNum) {
    if (lessonNum < 1 || lessonNum > lessons.length) {
        return;
    }

    // Hide all sections
    const sections = document.querySelectorAll('.lesson-section');
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    const selectedSection = document.getElementById(`lesson-${lessonNum}`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Update current lesson
    currentLesson = lessonNum;
    updateLessonDisplay();
    updateSidebarState();
    updateProgress();

    // Scroll to top of main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.scrollTop = 0;
    }

    // Save to localStorage
    saveProgress();
}

// Update lesson display
function updateLessonDisplay() {
    const lesson = lessons[currentLesson - 1];
    
    // Update title
    document.getElementById('lessonTitle').textContent = lesson.title;
    document.getElementById('lessonBreadcrumb').textContent = lesson.title;
    
    // Update meta info
    const lessonTime = document.querySelector('.lesson-time');
    if (lessonTime) {
        lessonTime.textContent = `📚 ${lesson.duration}`;
    }

    // Update button states
    updateButtonStates();
}

// Update button states
function updateButtonStates() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Previous button
    if (currentLesson <= 1) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }

    // Next button
    if (currentLesson >= lessons.length) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }

    // Complete button
    const completeBtn = document.getElementById('completeBtn');
    if (completedLessons.includes(currentLesson)) {
        completeBtn.textContent = '✓ Completed';
        completeBtn.disabled = true;
    } else {
        completeBtn.textContent = '✓ Mark as Completed';
        completeBtn.disabled = false;
    }
}

// Previous lesson
function previousLesson() {
    if (currentLesson > 1) {
        navigateToLesson(currentLesson - 1);
    }
}

// Next lesson
function nextLesson() {
    if (currentLesson < lessons.length) {
        navigateToLesson(currentLesson + 1);
    }
}

// Mark lesson as completed
function markAsCompleted() {
    if (!completedLessons.includes(currentLesson)) {
        completedLessons.push(currentLesson);
        completedLessons.sort((a, b) => a - b);
    }

    updateSidebarState();
    updateButtonStates();
    updateProgress();
    saveProgress();

    // Show completion feedback
    showNotification('Lesson marked as completed!', 'success');
}

// Update sidebar state
function updateSidebarState() {
    const lessonItems = document.querySelectorAll('.lesson-item');
    
    lessonItems.forEach(item => {
        const lessonNum = parseInt(item.getAttribute('data-lesson'));
        const status = item.querySelector('.lesson-status');
        
        // Update active state
        if (lessonNum === currentLesson) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }

        // Update completion status
        if (completedLessons.includes(lessonNum)) {
            status.textContent = '✓';
            status.classList.add('completed');
        } else {
            status.textContent = '○';
            status.classList.remove('completed');
        }
    });

    // Update progress summary
    const progressFill = document.querySelector('.mini-progress-fill');
    const progressPercentage = (completedLessons.length / lessons.length) * 100;
    if (progressFill) {
        progressFill.style.width = progressPercentage + '%';
    }

    // Update progress text
    const progressText = document.querySelector('.progress-summary p');
    if (progressText) {
        progressText.innerHTML = `Progress: <strong>${completedLessons.length}/${lessons.length}</strong> lessons`;
    }
}

// Update scroll progress
function updateScrollProgress(element) {
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const scroll = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    scrollProgress = scroll;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = scroll + '%';
    }
}

// Update overall progress
function updateProgress() {
    const progressPercentage = (completedLessons.length / lessons.length) * 100;
    const progressBar = document.getElementById('progressBar');
    
    if (progressBar) {
        progressBar.style.width = progressPercentage + '%';
    }
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    
    sidebar.classList.toggle('active');
    toggle.classList.toggle('active');
}

// Close sidebar
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    
    sidebar.classList.remove('active');
    toggle.classList.remove('active');
}

// Save progress to localStorage
function saveProgress() {
    const data = {
        currentLesson: currentLesson,
        completedLessons: completedLessons,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('truthlens_lesson_data', JSON.stringify(data));
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#00d981' : '#0066ff'};
        color: white;
        border-radius: 8px;
        font-weight: 600;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        previousLesson();
    } else if (e.key === 'ArrowRight') {
        nextLesson();
    }
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Quiz functionality
document.addEventListener('DOMContentLoaded', function() {
    const quizOptions = document.querySelectorAll('.quiz-option input');
    quizOptions.forEach(option => {
        option.addEventListener('change', function() {
            const question = this.closest('.quiz-question');
            const selectedOption = question.querySelector('label');
            
            // Highlight selected option
            question.querySelectorAll('.quiz-option').forEach(opt => {
                opt.style.borderColor = 'transparent';
            });
            
            this.closest('.quiz-option').style.borderColor = '#0066ff';
        });
    });
});

// Export progress data
function exportProgress() {
    const data = {
        currentLesson: currentLesson,
        completedLessons: completedLessons,
        totalLessons: lessons.length,
        completionPercentage: (completedLessons.length / lessons.length) * 100,
        lessons: lessons.map(l => ({
            id: l.id,
            title: l.title,
            completed: completedLessons.includes(l.id)
        }))
    };

    return JSON.stringify(data, null, 2);
}

// Reset progress
function resetProgress() {
    if (confirm('Are you sure you want to reset your progress? This action cannot be undone.')) {
        completedLessons = [1];
        currentLesson = 1;
        saveProgress();
        navigateToLesson(1);
        showNotification('Progress has been reset', 'success');
    }
}

// Console helper functions (for development)
console.log('%cTruthLens Lesson Page', 'color: #0066ff; font-size: 16px; font-weight: bold;');
console.log('Available functions:');
console.log('- navigateToLesson(lessonNum): Navigate to a specific lesson');
console.log('- markAsCompleted(): Mark current lesson as completed');
console.log('- exportProgress(): Export current progress as JSON');
console.log('- resetProgress(): Reset all progress');
console.log('Current progress:', { currentLesson, completedLessons, total: lessons.length });
