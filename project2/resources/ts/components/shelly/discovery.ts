import { Shelly, HOST, AUTH_KEY } from "./index.js";

interface ShellyResponse {
  isok: boolean;
  data: {
    devices_status: {
      [key: string]: {
        _dev_info: {
          code: string;
        };
        wifi_sta?: {
          ip: string;
        };
        meters: {
          power: number;
        }[];
        relays: {
          ison: boolean;
        }[];
      };
    };
  };
}

export default async () => {
  let response = await window
    .fetch(
      `${HOST}/device/all_status?show_info=true&no_shared=true&auth_key=${AUTH_KEY}`,
      { method: "GET" }
    )
    .then(async (response) => {
      const json = (await response.json()) as ShellyResponse;
      console.log("Shelly discovery response:", json);
      if (!json.isok)
        throw new Error("Shelly discovery failed: " + JSON.stringify(json));
      console.log("Shelly discovery succes!");
      localStorage.setItem("shelly-devices", JSON.stringify(json));
      return json;
    })
    .catch((error) => {
      const local = localStorage.getItem("shelly-devices");
      if (local && local !== "{}") return JSON.parse(local) as ShellyResponse;
      return { isok: false } as ShellyResponse;
    });

  if (!response.isok) return [];

  const shellys = [];
  for (const device of Object.keys(response.data.devices_status)) {
    const shelly = response.data.devices_status[device];
    const shelly_ip = shelly.wifi_sta?.ip;
    if (shelly._dev_info.code != "SHPLG-S" || !shelly_ip) continue;

    shellys.push(
      new Shelly({
        id: device,
        ip: shelly_ip,
        meters: shelly.meters,
        relays: shelly.relays,
      })
    );
  }

  return shellys;
};
