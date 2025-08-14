// galaxy-bg.js - Simplified artistic galaxy background
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // remove development log

    // Get the canvas element
    const canvas = document.getElementById('galaxy-bg');
    if (!canvas) {
      console.error('Canvas element not found!');
      return;
    }

    // Get the drawing context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context!');
      return;
    }

    // Variables for dimensions
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Set canvas size with proper pixel ratio
    function resizeCanvas() {
      const pixelRatio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.scale(pixelRatio, pixelRatio);
    }

    // Stars array
    const stars = [];

    // Dust clouds array (simpler than nebula)
    const dustClouds = [];

    // Create stars
    function createStars() {
      // reset the stars array
      stars.length = 0;

      // Background stars
      // Reduce the number of stars by increasing the divisor.  A smaller
      // density makes the background feel less "busy" and prevents it
      // from overwhelming the page content.  We use a divisor of 6000
      // instead of 3000 to cut the star count roughly in half.
      const starCount = Math.floor((width * height) / 6000);

      for (let i = 0; i < starCount; i++) {
        // Create stars with varying brightness
        const brightness = Math.random();
        // Make stars smaller and less luminous.  A lower radius and
        // reduced opacity create a more subtle effect.
        const radius = brightness * 1.0 + 0.3;

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: radius,
          // Lower overall opacity so stars appear softer on the dark background
          opacity: brightness * 0.4 + 0.2,
          // Slow down blinking so the animation is calmer
          blinkSpeed: Math.random() * 0.015 + 0.003,
          blinkDirection: Math.random() > 0.5 ? 1 : -1,
          twinkle: Math.random() > 0.5,
        });
      }

      // Add a few brighter stars
      for (let i = 0; i < starCount / 20; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          // Slightly reduce the size of bright stars
          radius: Math.random() * 1.5 + 1.2,
          // Keep bright stars visible but not blinding
          opacity: Math.random() * 0.2 + 0.6,
          blinkSpeed: Math.random() * 0.007 + 0.002,
          blinkDirection: Math.random() > 0.5 ? 1 : -1,
          twinkle: true,
        });
      }

      // stars created (log removed)
    }

    // Create dust clouds (simpler than nebula)
    function createDustClouds() {
      // reset the dust clouds array
      dustClouds.length = 0;

      // Create a few large, subtle dust clouds
      const cloudCount = 5;

      // Cloud colors
      // Use a lower alpha on the nebula colours to make the fog gentler.
      const cloudColors = [
        'rgba(110, 142, 251, 0.02)', // Blue
        'rgba(167, 119, 227, 0.02)', // Purple
        'rgba(255, 90, 196, 0.02)', // Pink
        'rgba(255, 180, 120, 0.02)', // Orange
        'rgba(120, 200, 255, 0.02)', // Light blue
      ];

      for (let i = 0; i < cloudCount; i++) {
        // Position clouds across the screen
        const x = width * (0.2 + Math.random() * 0.6); // Keep away from edges
        const y = height * (0.2 + Math.random() * 0.6);

        // Large clouds
        const radius = Math.min(width, height) * (0.3 + Math.random() * 0.3);

        dustClouds.push({
          x: x,
          y: y,
          radius: radius,
          color: cloudColors[i % cloudColors.length],
        });
      }

      // dust clouds created (log removed)
    }

    // Draw dust clouds
    function drawDustClouds() {
      dustClouds.forEach((cloud) => {
        const gradient = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          0,
          cloud.x,
          cloud.y,
          cloud.radius
        );
        gradient.addColorStop(0, cloud.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw stars
    function drawStars() {
      stars.forEach((star) => {
        // Update star opacity for twinkling effect
        if (star.twinkle) {
          star.opacity += star.blinkDirection * star.blinkSpeed;

          // Reverse direction when reaching opacity limits
          if (star.opacity >= 1) {
            star.opacity = 1;
            star.blinkDirection = -1;
          } else if (star.opacity <= 0.2) {
            star.opacity = 0.2;
            star.blinkDirection = 1;
          }
        }

        // Draw glow effect for larger stars
        if (star.radius > 1.5) {
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 3);
          glow.addColorStop(0, `rgba(255, 255, 255, ${star.opacity * 0.5})`);
          glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw the star itself
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
    }

    // Draw the entire scene
    function drawScene() {
      // Clear the canvas
      ctx.clearRect(0, 0, width, height);

      // Draw in layers
      drawDustClouds(); // Dust clouds first (background)
      drawStars(); // Stars on top
    }

    // Animation loop
    function animate() {
      drawScene();
      requestAnimationFrame(animate);
    }

    // Initialize
    function init() {
      resizeCanvas();
      createDustClouds();
      createStars();
      animate();
      // animation started (log removed)

      // Handle window resize
      window.addEventListener('resize', function () {
        resizeCanvas();
        createDustClouds();
        createStars();
      });
    }

    // Start the animation
    init();
  });
})();
