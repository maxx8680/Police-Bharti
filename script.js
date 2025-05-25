document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".slider img");
  let current = 0;
  let interval = 5000; // 5 seconds

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove("active");
      if (i === index) {
        slide.classList.add("active");
      }
    });
  }

  function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide(current);
  }

  // Start the slider
  setInterval(nextSlide, interval);

  // Mobile swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  const slider = document.querySelector(".slider");

  slider.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  slider.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
      nextSlide();
    } else if (touchEndX > touchStartX + 50) {
      current = (current - 1 + slides.length) % slides.length;
      showSlide(current);
    }
  }
});
