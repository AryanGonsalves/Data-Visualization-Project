const scroller = scrollama();
let totalScrollHeight = calculateTotalScrollHeight(); // Calculate total scroll height
// Recalculate total scroll height on window resize
window.addEventListener("resize", () => {
    totalScrollHeight = calculateTotalScrollHeight();
});

scroller.setup({
    step: ".step",
    offset: 0.5,
}).onStepEnter(handleStepEnter);

drawIntro();
drawSafety();
drawHealth();
drawEconomy();
drawQualityOfLife();
drawEducation();
drawOutro();

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

// Function to calculate total scroll height
function calculateTotalScrollHeight() {
    const steps = document.querySelectorAll('.step');
    let totalHeight = 0;

    steps.forEach(step => {
        totalHeight += step.offsetHeight;
    });

    return totalHeight;
}



