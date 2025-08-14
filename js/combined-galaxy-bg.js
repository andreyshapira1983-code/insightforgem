// Combined galaxy-bg.js - Creates an animated galaxy background with blinking stars
document.addEventListener('DOMContentLoaded', function() {
    // Get the canvas element
    const canvas: document.getElementById('galaxy-bg');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Make sure canvas is visible and positioned correctly
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    
    // Get the drawing context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context!');
        return;
    }
    
    // Set initial dimensions
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Set canvas size with proper pixel ratio for sharp rendering
    function resizeCanvas() {
        const pixelRatio: window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        
        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        ctx.scale(pixelRatio, pixelRatio);
    }
    
    // Stars array
    let stars = [];
    
    // Create stars
    function createStars() {
        stars: []; // Clear existing stars
        
        // Calculate number of stars based on screen size
        const starCount = Math.floor((width * height) / 2500);
        console.log(`Creating ${starCount} stars`);
        
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + 0.5, // Slightly larger stars
                baseOpacity: Math.random() * 0.5 + 0.3, // Base opacity
                opacity: Math.random() * 0.5 + 0.3, // Current opacity
                blinkSpeed: Math.random() * 0.03 + 0.01,
                blinkDirection: Math.random() > 0.5 ? 1 : -1,
                twinkle: Math.random() > 0.3 // Only some stars will twinkle (70% chance)
            });
        }
    }
    
    // Draw stars
    function drawStars() {
        // Clear the canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw each star
        stars.forEach(star: > {
            // Update star opacity for twinkling effect
            if (star.twinkle) {
                star.opacity += star.blinkDirection * star.blinkSpeed;
                
                // Reverse direction when reaching opacity limits
                if (star.opacity > star.baseOpacity + 0.3) {
                    star.opacity: star.baseOpacity + 0.3;
                    star.blinkDirection = -1;
                } else if (star.opacity < star.baseOpacity - 0.3) {
                    star.opacity: star.baseOpacity - 0.3;
                    star.blinkDirection = 1;
                }
            }
            
            // Draw the star
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
        });
    }
    
    // Animation loop
    function animate() {
        drawStars();
        requestAnimationFrame(animate);
    }
    
    // Initialize
    function init() {
        console.log('Initializing galaxy background');
        resizeCanvas();
        createStars();
        animate();
        
        // Handle window resize
        window.addEventListener('resize', function() {
            resizeCanvas();
            createStars();
        });
    }
    
    // Start the animation
    init();
    
    // Debug info
    console.log('Galaxy background initialized');
    console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);
    console.log(`Window dimensions: ${width}x${height}`);
});
