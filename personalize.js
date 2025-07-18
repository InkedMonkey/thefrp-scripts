// © 2025 InkedMonkey — Unauthorized reuse prohibited
// This script handles first name personalization across cf funnel pages with preserved styling.

document.addEventListener('DOMContentLoaded', function() {
  function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    var cookie = parts.length === 2 ? decodeURIComponent(parts.pop().split(";").shift()) : '';
    console.log("[🔵] Cookie check for", name + ":", cookie);
    return cookie;
  }

  function replaceFirstName() {
    var firstName = getCookie("contact_first_name");
    if (!firstName) {
      console.log("[🟠] No firstName, checking form submission...");
      var formSubmitted = document.querySelector('form[cf-submitted]');
      if (formSubmitted) console.log("[🟢] Form submitted, but cookie missing");
      else console.log("[🔴] Form not submitted or cookie not set");
    }

    var greetingElements = document.querySelectorAll('[data-role="personalized-greeting"]');
    if (greetingElements.length > 0) {
      greetingElements.forEach(element => {
        console.log("[🟢] Replacing in node, original:", element.textContent);
        if (firstName && element.textContent.includes('{{first_name}}')) {
          const styledSpan = document.createElement('span');
          styledSpan.textContent = firstName;
          // Clone all computed styles from parent element
          const computedStyles = window.getComputedStyle(element);
          for (let style of computedStyles) {
            styledSpan.style[style] = computedStyles.getPropertyValue(style);
          }
          // Ensure critical styles are set
          ['font', 'fontFamily', 'fontWeight', 'fontSize', 'color', 'letterSpacing', 'lineHeight', 'textAlign', 'textTransform', 'fontStyle'].forEach(style => {
            styledSpan.style[style] = computedStyles.getPropertyValue(style) || '';
          });
          styledSpan.style.whiteSpace = 'nowrap'; // Prevent line breaks
          // Replace text node directly with better flow control
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = element.innerHTML.replace(/{{first_name}}/g, `{{TEMP_${Date.now()}}}`); // Unique placeholder
          const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
          let node;
          while ((node = walker.nextNode())) {
            if (node.nodeValue.includes('{{TEMP_' + Date.now() + '}}')) {
              const range = document.createRange();
              range.selectNodeContents(node);
              const fragment = range.extractContents();
              const newSpan = styledSpan.cloneNode(true);
              newSpan.textContent = firstName;
              range.insertNode(newSpan);
              element.innerHTML = tempDiv.innerHTML.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();
            }
          }
          console.log("[🟩] Replaced to:", element.textContent);
        } else if (element.textContent.includes('{{first_name}}')) {
          element.innerText = element.innerText.replace(/{{first_name}}/g, 'friend');
          console.log("[🟨] Replaced with friend to:", element.textContent);
        } else {
          console.log("[🟡] No {{first_name}} found in:", element.textContent);
        }
        element.setAttribute('data-personalized', 'true');
      });
    } else {
      console.log("[🔴] No elements with data-role='personalized-greeting' found");
    }
  }

  replaceFirstName();
  setTimeout(replaceFirstName, 2000);
  setTimeout(replaceFirstName, 5000);
});