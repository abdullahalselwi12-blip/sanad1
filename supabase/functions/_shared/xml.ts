// Shared XML utilities for REST API edge functions.
// Provides XML escaping, serialization, format detection, and response building.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

/**
 * Escape XML special characters.
 */
export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Convert boolean to XML-safe string.
 */
function xmlBool(value: boolean): string {
  return value ? "true" : "false";
}

/**
 * Serialize primitive values.
 */
function serializePrimitive(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "boolean") {
    return xmlBool(value);
  }

  if (typeof value === "number") {
    return String(value);
  }

  return xmlEscape(String(value));
}

/**
 * Make sure XML tag names are valid.
 */
function safeXmlTagName(key: string): string {
  const cleaned = key
    .replace(/[^a-zA-Z0-9_.-]/g, "_");

  if (!cleaned) {
    return "item";
  }

  if (/^[0-9]/.test(cleaned)) {
    return `item_${cleaned}`;
  }

  return cleaned;
}

/**
 * Serialize a plain object.
 */
function serializeObject(
  obj: Record<string, unknown>,
): string {
  return Object.entries(obj)
    .map(([key, value]) =>
      serializeValue(key, value),
    )
    .join("");
}

/**
 * Serialize a single value.
 */
function serializeValue(
  key: string,
  value: unknown,
): string {
  const safeKey = safeXmlTagName(key);

  if (value === null || value === undefined) {
    return `<${safeKey}/>`;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return (
      `<${safeKey}>` +
      `${serializePrimitive(value)}` +
      `</${safeKey}>`
    );
  }

  if (Array.isArray(value)) {
    const itemKey = singularize(safeKey);

    const items = value
      .map((item) => {
        if (
          item !== null &&
          typeof item === "object" &&
          !Array.isArray(item)
        ) {
          return (
            `<${itemKey}>` +
            serializeObject(
              item as Record<string, unknown>,
            ) +
            `</${itemKey}>`
          );
        }

        return (
          `<${itemKey}>` +
          serializePrimitive(item) +
          `</${itemKey}>`
        );
      })
      .join("");

    return (
      `<${safeKey}>` +
      items +
      `</${safeKey}>`
    );
  }

  if (typeof value === "object") {
    return (
      `<${safeKey}>` +
      serializeObject(
        value as Record<string, unknown>,
      ) +
      `</${safeKey}>`
    );
  }

  return (
    `<${safeKey}>` +
    xmlEscape(String(value)) +
    `</${safeKey}>`
  );
}

/**
 * Best-effort singularization.
 */
function singularize(key: string): string {
  if (key.endsWith("ies")) {
    return key.slice(0, -3) + "y";
  }

  if (key.endsWith("ses")) {
    return key.slice(0, -2);
  }

  if (
    key.endsWith("s") &&
    !key.endsWith("ss")
  ) {
    return key.slice(0, -1);
  }

  return key;
}

/**
 * Convert an object into a complete XML document.
 */
export function toXml(
  rootName: string,
  data: Record<string, unknown>,
): string {
  const safeRoot = safeXmlTagName(rootName);

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<${safeRoot}>` +
    serializeObject(data) +
    `</${safeRoot}>`
  );
}

export type ResponseFormat = "json" | "xml";

/**
 * Detect requested response format.
 *
 * Supported:
 * ?format=json
 * ?format=xml
 *
 * Or:
 * Accept: application/json
 * Accept: application/xml
 */
export function detectFormat(
  req: Request,
): ResponseFormat {
  const url = new URL(req.url);

  const formatParam =
    url.searchParams.get("format")?.toLowerCase();

  if (formatParam === "xml") {
    return "xml";
  }

  if (formatParam === "json") {
    return "json";
  }

  const accept =
    req.headers.get("Accept") || "";

  if (
    accept.includes("application/xml") ||
    accept.includes("text/xml")
  ) {
    return "xml";
  }

  return "json";
}

/**
 * Build a response in JSON or XML.
 *
 * JSON:
 * {
 *   "data": [...],
 *   "pagination": {...}
 * }
 *
 * XML:
 * <laws>
 *   <law>...</law>
 *   <law>...</law>
 *   <pagination>...</pagination>
 * </laws>
 */
export function formatResponse(
  req: Request,
  rootName: string,
  body: Record<string, unknown>,
  status = 200,
): Response {
  const format = detectFormat(req);

  // ---------------------------------------------------------
  // JSON RESPONSE
  // ---------------------------------------------------------

  if (format === "json") {
    const headers = new Headers(
      corsHeaders,
    );

    headers.set(
      "Content-Type",
      "application/json; charset=UTF-8",
    );

    return new Response(
      JSON.stringify(body),
      {
        status,
        headers,
      },
    );
  }

  // ---------------------------------------------------------
  // XML RESPONSE
  // ---------------------------------------------------------

  let xmlBody = "";

  const data = body.data;

  // ---------------------------------------------------------
  // ARRAY RESPONSE
  //
  // Example:
  // {
  //   data: [law1, law2],
  //   pagination: {...}
  // }
  //
  // Becomes:
  //
  // <laws>
  //   <law>...</law>
  //   <law>...</law>
  //   <pagination>...</pagination>
  // </laws>
  // ---------------------------------------------------------

  if (Array.isArray(data)) {
    const safeRoot =
      safeXmlTagName(rootName);

    let itemName = "item";

    if (rootName === "laws") {
      itemName = "law";
    } else if (rootName === "lawyers") {
      itemName = "lawyer";
    } else if (rootName === "consultations") {
      itemName = "consultation";
    }

    const items = data
      .map((item) => {
        if (
          item !== null &&
          typeof item === "object" &&
          !Array.isArray(item)
        ) {
          return (
            `<${itemName}>` +
            serializeObject(
              item as Record<string, unknown>,
            ) +
            `</${itemName}>`
          );
        }

        return (
          `<${itemName}>` +
          serializePrimitive(item) +
          `</${itemName}>`
        );
      })
      .join("");

    const otherFields = Object.entries(body)
      .filter(([key]) => key !== "data")
      .map(([key, value]) =>
        serializeValue(key, value),
      )
      .join("");

    xmlBody =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<${safeRoot}>` +
      items +
      otherFields +
      `</${safeRoot}>`;
  }

  // ---------------------------------------------------------
  // OBJECT RESPONSE
  //
  // Example:
  // {
  //   data: consultation
  // }
  //
  // Becomes:
  //
  // <consultation>
  //   <data>
  //     ...
  //   </data>
  // </consultation>
  // ---------------------------------------------------------

  else {
    xmlBody = toXml(
      rootName,
      body,
    );
  }

  const headers = new Headers(
    corsHeaders,
  );

  headers.set(
    "Content-Type",
    "application/xml; charset=UTF-8",
  );

  return new Response(
    xmlBody,
    {
      status,
      headers,
    },
  );
}

/**
 * Build a JSON error response.
 *
 * Errors intentionally remain JSON
 * so existing clients are not affected.
 */
export function errorResponse(
  message: string,
  status: number,
): Response {
  return new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json; charset=UTF-8",
      },
    },
  );
}