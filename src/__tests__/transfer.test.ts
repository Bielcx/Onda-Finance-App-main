import { describe, it, expect } from "vitest";
import { createTransferSchema } from "@/pages/Transfer";

const schema = createTransferSchema(12450);

describe("Transfer validation schema", () => {
  it("should reject when amount is 0", () => {
    const result = schema.safeParse({
      recipientName: "João",
      recipientKey: "joao@email.com",
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should reject when amount exceeds balance", () => {
    const result = schema.safeParse({
      recipientName: "João",
      recipientKey: "joao@email.com",
      amount: 99999,
    });
    expect(result.success).toBe(false);
  });

  it("should reject when recipient name is empty", () => {
    const result = schema.safeParse({
      recipientName: "",
      recipientKey: "joao@email.com",
      amount: 100,
    });
    expect(result.success).toBe(false);
  });

  it("should pass with valid data", () => {
    const result = schema.safeParse({
      recipientName: "João Silva",
      recipientKey: "joao@email.com",
      amount: 500,
    });
    expect(result.success).toBe(true);
  });
});
