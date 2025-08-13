// create-favicon.js - Creates a dynamic favicon
(function() {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Draw the favicon
    function drawFavicon() {
        // Clear canvas
        ctx.clearRect(0, 0, 32, 32);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 32, 32);
        gradient.addColorStop(0, '#0a0f2b');
        gradient.addColorStop(1, '#080d24');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        
        // Draw planet
        ctx.beginPath();
        ctx.arc(16, 16, 8, 0, Math.PI * 2);
        const planetGradient = ctx.createLinearGradient(8, 8, 24, 24);
        planetGradient.addColorStop(0, '#8b5cf6');
        planetGradient.addColorStop(1, '#22d3ee');
        ctx.fillStyle = planetGradient;
        ctx.fill();
        
        // Draw ring
        ctx.beginPath();
        ctx.ellipse(16, 16, 14, 5, Math.PI / 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Create favicon link
        const link = document.querySelector('link[rel="icon"]') || document.createElement('link');
        link.rel = 'icon';
        link.href = canvas.toDataURL('image/png');
        if (!document.querySelector('link[rel="icon"]')) {
            document.head.appendChild(link);
        }
    }
    
    // Draw favicon when page loads
    drawFavicon();
})();
