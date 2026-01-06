// Astronaut positioning script
function randomizeAstronautPosition() {
  const astronautLayer = document.getElementById('astronaut-layer');
  if (!astronautLayer) {
    console.log('Astronaut layer not found!');
    return;
  }

  console.log('Randomizing astronaut position...');

  // Get viewport width
  const viewportWidth = window.innerWidth;

  // Randomize size (50% to 150% of 200px base size)
  const sizeMultiplier = 0.5 + Math.random() * 1.0; // 0.5 to 1.5
  const astronautSize = Math.round(200 * sizeMultiplier);

  // Speed should be directly related to size (larger = faster, closer objects)
  // Base duration is 90s, range from 120s (slow/small/far) to 60s (fast/large/close)
  const animationDuration = Math.round(180 - (sizeMultiplier * 60)); // 120s to 60s

  // Calculate content area boundaries (based on max-width: 800px centered)
  const contentMaxWidth = 800;
  const contentPadding = 32; // 2rem padding
  const contentStart = Math.max(0, (viewportWidth - contentMaxWidth) / 2 - contentPadding);
  const contentEnd = Math.min(viewportWidth, (viewportWidth + contentMaxWidth) / 2 + contentPadding);

  // Define safe zones (avoiding content area)
  const margin = 50; // extra margin for safety

  let randomX;

  // Ensure we have enough space for positioning
  if (contentStart < astronautSize + margin * 2) {
    // If left side is too narrow, use right side
    const rightMin = contentEnd + margin;
    const rightMax = viewportWidth - astronautSize - margin;
    if (rightMax > rightMin) {
      randomX = Math.random() * (rightMax - rightMin) + rightMin;
    } else {
      // Fallback to simple positioning if screen is too narrow
      randomX = Math.random() * (viewportWidth - astronautSize);
    }
  } else if (viewportWidth - contentEnd < astronautSize + margin * 2) {
    // If right side is too narrow, use left side
    const leftMax = contentStart - margin;
    randomX = Math.random() * (leftMax - astronautSize - margin) + margin;
  } else {
    // Choose left or right side randomly
    if (Math.random() < 0.5) {
      // Left side
      const leftMax = contentStart - margin;
      randomX = Math.random() * (leftMax - astronautSize - margin) + margin;
    } else {
      // Right side
      const rightMin = contentEnd + margin;
      const rightMax = viewportWidth - astronautSize - margin;
      randomX = Math.random() * (rightMax - rightMin) + rightMin;
    }
  }

  // Convert to percentage
  const xPercent = (randomX / viewportWidth) * 100;

  // Randomize vertical position (avoid top and bottom edges)
  const yPercent = Math.random() * 60 + 20; // 20% to 80%

  // Apply the size and position
  astronautLayer.style.backgroundSize = `${astronautSize}px ${astronautSize}px`;
  astronautLayer.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
  astronautLayer.style.animationDuration = `${animationDuration}s`;

  // Restart animation
  astronautLayer.style.animation = 'none';
  requestAnimationFrame(() => {
    astronautLayer.style.animation = `moveAstronaut ${animationDuration}s linear infinite`;
  });

  console.log(`Astronaut: ${astronautSize}px, ${animationDuration}s duration, ${xPercent.toFixed(1)}% x ${yPercent.toFixed(1)}% y`);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing astronaut...');
  // Small delay to ensure CSS is loaded
  setTimeout(randomizeAstronautPosition, 100);
});

// Re-randomize on window resize
window.addEventListener('resize', function() {
  console.log('Window resized, repositioning astronaut...');
  randomizeAstronautPosition();
});
