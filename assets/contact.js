(function () {
  "use strict";

  const form = document.getElementById("contactForm");
  if (!form) return;

  const status = document.getElementById("contactStatus");
  const button = document.getElementById("sendBtn");
  const serviceSelect = document.getElementById("contactService");
  const originalButtonText = button.textContent;

  const requestedService = new URLSearchParams(window.location.search).get("service");
  if (requestedService && serviceSelect) {
    const matchingOption = Array.from(serviceSelect.options).find(function (option) {
      return option.value === requestedService;
    });
    if (matchingOption) serviceSelect.value = requestedService;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    status.classList.remove("error", "success");
    status.textContent = "";

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    button.disabled = true;
    button.textContent = "Sending...";

    const controller = new AbortController();
    const timeoutId = window.setTimeout(function () {
      controller.abort();
    }, 20000);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
        credentials: "same-origin",
        signal: controller.signal
      });

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : {};

      if (!response.ok || result.ok === false) {
        throw new Error(result.error || "Unable to send your enquiry right now.");
      }

      form.reset();
      status.classList.add("success");
      status.textContent = "Thank you. Your enquiry has been sent successfully.";
    } catch (error) {
      status.classList.add("error");
      status.textContent = error.name === "AbortError"
        ? "The request timed out. Please try again or email sofitcontact@gmail.com."
        : (error.message || "Unable to send your enquiry. Please email sofitcontact@gmail.com.");
    } finally {
      window.clearTimeout(timeoutId);
      button.disabled = false;
      button.textContent = originalButtonText;
    }
  });
}());
