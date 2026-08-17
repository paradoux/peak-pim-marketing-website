/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    locale?: "en" | "fr" | "de" | "es" | "it" | "nl" | "pt-br" | "pl" | "ja";
    localizedPath?: string;
  }
}
