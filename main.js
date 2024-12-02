

let totalScrollHeight = calculateTotalScrollHeight(); // Calculate total scroll height
// Recalculate total scroll height on window resize
window.addEventListener("resize", () => {
    totalScrollHeight = calculateTotalScrollHeight();
});

// Array to keep track of step elements
const steps = document.querySelectorAll('.step');

// Initialize sections
try {
    drawIntro();
} catch (error) {
    console.error("Error in drawIntro:", error);
}

try {
    // drawSafety();
} catch (error) {
    console.error("Error in drawSafety:", error);
}

try {
    drawHealth();
} catch (error) {
    console.error("Error in drawHealth:", error);
}

try {
    // drawEconomy();
} catch (error) {
    console.error("Error in drawEconomy:", error);
}

try {
    // drawQualityOfLife();
} catch (error) {
    console.error("Error in drawQualityOfLife:", error);
}

try {
    drawEducation();
} catch (error) {
    console.error("Error in drawEducation:", error);
}

try {
    drawOutro();
} catch (error) {
    console.error("Error in drawOutro:", error);
}

// Handle when a step enters the viewport
function handleStepEnter(response) {
    const step = response.element;
    const steps = document.querySelectorAll('.step');

    // Fade out all steps
    steps.forEach(s => {
        s.classList.add('faded'); // Add the faded class to hide everything
    });

    // Fade in the current step
    step.classList.remove('faded'); // Remove the faded class for the current step

    // Update header position if there's a specific header inside the step
    const currentHeader = step.querySelector("h2");
    if (currentHeader) {
        updateHeaderPosition(currentHeader);
    }
}

function handleStepExit(response) {
    // Optional: Add logic for when a step exits if needed
}

// Utility function to calculate total scroll height
function calculateTotalScrollHeight() {
    const steps = document.querySelectorAll('.step');
    let totalHeight = 0;

    steps.forEach(step => {
        totalHeight += step.offsetHeight;
    });

    return totalHeight;
}

function updateHeaderPosition(header) {
    const rect = header.getBoundingClientRect();
    const headerHeight = rect.height;

    header.style.position = 'fixed';
    header.style.top = '8%';
    header.style.left = '50%';
    header.style.transform = 'translateX(-50%)';
}



let currentStepIndex = -1; // Tracks the currently visible step index

// initially faded
steps.forEach((step, index) => {
    if (index != 0){
        step.classList.add('faded');
    }
});



window.addEventListener('scroll', () => {
    steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();

        // Check if the step is sufficiently inside the viewport
        const isVisible = rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.25;

        if (isVisible && currentStepIndex !== index) {
            currentStepIndex = index;


            // Fade out all other steps
            steps.forEach((s, i) => {
                if (i !== index) {
                    s.classList.add('faded');
                } else {
                    s.classList.remove('faded');
                    if (index === 6) {
                        console.log("going to animate");
                        outro_animatePoints();
                    }
                }
            });
        }
    });
});
