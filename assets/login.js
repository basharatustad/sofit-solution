(function () {
  "use strict";
  const form = document.getElementById("demoLoginForm");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("loginStatus").textContent =
      "Demo only — production login will use Azure managed authentication with GitHub or Microsoft identity.";
  });
}());
