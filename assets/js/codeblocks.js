// Code block enhancement with language labels and copy functionality
document.addEventListener('DOMContentLoaded', function() {
  // Target only top-level highlight blocks, not nested ones
  const codeBlocks = document.querySelectorAll('.highlight:not(.highlight .highlight)');

  codeBlocks.forEach(function(block) {
    // Skip if already processed or if parent is already a wrapper
    if (block.parentNode.classList.contains('code-block-wrapper') ||
      block.querySelector('.code-topbar')) {
      return;
    }

    // Create wrapper for the enhanced code block
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';

    // Insert wrapper before the highlight block
    block.parentNode.insertBefore(wrapper, block);

    // Move the highlight block into the wrapper
    wrapper.appendChild(block);

    // Extract language from Rouge-generated classes
    let language = 'text';

    // Rouge generates classes like "highlight-python", "highlight-javascript", etc.
    const classNames = block.className.split(' ');

    for (let className of classNames) {
      if (className.startsWith('highlight-')) {
        language = className.replace('highlight-', '');
        break;
      }
    }

    // Create topbar
    const topbar = document.createElement('div');
    topbar.className = 'code-topbar';

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'code-copy-btn';
    copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
        `;
    copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
    copyBtn.setAttribute('title', 'Copy code');

    // Add click handler for copy functionality
    copyBtn.addEventListener('click', function() {
      const code = block.querySelector('code');
      if (code) {
        const text = code.textContent || code.innerText;

        // Use modern clipboard API if available
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function() {
            showCopyFeedback(copyBtn);
          }).catch(function() {
            fallbackCopyText(text, copyBtn);
          });
        } else {
          fallbackCopyText(text, copyBtn);
        }
      }
    });

    // Assemble topbar (only copy button now)
    topbar.appendChild(copyBtn);

    // Insert topbar at the beginning of wrapper
    wrapper.insertBefore(topbar, block);
  });
});

function fallbackCopyText(text, button) {
  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    showCopyFeedback(button);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }

  document.body.removeChild(textArea);
}

function showCopyFeedback(button) {
  const originalHTML = button.innerHTML;

  // Show checkmark icon temporarily
  button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
    `;
  button.classList.add('copied');

  setTimeout(function() {
    button.innerHTML = originalHTML;
    button.classList.remove('copied');
  }, 2000);
}
