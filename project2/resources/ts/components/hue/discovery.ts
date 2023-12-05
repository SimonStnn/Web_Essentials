import { HueBridge } from "./index.js";

interface DiscoveryMessage {
  id: string;
  internalipaddress: string;
  macaddress?: string;
  name?: string;
  port?: number;
}

export default async () => {
  const bridges: HueBridge[] = [];
  const response = await fetch("https://discovery.meethue.com/", {
    mode: "no-cors",
  })
    .then(async (response) => {
      const json = (await response.json()) as DiscoveryMessage[];
      localStorage.setItem("hue-bridges", JSON.stringify(json));
      console.log("Hue discovery succes!");
      console.log("Hue bridge discovery response:", json);
      return json;
    })
    .catch(() => {
      const local = localStorage.getItem("hue-bridges");
      if (local && local !== "{}")
        return JSON.parse(local) as DiscoveryMessage[];
      return [{ id: "", internalipaddress: "10.10.10.10" }];
    });
  console.log("Hue bridges:", response);

  for (const message of response as DiscoveryMessage[]) {
    bridges.push(
      new HueBridge({
        ip: message.internalipaddress,
        id: message.id,
        name: message.name ?? "Hue Bridge",
      })
    );
  }

  for (const bridge of bridges) {
    await bridge.discover_lights();
  }

  return bridges;
};
