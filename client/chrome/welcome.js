// Add event listener to the "I'm Ready to Start" button
document.addEventListener('DOMContentLoaded', function() {
  const openPopupButton = document.getElementById('open-popup');
  if (openPopupButton) {
    openPopupButton.addEventListener('click', function() {
      window.close();
    });
  }
});
