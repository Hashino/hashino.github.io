// Astronaut animation system
class AstronautManager {
  constructor() {
    this.container = null;
    this.isActive = true;
    this.currentAstronaut = null;
    this.init();
  }

  init() {
    // Create astronaut container
    this.container = document.createElement('div');
    this.container.id = 'astronauts';
    document.body.appendChild(this.container);

    // Start spawning astronauts
    this.startSpawning();
  }

  createAstronaut() {
    // Don't create new astronaut if one already exists
    if (this.currentAstronaut) {
      return;
    }

    const astronaut = document.createElement('div');
    astronaut.className = 'astronaut';
    this.currentAstronaut = astronaut;

    // Random properties
    const size = this.getRandomSize();
    const horizontalPosition = Math.random() * 100; // 0-100%
    const duration = this.getDurationFromSize(size);

    // Apply styles
    astronaut.style.width = `${size}px`;
    astronaut.style.height = `${size}px`;
    astronaut.style.left = `${horizontalPosition}%`;
    astronaut.style.bottom = `-${size}px`; // Start below viewport
    astronaut.style.animationDuration = `${duration}s`;

    // Add to container
    this.container.appendChild(astronaut);

    // Remove astronaut after animation completes
    setTimeout(() => {
      if (astronaut.parentNode) {
        astronaut.parentNode.removeChild(astronaut);
      }
      this.currentAstronaut = null;
    }, duration * 1000);
  }

  getRandomSize() {
    // Random size between 20px and 400px with equal probability
    const minSize = 20;
    const maxSize = 400;

    return Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
  }

  getDurationFromSize(size) {
    // Larger astronauts (closer) move faster, smaller ones (distant) move slower
    // Duration between 15-90 seconds
    const minDuration = 15;
    const maxDuration = 90;
    const minSize = 20;
    const maxSize = 400;

    // Inverse relationship: larger size = shorter duration (faster)
    const normalizedSize = (size - minSize) / (maxSize - minSize);
    const duration = maxDuration - (normalizedSize * (maxDuration - minDuration));

    return duration;
  }

  startSpawning() {
    const spawnAstronaut = () => {
      if (this.isActive) {
        this.createAstronaut();

        // Random interval between 60-300 seconds (1-5 minutes) for next attempt
        const nextSpawn = (Math.random() * 240 + 60) * 1000;
        setTimeout(spawnAstronaut, nextSpawn);
      }
    };

    // Initial delay before first astronaut (30-120 seconds)
    const initialDelay = (Math.random() * 90 + 30) * 1000;
    setTimeout(spawnAstronaut, initialDelay);
  }

  stop() {
    this.isActive = false;
  }

  start() {
    if (!this.isActive) {
      this.isActive = true;
      this.startSpawning();
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.astronautManager = new AstronautManager();
});
