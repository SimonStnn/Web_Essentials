import { Component } from "../../component.js";
import toggle from "../../elements/toggle.js";

export { default as discovery } from "./discovery.js";

export const AUTH_KEY = localStorage.getItem("shelly-authkey");
export const HOST = "https://shelly-58-eu.shelly.cloud";

interface ShellyOptions {
  id: string;
  ip: string;
  meters: {
    power: number;
  }[];
  relays: {
    ison: boolean;
  }[];
}

export class Shelly extends Component implements ShellyOptions {
  element = document.createElement("article");
  id: string;
  ip: string;
  meters: {
    power: number;
  }[];
  relays: {
    ison: boolean;
  }[];

  constructor({ id, ip, meters, relays }: ShellyOptions) {
    super();
    this.id = id;
    this.ip = ip;
    this.meters = meters;
    this.relays = relays;
  }

  get ison() {
    return this.relays[0].ison;
  }
  get consumption() {
    return this.meters[0].power;
  }

  async set_state(state: "on" | "off") {
    const response: null = await fetch(
      `http://${this.ip}/relay/0?turn=${state}`,
      {
        method: "GET",
        mode: "no-cors",
      }
    )
      .then((response) => response.json())
      .catch((error) => null);

    return response;
  }

  async turn_on() {
    return await this.set_state("on");
  }

  async turn_off() {
    return await this.set_state("off");
  }

  async update() {
    const response = await fetch(`http://${this.ip}/status`, {
      method: "GET",
    }).then((response) => response.json());

    if (!response) return;

    this.relays = response.relays;
    this.meters = response.meters;

    this.element.querySelector("input")!.checked = this.ison;

    this.element.querySelector(
      "div.card-body div"
    )!.textContent = `Consumption: ${this.consumption}W`;
  }

  render() {
    this.element.classList.add("card");
    const header = document.createElement("div");
    header.classList.add(
      "card-header",
      "fw-bold",
      "d-flex",
      "justify-content-between"
    );
    const body = document.createElement("div");
    body.classList.add("card-body");
    this.element.appendChild(header);
    this.element.appendChild(body);

    // Make a button switch to toggle the light
    const button = toggle({
      id: `shelly-${this.id}`,
      checked: this.ison,
      text: "Toggle Plug",
      click: async () => {
        if (!this.ison) {
          await this.turn_on();
        } else {
          await this.turn_off();
        }
      },
    });

    // Add consumption to the card body
    const consumption = document.createElement("div");
    consumption.textContent = `Consumption: ${this.consumption}W`;

    // Add bulb icon to top right of card
    const bulb_icon = document.createElement("i");
    bulb_icon.classList.add(
      "fa-solid",
      "fa-plug",
      "fa-lg",
      "d-flex",
      "align-items-center",
      "text-muted"
    );

    header.textContent = this.name;
    header.appendChild(bulb_icon);
    body.appendChild(consumption);
    body.appendChild(button);
    return this.element;
  }
}
