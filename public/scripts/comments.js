const deleteButtons = [...document.querySelectorAll("button.delete")];
const originalText = deleteButtons[0].textContent;

function resetButton(button) {
  button.dataset.clicked = "false";
  button.classList.remove("clicked");
  button.textContent = originalText;
}

function activateButton(button) {
  button.dataset.clicked = "true";
  button.classList.add("clicked");
  button.textContent = "Confirm";
}

deleteButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    if (button.dataset.clicked === "true") return;
    e.preventDefault();
    activateButton(button);
  });
});

const body = document.querySelector("body");
body.addEventListener(
  "click",
  (e) => {
    if (e.target.dataset.clicked === "true") return;
    deleteButtons.forEach((button) => resetButton(button));
  },
  true // Use capturing so events trickle down rathere than bubble up
);
