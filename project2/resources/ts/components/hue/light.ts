import { Component, ComponentOptions } from "../../component.js";
import toggle from "../../elements/toggle.js";
import { hex_to_hsl, hsl_to_hex, throttle } from "../../utils.js";
import { HueBridge } from "./index.js";

interface HueLightOptions extends ComponentOptions {
  bridge: HueBridge;
  id: string;
  state: {
    on: boolean;
    bri: number;
    hue: number;
    sat: number;
    effect: string;
    xy: number[];
    ct: number;
    alert: string;
    colormode: string;
    mode: string;
    reachable: boolean;
  };
}

interface APILight {
  state: {
    on: boolean;
    bri: number;
    hue: number;
    sat: number;
    effect: string;
    xy: number[];
    ct: number;
    alert: string;
    colormode: string;
    mode: string;
    reachable: boolean;
  };
  swupdate: {
    state: string;
    lastinstall: Date;
  };
  type: string;
  name: string;
  modelid: string;
  manufacturername: string;
  productname: string;
  capabilities: {
    certified: boolean;
    control: {
      mindimlevel: number;
      maxlumen: number;
      colorgamuttype: string;
      colorgamut: number[][];
      ct: {
        min: number;
        max: number;
      };
    };
    streaming: {
      renderer: boolean;
      proxy: boolean;
    };
  };
  config: {
    archetype: string;
    function: string;
    direction: string;
    startup: {
      mode: string;
      configured: boolean;
    };
  };
  uniqueid: string;
  swversion: string;
  swconfigid: string;
  productid: string;
}

export class HueLight extends Component {
  id: string;
  bridge: HueBridge;
  element = document.createElement("article");
  _state: {
    on: boolean;
    bri: number;
    hue: number;
    sat: number;
    effect: string;
    xy: number[];
    ct: number;
    alert: string;
    colormode: string;
    mode: string;
    reachable: boolean;
  };

  constructor(opts: HueLightOptions) {
    super();
    this.bridge = opts.bridge;
    this.id = opts.id;
    this._state = opts.state;
    this.name = opts.name;
  }

  get hue() {
    return (this.state.hue * 360) / 65535;
  }
  get saturation() {
    return (this.state.sat * 100) / 255;
  }
  get brightness() {
    return (this.state.bri * 100) / 255;
  }

  get state() {
    return this._state;
  }

  set state(state: HueLightOptions["state"]) {
    this._state = state;
  }

  async set_state(state: 0 | 1) {
    const response = await this.bridge.put(
      `/lights/${this.id}/state`,
      JSON.stringify({
        on: state === 1 ? true : false,
      })
    );

    const new_state = (await this.bridge.get(`/lights/${this.id}`)) as APILight;

    this.state = new_state.state;

    this.set_element_color(this.hue, this.saturation, this.brightness);

    return response;
  }

  async turn_on() {
    return await this.set_state(1);
  }

  async turn_off() {
    return await this.set_state(0);
  }

  async toggle() {
    if (this.state.on) return await this.turn_off();
    return await this.turn_on();
  }

  async set_color(hue: number, sat: number, bri?: number) {
    hue = Math.round(hue * 65535);
    sat = Math.round(sat * 255);
    bri = bri ? Math.round(bri * 255) : 200;

    const response = await this.bridge.put(
      `/lights/${this.id}/state`,
      JSON.stringify({ hue, sat, bri })
    );

    const new_state = (await this.bridge.get(`/lights/${this.id}`)) as APILight;
    this.state = new_state.state;

    this.set_element_color(this.hue, this.saturation, this.brightness);

    return response;
  }

  set_element_color(
    hue: string | number,
    saturation: string | number,
    lightness: string | number,
    update_color_picker = false
  ) {
    const color = `hsl(${hue}deg, ${saturation}%, ${lightness}%, 1)`;
    this.element?.style.setProperty("border-color", color);
    (this.element?.firstChild as HTMLElement).style.setProperty(
      "background-color",
      color
    );

    if (parseInt(lightness.toString()) < 50) {
      (this.element?.firstChild as HTMLElement).classList.add("text-white");
      (this.element?.firstChild as HTMLElement).classList.remove("text-black");
    } else {
      (this.element?.firstChild as HTMLElement).classList.add("text-black");
      (this.element?.firstChild as HTMLElement).classList.remove("text-white");
    }

    if (update_color_picker) {
      const color_picker_input = this.element.querySelector(
        `#light-${this.id}-color-picker`
      ) as HTMLInputElement;
      color_picker_input.value = hsl_to_hex(
        this.hue,
        this.saturation,
        this.brightness
      );
    }
  }

  async update(update_color_picker = true) {
    const new_state = (await this.bridge.get(`/lights/${this.id}`)) as APILight;
    this.state = new_state.state;

    const btn_input = this.element.querySelector(
      `#light-${this.id}`
    ) as HTMLInputElement;
    const color_picker_input = this.element.querySelector(
      `#light-${this.id}-color-picker`
    ) as HTMLInputElement;

    btn_input.checked = this.state.on;
    color_picker_input.disabled = !this.state.on;

    this.set_element_color(
      this.hue,
      this.saturation,
      this.brightness,
      update_color_picker
    );
  }

  render() {
    this.element.classList.add("card", "border-3");

    // Make a button switch to toggle the light
    const button = toggle({
      id: `light-${this.id}`,
      checked: this.state.on,
      text: "Toggle Light",
      click: async () => {
        if (!this.state.on) {
          await this.turn_on();
        } else {
          await this.turn_off();
        }
      },
    });

    // Add a color picker to change the color of the light
    const color_picker = document.createElement("div");
    color_picker.classList.add("d-flex", "gap-2");
    const color_picker_input = document.createElement("input");
    color_picker_input.classList.add("btn", "btn-outline-primary", "p-0");
    color_picker_input.id = `light-${this.id}-color-picker`;
    color_picker_input.type = "color";
    color_picker_input.value = hsl_to_hex(
      this.hue,
      this.saturation,
      this.brightness
    );
    color_picker_input.disabled = !this.state.on;
    // Add label for the color picker
    const color_picker_label = document.createElement("label");
    color_picker_label.classList.add("form-label");
    color_picker_label.htmlFor = `light-${this.id}-color-picker`;
    color_picker_label.textContent = "Color Picker";

    color_picker.appendChild(color_picker_input);
    color_picker.appendChild(color_picker_label);

    // Add bulb icon to top right of card
    const bulb_icon = document.createElement("i");
    bulb_icon.classList.add(
      "fa-regular",
      "fa-lightbulb",
      "fa-lg",
      "d-flex",
      "align-items-center"
    );

    const header = document.createElement("div");
    header.classList.add(
      "card-header",
      "d-flex",
      "justify-content-between",
      "fw-bold",
      "rounded-0"
    );
    const body = document.createElement("div");
    body.classList.add("card-body", "d-flex", "flex-column", "gap-2");

    // Toggle the light when the button is clicked
    button.addEventListener("click", async () => {
      await this.toggle();
      this.update();
    });
    color_picker_input.addEventListener("input", (event) => {
      throttle(() => {
        const { hue, saturation, lightness } = hex_to_hsl(
          color_picker_input.value
        );
        this.set_color(hue, saturation, lightness);
      }, 500);
      this.update(false);
    });

    header.textContent = this.name;
    header.appendChild(bulb_icon);
    body.appendChild(button);
    body.appendChild(color_picker);

    this.element.appendChild(header);
    this.element.appendChild(body);

    this.set_element_color(this.hue, this.saturation, this.brightness);

    return this.element;
  }
}
