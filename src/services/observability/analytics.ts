import { logger } from "./logger";
import type { AnalyticsEvent, ObservabilityTransport } from "./types";

const MAX_EVENT_BUFFER = 200;
const events: AnalyticsEvent[] = [];
const transports = new Set<ObservabilityTransport>();

const sensitivePropertyPattern =
  /email|name|phone|address|token|secret|password|content|title|description/i;

function sanitizeProperties(
  properties?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!properties) {
    return undefined;
  }

  const sanitized: Record<string, unknown> = {};

  Object.entries(properties).forEach(([key, value]) => {
    if (sensitivePropertyPattern.test(key)) {
      sanitized[key] = "[redacted]";
      return;
    }

    if (
      value == null ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string"
    ) {
      sanitized[key] = value;
      return;
    }

    if (Array.isArray(value)) {
      sanitized[key] = value.length;
      return;
    }

    sanitized[key] = "[object]";
  });

  return sanitized;
}

function remember(event: AnalyticsEvent): void {
  events.push(event);
  if (events.length > MAX_EVENT_BUFFER) {
    events.shift();
  }
}

function sendToTransports(event: AnalyticsEvent): void {
  transports.forEach((transport) => {
    try {
      transport.analytics?.(event);
    } catch (error) {
      logger.warn("[Observability] Analytics transport failed", undefined, error);
    }
  });
}

function track(name: string, properties?: Record<string, unknown>): void {
  const event: AnalyticsEvent = {
    name,
    properties: sanitizeProperties(properties),
  };

  remember(event);
  sendToTransports(event);
  logger.debug("[Observability] Analytics event recorded", { name });
}

export const analytics = {
  track,
  screen: (name: string, properties?: Record<string, unknown>) =>
    track("screen_view", { ...properties, screen: name }),
  identify: (_subjectId?: string, traits?: Record<string, unknown>) =>
    track("identity_context_available", {
      traitKeys: traits ? Object.keys(traits).length : 0,
    }),
  reset: () => track("identity_context_reset"),
  addTransport: (transport: ObservabilityTransport) => {
    transports.add(transport);
    return () => transports.delete(transport);
  },
  getBufferedEvents: () => [...events],
  clearBufferedEvents: () => {
    events.length = 0;
  },
};
