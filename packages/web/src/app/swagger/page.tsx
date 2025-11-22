"use client";

import NavInteractive from "@/components/Navigation";
import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function OpenApiDocsPage() {
  const [spec, setSpec] = useState<unknown>(null);

  useEffect(() => {
    fetch("/api/swagger")
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => console.error("Failed to fetch OpenAPI spec:", err));
  }, []);

  return (
    <div>
      <NavInteractive />
      <div className="ml-16 mt-0 bg-[#f6f9fc] inline-block w-full min-h-screen min-w-screen">
        {spec && <SwaggerUI spec={spec} displayOperationId={true} />}
        {!spec && (
          <div className="w-full h-screen flex justify-center">
            Loading API docs...
          </div>
        )}
      </div>
    </div>
  );
}
