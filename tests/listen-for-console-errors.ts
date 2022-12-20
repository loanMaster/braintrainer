import { Page } from "@playwright/test";
import {fail} from "assert";

export const listenForConsoleErrors = async ({ page }: { page: Page }) => {
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      console.log('An error occurred in the console')
      console.log(msg.text())
      fail('console error')
    }
  });
}
