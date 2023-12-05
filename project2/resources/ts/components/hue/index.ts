import { Component, ComponentOptions } from "../../component.js";
import { HueLight } from "./light.js";

export { default as discovery } from "./discovery.js";

const USER = localStorage.getItem("hue-userid") ?? "newdeveloper";

interface HueBridgeOptions extends ComponentOptions {
  id: string;
  ip: string;
  mac?: string;
}

export class HueBridge extends Component {
  id: string;
  ip: string;
  lights: HueLight[] = [];
  mac?: string;
  element = document.createElement("article");

  get base_url() {
    return `http://${this.ip}/api/${USER}/`;
  }

  constructor({ ip, id, mac }: HueBridgeOptions) {
    super();
    this.ip = ip;
    this.id = id;
    this.mac = mac;
  }

  private async base_requst(
    method: "GET" | "PUT" | "POST",
    params: string,
    body?: BodyInit
  ) {
    if (params[0] === "/") params = params.slice(1);
    return await fetch(this.base_url + params, { method, body })
      .then((response) => response.json())
      .catch((err) => {
        this.errors.push(err.message);
        throw err;
      });
  }

  async get(params: string) {
    return await this.base_requst("GET", params);
  }

  async put(params: string, body: string) {
    return await this.base_requst("PUT", params, body);
  }

  async post(params: string, body: string) {
    return await this.base_requst("POST", params, body);
  }

  async discover_lights() {
    const response = await this.get("lights");

    if (response[0]?.error?.type === 1) {
      this.errors.push(response[0].error.description);
      this.errors.push(`"${USER}" is not a valid user.`);
      return;
    }

    for (const light_id in response) {
      const raw_light = response[light_id];

      this.lights.push(
        new HueLight({
          bridge: this,
          id: light_id,
          ...raw_light,
        })
      );
    }
  }

  async update() {
    for (const light of this.lights) {
      await light.update();
    }
  }

  render_ligts() {
    return this.lights.map((light) => light.render());
  }

  render() {
    const header = document.createElement("div");
    header.classList.add("card-header", "fw-bold");
    const body = document.createElement("div");
    body.classList.add("card-body");
    header.textContent = this.name;

    this.element.classList.add("card", "w-100");
    this.element.appendChild(header);
    this.element.appendChild(body);

    for (const warning of this.warnings) {
      const warning_element = document.createElement("div");
      warning_element.classList.add("alert", "alert-warning");
      warning_element.textContent = warning;
      body.appendChild(warning_element);
    }
    for (const error of this.errors) {
      const error_element = document.createElement("div");
      error_element.classList.add("alert", "alert-danger");
      error_element.textContent = error;
      body.appendChild(error_element);
    }

    const rendered_lights = this.render_ligts().map((light) => {
      const li = document.createElement("li");
      li.appendChild(light);
      return li;
    });

    const ul = document.createElement("ul");
    ul.classList.add("d-flex", "flex-wrap", "gap-2", "m-0", "list-unstyled");
    for (const light of rendered_lights) {
      ul.appendChild(light);
    }
    body.appendChild(ul);

    return this.element;
  }
}
