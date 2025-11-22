import { NextResponse } from "next/server";
import swaggerJsdoc from "swagger-jsdoc";

const nextRoutes = "src/app/api/**/*.ts";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fin API",
      version: "1.0.0",
      description: "API documentation for the Fin personal finance app",
    },
  },
  apis: [nextRoutes],
};

const swaggerSpec = swaggerJsdoc(options);

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
