import controller from "./controller.js";

const container = document.getElementById("container")!;

(async () => {
  const components = await controller.discover();

  for (const component of components) {
    const renderedComponent = component.render();
    container.appendChild(renderedComponent);
  }
})();

const config = document.getElementById("config") as HTMLFormElement;
const config_userid = document.getElementById(
  "config-userid"
) as HTMLInputElement;
const config_authkey = document.getElementById(
  "config-authkey"
) as HTMLInputElement;

document.addEventListener("DOMContentLoaded", (event) => {
  config_userid.value = localStorage.getItem("hue-userid") ?? "";
  config_authkey.value = localStorage.getItem("shelly-authkey") ?? "";
});

config.addEventListener("submit", (event) => {
  event.preventDefault();
  localStorage.setItem("hue-userid", config_userid.value);
  localStorage.setItem("shelly-authkey", config_authkey.value);
  location.reload();
});

config.addEventListener("reset", (event) => {
  localStorage.removeItem("hue-userid");
  localStorage.removeItem("shelly-authkey");
  location.reload();
});

(async () => {
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    for (const component of controller.components) {
      await component.update();
    }
  }
})();
