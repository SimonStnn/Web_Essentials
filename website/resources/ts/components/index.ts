import * as Hue from "./hue/index.js";
import * as Shelly from "./shelly/index.js";

export default {
  hue: { ...Hue },
  shelly: { ...Shelly },
};
