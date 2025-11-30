import type { UiConceptMapping } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import type { IUiSystemAdapter } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
import { UiSystemDescriptor } from "../../../sys/dev-descriptor/models/ui-system-descriptor.model";
import { diag_css } from "../../../sys/utils/diagnosis";

type Mapping = UiConceptMapping | undefined;

export class BulmaAdapterService implements IUiSystemAdapter {
  private descriptor: UiSystemDescriptor | null = null;
  private observer: MutationObserver | null = null;
  private appliedSet = new WeakSet<HTMLElement>();

  constructor() {
    console.log("%c[BulmaAdapterService] constructor()", "color:#6cf");
  }

  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    diag_css("[BulmaAdapter] activate()", { id: descriptor.id });

    this.descriptor = descriptor || null;

    this.mapAll();
    this.observeMutations();

    diag_css("[BulmaAdapter] activate() COMPLETE");
  }

  async deactivate(): Promise<void> {
    diag_css("[BulmaAdapter] deactivate()");

    document.documentElement.removeAttribute("data-bulma-theme");

    if (this.observer) this.observer.disconnect();
    this.observer = null;
    this.descriptor = null;
    this.appliedSet = new WeakSet();
  }

  async applyTheme(theme: any): Promise<void> {
    const mode =
      typeof theme === "string"
        ? theme
        : theme?.mode || (theme?.id === "dark" ? "dark" : "light");

    document.documentElement.setAttribute(
      "data-bulma-theme",
      mode === "dark" ? "dark" : "light"
    );

    diag_css("[BulmaAdapter] Theme applied", { mode });
  }

  private getMapping(concept: string): Mapping {
    return (
      (this.descriptor &&
        this.descriptor.conceptMappings &&
        (this.descriptor.conceptMappings as any)[concept]) ||
      undefined
    );
  }

  private applyMappingToElement(el: HTMLElement, mapping?: Mapping) {
    if (!mapping) return;

    if (this.appliedSet.has(el)) return;

    if (mapping.class) {
      mapping.class.split(/\s+/).forEach((c) => c && el.classList.add(c));
    }

    if (mapping.attrs) {
      Object.entries(mapping.attrs).forEach(([k, v]) =>
        el.setAttribute(k, v)
      );
    }

    this.appliedSet.add(el);
  }

  private mapButtons() {
    const mapping = this.getMapping("button");
    if (!mapping) return;

    const nodes = document.querySelectorAll<HTMLElement>(
      "button[cdButton], button.cd-button"
    );

    nodes.forEach((n) => this.applyMappingToElement(n, mapping));
  }

  private mapInputs() {
    const mapping = this.getMapping("input");
    if (!mapping) return;

    const nodes = document.querySelectorAll<HTMLElement>(
      "input[cdFormControl], textarea[cdFormControl], select[cdFormControl]"
    );

    nodes.forEach((n) => this.applyMappingToElement(n, mapping));
  }

  private mapFormGroups() {
    const mapping = this.getMapping("formGroup");
    if (!mapping) return;

    const nodes = document.querySelectorAll<HTMLElement>(".cd-form-field");

    nodes.forEach((n) => this.applyMappingToElement(n, mapping));
  }

  private mapOtherConcepts() {
    const cm = this.descriptor?.conceptMappings || {};
    const concepts = Object.keys(cm).filter(
      (c) => !["button", "input", "formGroup"].includes(c)
    );

    concepts.forEach((concept) => {
      const mapping = (cm as any)[concept];
      const nodes = document.querySelectorAll<HTMLElement>(
        `[data-cd-${concept}], .cd-${concept}`
      );
      nodes.forEach((n) => this.applyMappingToElement(n, mapping));
    });
  }

  private mapAll() {
    this.mapButtons();
    this.mapInputs();
    this.mapFormGroups();
    this.mapOtherConcepts();
  }

  private observeMutations() {
    if (this.observer) return;

    this.observer = new MutationObserver(() => {
      if ("requestIdleCallback" in window)
        requestIdleCallback(() => this.mapAll());
      else setTimeout(() => this.mapAll(), 16);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

UiSystemAdapterRegistry.register("bulma", new BulmaAdapterService());
