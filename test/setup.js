// Import jest-dom
import '@testing-library/jest-dom';

// Simulate mouse and touch events on document
document.simulateMouseUp = () => {
  document.dispatchEvent(new MouseEvent('mouseup'));
};

document.simulateMouseMove = (clientX, clientY) => {
  document.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }));
};

document.simulateTouchEnd = () => {
  document.dispatchEvent(new TouchEvent('touchend'));
};

document.simulateTouchMove = (clientX, clientY) => {
  document.dispatchEvent(new TouchEvent('touchmove', { changedTouches: [{ clientX, clientY }] }));
};

// Simulate window resize
window.resizeTo = (width, height) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
};
