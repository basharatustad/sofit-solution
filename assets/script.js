"use strict";

function msg(event, targetId, message) {
  event.preventDefault();
  const target = document.getElementById(targetId);
  if (target) target.textContent = message;
}
