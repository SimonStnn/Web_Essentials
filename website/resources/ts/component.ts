export interface ComponentOptions {
  name: string;
  element?: HTMLElement;
}

export abstract class Component implements ComponentOptions {
  // Make the class name available on the instance
  abstract element: HTMLElement;
  abstract render(): DocumentFragment | HTMLElement;
  abstract update(): Promise<void>;
  warnings: string[] = [];
  errors: string[] = [];

  name = this.constructor.name;
}
