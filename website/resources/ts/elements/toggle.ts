interface ToggleOptions {
  id: string;
  checked: boolean;
  text: string;
  click: () => void;
}

export default (opts: ToggleOptions) => {
  // Make a button switch
  const button = document.createElement("span");
  button.classList.add("form-switch", "w-0", "d-flex", "gap-2");
  const btn_input = document.createElement("input");
  btn_input.classList.add("form-check-input");
  btn_input.id = opts.id;
  btn_input.type = "checkbox";
  btn_input.checked = opts.checked;
  btn_input.role = "switch";
  btn_input.addEventListener("click", () => opts.click());
  // Add label to the button
  const btn_label = document.createElement("label");
  btn_label.classList.add("form-check-label");
  btn_label.htmlFor = opts.id;
  btn_label.textContent = opts.text;
  button.appendChild(btn_input);
  button.appendChild(btn_label);

  return button;
};
