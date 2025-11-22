let getPaymentSources: any;
let createPaymentSource: any;
let updatePaymentSource: any;
let deletePaymentSource: any;

describe("@fin/sdk/paymentSources", () => {
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    jest.resetModules();
    process.env.API_BASE_URL = "http://test-api.example.com";
    global.fetch = jest.fn();

    ({
      getPaymentSources,
      createPaymentSource,
      updatePaymentSource,
      deletePaymentSource,
    } = await import("./paymentSources"));
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("getPaymentSources returns list when fetch succeeds", async () => {
    const mockSources = [
      { id: "ps1", nickname: "Card 1" },
      { id: "ps2", nickname: "Card 2" },
    ];

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSources,
    });

    const result = await getPaymentSources();

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.example.com/api/paymentSources"
    );
    expect(result).toEqual(mockSources);
  });

  it("getPaymentSources throws when fetch fails", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(getPaymentSources()).rejects.toThrow(
      "Failed to fetch paymentSources"
    );
  });

  it("createPaymentSource POSTs and returns created item", async () => {
    const mockSource = { id: "ps1", nickname: "Bank" };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSource,
    });

    const data = { nickname: "Bank" };
    const result = await createPaymentSource(data);

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.example.com/api/paymentSources",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    expect(result).toEqual(mockSource);
  });

  it("createPaymentSource throws when response is not ok", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(createPaymentSource({})).rejects.toThrow(
      "Failed to create bill"
    );
  });

  it("updatePaymentSource PATCHes and returns updated item", async () => {
    const mockSource = { id: "ps1", nickname: "Updated" };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSource,
    });

    const result = await updatePaymentSource("ps1", { nickname: "Updated" });

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.example.com/api/paymentSources/ps1",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: "Updated" }),
      }
    );

    expect(result).toEqual(mockSource);
  });

  it("updatePaymentSource throws when response is not ok", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(updatePaymentSource("ps1", {})).rejects.toThrow(
      "Failed to update bill"
    );
  });

  it("deletePaymentSource DELETEs and returns DTO", async () => {
    const mockResponse = { success: true };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await deletePaymentSource("ps1");

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.example.com/api/paymentSources/ps1",
      { method: "DELETE" }
    );

    expect(result).toEqual(mockResponse);
  });

  it("deletePaymentSource throws when response is not ok", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(deletePaymentSource("ps1")).rejects.toThrow(
      "Failed to delete bill"
    );
  });
});
