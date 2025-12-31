import { initAutoAttachThumbnail } from './auto-attach-thumbnail.js';
import { initRegenerateThumbnails } from './regenerate-thumbnails.js';

function initDarkMode() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initAutoAttachThumbnail();
  initRegenerateThumbnails();
  initDarkMode();
});
