export interface PaymentPortalProps {
  type: "url" | "appIntent";
  value: string;
  metadata?: Record<string, unknown>;
}

export class PaymentPortal {
  private readonly props: PaymentPortalProps;

  constructor(props: PaymentPortalProps) {
    this.validate(props);
    this.props = props;
  }

  static fromUrl(url: string): PaymentPortal {
    return new PaymentPortal({
      type: "url",
      value: url,
    });
  }

  private validate(props: PaymentPortalProps) {
    if (props.type === "url" && props.value) {
      try {
        new URL(props.value);
      } catch {
        throw new Error("Invalid payment portal URL");
      }
    }
  }

  get type() {
    return this.props.type;
  }

  get value() {
    return this.props.value;
  }

  get metadata() {
    return this.props.metadata;
  }

  getNavigationTarget(): string {
    return this.props.value;
  }
}
