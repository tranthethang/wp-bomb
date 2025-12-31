export function initAutoAttachThumbnail() {
  const autoThumbsForm = document.querySelector('form[name="bomb-auto-thumbs-form"]');

  if (autoThumbsForm) {
    autoThumbsForm.addEventListener('submit', function(e) {
      if (!confirm('Are you sure you want to attach thumbnails? This will set thumbnails for posts based on the specified ID range.')) {
        e.preventDefault();
      }
    });
  }
}
