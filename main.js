const scroller = scrollama();
const fixedImage = document.getElementById('fixed-image');
const overlayImage = document.getElementById('overlay-image');

let totalScrollHeight = calculateTotalScrollHeight(); // Calculate total scroll height

function setInitialImagePosition() {
    fixedImage.style.top = '50%';
    fixedImage.style.left = '50%';
    fixedImage.style.transform = 'translate(-50%, -50%)';
}

// Handle when a step enters the viewport
function handleStepEnter(response) {
    const step = response.element.getAttribute("data-step");
    const headers = document.querySelectorAll('.step h2');
    headers.forEach(header => {
        header.style.display = 'none';
    });
    const currentHeader = response.element.querySelector("h2");
    if (currentHeader) {
        currentHeader.style.display = 'block';
        updateHeaderPosition(currentHeader);
    }

    // Depending on the section scrolled at, will move the image accordingly
    switch (step) {
        case "1":
            drawIntro();
            setImagePosition('50%', '50%', 0.7); // Center for intro
            overlayImage.style.display = 'block'; // Show overlay image
            overlayImage.style.opacity = '1';
            break;
        case "2":
            drawSafety();
            setImagePosition('70%', '20%', 0.5); // Move for safety section
            overlayImage.style.opacity = '0'; // Fade out
            setTimeout(() => {
                overlayImage.style.display = 'none';
            }, 300);
            break;
        case "3":
            drawHealth();
            setImagePosition('70%', '80%'); // Move for health section
            break;
        case "4":
            drawEconomy();
            setImagePosition('70%', '50%'); // Move for economy section
            break;
        case "5":
            drawQualityOfLife();
            setImagePosition('70%', '20%'); // Move for quality of life section
            break;
        case "6":
            drawEducation();
            setImagePosition('70%', '80%'); // Move for education section
            break;
        case "7":
            drawOutro();
            setImagePosition('60%', '50%', 0.6); // Move for outro section
            break;
    }
}

function updateHeaderPosition(header) {
    // Calculate position based on viewport and step height
    const rect = header.getBoundingClientRect();
    const headerHeight = rect.height;

    // Set position to fixed at the top of the viewport, adjusting for the header height
    header.style.position = 'fixed';
    header.style.top = '8%'; // Slightly below the top
    header.style.left = '50%'; // Center horizontally
    header.style.transform = 'translateX(-50%)'; // Adjust for center alignment
}

function setImagePosition(top, left, size=null) {
    fixedImage.style.top = top;
    fixedImage.style.left = left;
    if (size != null) {
        const originalHeight = fixedImage.naturalHeight; 
        const originalWidth = fixedImage.naturalWidth;
        
        fixedImage.style.height = `${originalHeight * size}px`; 
        fixedImage.style.width = `${originalWidth * size}px`; 
    }
}


// Function to calculate total scroll height
function calculateTotalScrollHeight() {
    const steps = document.querySelectorAll('.step');
    let totalHeight = 0;

    steps.forEach(step => {
        totalHeight += step.offsetHeight;
    });

    return totalHeight;
}



scroller.setup({
    step: ".step",
    offset: 0.5,
}).onStepEnter(handleStepEnter);

// Recalculate total scroll height on window resize
window.addEventListener("resize", () => {
    totalScrollHeight = calculateTotalScrollHeight();
});

// Set initial position on load
setInitialImagePosition();
