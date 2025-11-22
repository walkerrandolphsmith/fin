let getBills: any;
let reorderBills: any;
let createBill: any;
let updateBill: any;
let deleteBill: any;

describe("@fin/sdk/bills", () => {
  const originalEnv = { ...process.env };
  beforeEach(async () => {
    jest.resetModules();
    process.env.API_BASE_URL = "http://test-api.example.com";
    global.fetch = jest.fn();
    ({ createBill, deleteBill, getBills, reorderBills, updateBill } =
      await import("./bills"));
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("getBills returns bills when fetch succeeds", async () => {
    const mockBills = [
      { id: "1", amount: 100 },
      { id: "2", amount: 200 },
    ];

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockBills,
    });

    const result = await getBills();

    expect(fetch).toHaveBeenCalledWith(
      `http://test-api.example.com/api/bills`
    );
    expect(result).toEqual(mockBills);
  });

  it("getBills passes the filter in querystring", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await getBills("dueThisWeek");

    expect(fetch).toHaveBeenCalledWith(
      `http://test-api.example.com/api/bills?filter=dueThisWeek`
    );
  });

  it("getBills throws error when fetch is not ok", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    await expect(getBills()).rejects.toThrow("Failed to fetch bills");
  });
  it("createBill sends POST request and returns created bill", async () => {
    const mockBill = { id: "1", amount: 300 };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockBill,
    });

    const data = { amount: 300 };
    const result = await createBill(data);

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.example.com/api/bills",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    expect(result).toEqual(mockBill);
  });

  it("createBill throws when response is not ok", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(createBill({ amount: 300 })).rejects.toThrow(
      "Failed to create bill"
    );
  });

  it("updateBill sends PATCH request and returns updated bill", async () => {
    const mockBill = { id: "1", amount: 400 };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockBill,
    });

    const result = await updateBill("1", { amount: 400 });

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.example.com/api/bills/1",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 400 }),
      }
    );

    expect(result).toEqual(mockBill);
  });

  it("updateBill throws when response is not ok", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(updateBill("1", {})).rejects.toThrow("Failed to update bill");
  });

  it("deleteBill sends DELETE request and returns DTO", async () => {
    const mockResponse = { success: true };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await deleteBill("1");

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.example.com/api/bills/1",
      { method: "DELETE" }
    );

    expect(result).toEqual(mockResponse);
  });

  it("deleteBill throws when response is not ok", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(deleteBill("1")).rejects.toThrow("Failed to delete bill");
  });

  it("reorderBills sends PATCH request and returns response", async () => {
    const mockResponse = { success: true };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const updates = [
      { id: "a", order: 99 }, // original order ignored
      { id: "b", order: 55 },
    ];

    const result = await reorderBills(updates);

    expect(fetch).toHaveBeenCalledWith("/api/bills/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        updates: [
          { id: "a", order: 0 },
          { id: "b", order: 1 },
        ],
      }),
    });

    expect(result).toEqual(mockResponse);
  });

  it("reorderBills throws when response is not ok", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(reorderBills([{ id: "a", order: 0 }])).rejects.toThrow(
      "Failed to delete bill"
    );
  });
});
