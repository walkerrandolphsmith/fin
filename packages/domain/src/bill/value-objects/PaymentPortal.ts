/**
 * Properties describing a payment portal. A portal can be a URL or an
 * application intent and may include optional metadata consumed by clients.
 *
 * @typedef {Object} PaymentPortalProps
 * @property {"url" | "appIntent"} type - The kind of portal value.
 * @property {string} value - The portal value (URL or intent string).
 * @property {Record<string, unknown>} [metadata] - Optional metadata.
 */
export interface PaymentPortalProps {
  type: "url" | "appIntent";
  value: string;
  metadata?: Record<string, unknown>;
}

/**
 * Value object representing a payment portal associated with a bill.
 *
 * Responsibilities:
 * - Validate portal values (e.g. ensure well-formed URLs for `type === 'url'`).
 * - Provide accessors for portal data and a helper to obtain a navigation
 *   target string that clients can use to open the portal.
 */
export class PaymentPortal {
  private readonly props: PaymentPortalProps;

  /**
   * Create a PaymentPortal value object and validate the provided properties.
   *
   * @param {PaymentPortalProps} props - Properties that define the portal.
   * @throws {Error} When validation fails (for example an invalid URL).
   */
  constructor(props: PaymentPortalProps) {
    this.validate(props);
    this.props = props;
  }

  /**
   * Factory helper to create a PaymentPortal from a raw URL string.
   *
   * @param {string} url - URL of the payment portal.
   * @returns {PaymentPortal} New PaymentPortal instance wrapping the URL.
   * @example
   * const portal = PaymentPortal.fromUrl('https://pay.example.com');
   */
  static fromUrl(url: string): PaymentPortal {
    return new PaymentPortal({
      type: "url",
      value: url,
    });
  }

  /**
   * Validate incoming props. Ensures that when `type` is `url` the value is a
   * parseable URL. Throws an Error on invalid input.
   *
   * @private
   * @param {PaymentPortalProps} props - Properties to validate.
   */
  private validate(props: PaymentPortalProps) {
    if (props.type === "url" && props.value) {
      try {
        new URL(props.value);
      } catch {
        throw new Error("Invalid payment portal URL");
      }
    }
  }

  /**
   * The portal type ("url" or "appIntent").
   * @returns {"url" | "appIntent"}
   */
  get type() {
    return this.props.type;
  }

  /**
   * The portal value string (URL or intent string).
   * @returns {string}
   */
  get value() {
    return this.props.value;
  }

  /**
   * Optional metadata associated with the portal.
   * @returns {Record<string, unknown> | undefined}
   */
  get metadata() {
    return this.props.metadata;
  }

  /**
   * Return a navigation target string that clients can use to open the
   * payment portal. For `type === 'url'` this is the raw URL value. For other
   * types it returns the stored value and clients should interpret it
   * according to the type.
   *
   * @returns {string} Navigation target (URL or platform-specific intent).
   */
  getNavigationTarget(): string {
    return this.props.value;
  }
}
