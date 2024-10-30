const scroller = scrollama();

function handleStepEnter(response) {
    const step = response.element.getAttribute("data-step");

    switch (step) {
        case "1":
            drawIntro();
            break;
        case "2":
            drawSafety();
            break;
        case "3":
            drawHealth();
            break;
        case "4":
            drawEconomy();
            break;
        case "5":
            drawQualityOfLife();
            break;
        case "6":
            drawEducation();
            break;
        case "7":
            drawOutro();
            break;
    }
}

scroller.setup({
    step: ".step",
    offset: 0.5,
}).onStepEnter(handleStepEnter);

window.addEventListener("resize", scroller.resize);

const fixedImage = document.getElementById('fixed-image');

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;

    // Change image size and position based on scroll position
    if (scrollPosition < 800) { // Intro section
        fixedImage.style.top = '50%'; // Center vertically for intro
        fixedImage.style.left = '50%'; // Center horizontally
        fixedImage.style.transform = 'translate(-50%, -50%)'; // Adjust for centering
    } else if (scrollPosition < 1600) { // Safety section
        fixedImage.style.top = '70%'; // Move towards the bottom
        fixedImage.style.left = '20%'; // Move to the bottom left corner
        fixedImage.style.transform = 'translate(-50%, -50%)';
    } else if (scrollPosition < 2400) { // Health section
        fixedImage.style.bottom = '70%'; // Keep at the bottom
        fixedImage.style.left = '80%'; // Move to the bottom right corner
        fixedImage.style.transform = 'translate(-50%, -50%)';
    } else if (scrollPosition < 3200) { // Economy section
        fixedImage.style.top = '70%'; // Keep slightly above the bottom
        fixedImage.style.left = '50%'; // Center horizontally
        fixedImage.style.transform = 'translate(-50%, -50%)';
    } else if (scrollPosition < 4000) { // Quality of Life section
        fixedImage.style.bottom = '70%';
        fixedImage.style.left = '20%';
        fixedImage.style.transform = 'translate(-50%, -50%)';
    } else if (scrollPosition < 4800) { // Education section
        fixedImage.style.top = '70%';
        fixedImage.style.left = '80%';
        fixedImage.style.transform = 'translate(-50%, -50%)';
    } else { // Outro section
        fixedImage.style.top = '60%';
        fixedImage.style.left = '50%';
        fixedImage.style.transform = 'translate(-50%, -50%)';
    }
});
