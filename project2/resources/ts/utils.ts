export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function render_string(str: string) {
  const range = document.createRange();
  const fragment = range.createContextualFragment(str);
  return fragment;
}

let shouldWait = false;
let waitingArgs: any[] | null = null;
export function throttle(cb: Function, delay = 1000) {
  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false;
    } else {
      cb(...waitingArgs);
      waitingArgs = null;
      setTimeout(timeoutFunc, delay);
    }
  };

  return ((...args: any[]) => {
    if (shouldWait) {
      waitingArgs = args;
      return;
    }

    cb(...args);
    shouldWait = true;

    setTimeout(timeoutFunc, delay);
  })();
}

export function hex_to_rgb(hex: string) {
  const [r, g, b] = hex.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  return { r, g, b };
}

export function rgb_to_hex(r: number, g: number, b: number) {
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

export function rgb_to_hsl(r: number, g: number, b: number) {
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h! /= 6;
  }

  return { hue: h!, saturation: s, lightness: l };
}

export function hex_to_hsl(hex: string) {
  const { r, g, b } = hex_to_rgb(hex);
  return rgb_to_hsl(r, g, b);
}

export function hsl_to_hex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: any) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    const b = Math.round(255 * color).toString(16);
    return b.length === 1 ? `0${b}` : b;
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
