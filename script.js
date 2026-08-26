const canvas = document.getElementById("motion-canvas");
const context = canvas.getContext("2d");

const frameCount = 224;
const images = [];
const currentFrameState = { frame: 0 };

// Pad frame numbers: 1 -> 001, 12 -> 012, etc.
const pad = (num, size) => {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
};

// Generate image source URL
const currentFrame = index => `images/ezgif-frame-${pad(index + 1, 3)}.jpg`;

// Linear interpolation function for smooth transitions
function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

// Draw image covering the canvas (object-fit: cover implementation)
function drawImageProp(ctx, img) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const imgWidth = img.width;
    const imgHeight = img.height;

    const r = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
    let newWidth = imgWidth * r;
    let newHeight = imgHeight * r;
    let ar = 1;

    if (newWidth < canvasWidth) ar = canvasWidth / newWidth;
    if (Math.abs(ar - 1) < 1e-14 && newHeight < canvasHeight) ar = canvasHeight / newHeight;
    
    newWidth *= ar;
    newHeight *= ar;

    const sourceWidth = imgWidth / (newWidth / canvasWidth);
    const sourceHeight = imgHeight / (newHeight / canvasHeight);

    const sourceX = (imgWidth - sourceWidth) * 0.5;
    const sourceY = (imgHeight - sourceHeight) * 0.5;

    ctx.drawImage(
        img,
        Math.max(0, sourceX),
        Math.max(0, sourceY),
        Math.min(imgWidth, sourceWidth),
        Math.min(imgHeight, sourceHeight),
        0,
        0,
        canvasWidth,
        canvasHeight
    );
}

// Preload Images
let loadedImagesCount = 0;
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const loaderText = document.getElementById("loader-text");

function preloadImages() {
    return new Promise((resolve) => {
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.onload = () => {
                loadedImagesCount++;
                const progress = Math.floor((loadedImagesCount / frameCount) * 100);
                loaderBar.style.width = `${progress}%`;
                loaderText.textContent = `LOADING EXPERIENCE ${progress}%`;
                
                if (loadedImagesCount === frameCount) {
                    // Hide loader with a fade
                    setTimeout(() => {
                        loader.classList.add("opacity-0");
                        setTimeout(() => {
                            loader.style.display = "none";
                        }, 700);
                    }, 500);
                    resolve();
                }
            };
            img.onerror = () => {
                // If one fails, still count it to avoid blocking loading
                loadedImagesCount++;
                if (loadedImagesCount === frameCount) {
                    resolve();
                }
            };
            img.src = currentFrame(i);
            images.push(img);
        }
    });
}

// Set canvas dimensions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (images[Math.round(currentFrameState.frame)]) {
        drawImageProp(context, images[Math.round(currentFrameState.frame)]);
    }
}

window.addEventListener("resize", resizeCanvas);

// Scroll calculations
const heroContainer = document.getElementById("hero-container");
const slide1 = document.getElementById("slide-1");
const slide2 = document.getElementById("slide-2");
const slide3 = document.getElementById("slide-3");

let targetFrame = 0;
let animatedFrame = 0;

function updateScrollVal() {
    const scrollTop = window.scrollY;
    const maxScroll = heroContainer.scrollHeight - window.innerHeight;
    
    // Normalize scroll progress specifically inside the hero section [0, 1]
    const progress = Math.max(0, Math.min(1, scrollTop / maxScroll));
    
    targetFrame = progress * (frameCount - 1);

    // Text slides animation timings (opacity & translate-y)
    updateSlideOpacity(slide1, progress, 0.0, 0.25);
    updateSlideOpacity(slide2, progress, 0.35, 0.60);
    updateSlideOpacity(slide3, progress, 0.70, 0.95);
}

function updateSlideOpacity(slide, progress, start, end) {
    // Fades in, stays solid, then fades out
    const peakStart = start + (end - start) * 0.25;
    const peakEnd = end - (end - start) * 0.25;

    let opacity = 0;
    let translate = 20; // px to translate

    if (progress >= start && progress <= end) {
        if (progress < peakStart) {
            // Fade in
            const p = (progress - start) / (peakStart - start);
            opacity = lerp(0, 1, p);
            translate = lerp(20, 0, p);
        } else if (progress > peakEnd) {
            // Fade out
            const p = (progress - peakEnd) / (end - peakEnd);
            opacity = lerp(1, 0, p);
            translate = lerp(0, -20, p);
        } else {
            // Fully visible
            opacity = 1;
            translate = 0;
        }
    } else if (progress > end) {
        opacity = 0;
        translate = -20;
    }

    slide.style.opacity = opacity;
    slide.style.transform = `translateY(${translate}px)`;
    slide.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
}

// Continuous render loop for buttery smooth animation
function render() {
    // Lerp frame index for smooth ease-out feel
    animatedFrame = lerp(animatedFrame, targetFrame, 0.1);
    
    // Check if frame value is close enough to target
    if (Math.abs(animatedFrame - targetFrame) < 0.01) {
        animatedFrame = targetFrame;
    }

    const frameIndex = Math.min(frameCount - 1, Math.max(0, Math.round(animatedFrame)));
    currentFrameState.frame = frameIndex;

    if (images[frameIndex]) {
        drawImageProp(context, images[frameIndex]);
    }

    requestAnimationFrame(render);
}

// Initialize
preloadImages().then(() => {
    resizeCanvas();
    window.addEventListener("scroll", updateScrollVal);
    // Draw initial frame
    if (images[0]) {
        drawImageProp(context, images[0]);
    }
    // Start smooth render loop
    requestAnimationFrame(render);
});
