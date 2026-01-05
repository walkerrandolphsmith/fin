export interface Configuration {
  mailgunApiKey: string;
  mailgunDomain: string;
  baseUrl: string;
  anthropicApiKey: string;
}

export class ConfigurationFactory {
  static create(): Configuration {
    require("dotenv").config();
    return {
      mailgunApiKey: process.env.MAILGUN_API_KEY || "",
      mailgunDomain:
        process.env.MAILGUN_DOMAIN ||
        "sandbox64940a76262d4b8d801bb0f6498a4dbd.mailgun.org",
      baseUrl: process.env.BASE_URL || "http://localhost:3000",
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
    };
  }
}
