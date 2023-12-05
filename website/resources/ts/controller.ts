import { Component } from "./component.js";
import components from "./components/index.js";
const discoveries = Object.keys(components).map(
  (component) => components[component as keyof typeof components].discovery
);

class Controller {
  components: Component[] = [];
  constructor() {}

  async discover() {
    const components: Component[] = [];

    for (const discovery of discoveries) {
      const discoveredComponents = await discovery();
      components.push(...discoveredComponents);
    }
    this.components = components;
    return components;
  }
}

export default new Controller();
