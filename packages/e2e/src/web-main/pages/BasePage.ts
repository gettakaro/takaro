import type { Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(public readonly page: Page) {}
  abstract goto(): Promise<void>;
}
