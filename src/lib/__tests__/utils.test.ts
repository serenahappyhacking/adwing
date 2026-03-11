import { describe, it, expect } from "vitest";
import {
  calculateROAS,
  calculateCTR,
  calculateCPC,
  calculateCPM,
  getHealthScoreColor,
  getHealthScoreLabel,
  formatCurrency,
  formatPercent,
} from "../utils";

describe("calculateROAS", () => {
  it("returns revenue / spend", () => {
    expect(calculateROAS(1000, 250)).toBe(4);
  });

  it("returns 0 when spend is 0 (division by zero)", () => {
    expect(calculateROAS(500, 0)).toBe(0);
  });

  it("handles fractional values", () => {
    expect(calculateROAS(150, 100)).toBe(1.5);
  });
});

describe("calculateCTR", () => {
  it("returns clicks / impressions", () => {
    expect(calculateCTR(50, 1000)).toBe(0.05);
  });

  it("returns 0 when impressions is 0", () => {
    expect(calculateCTR(10, 0)).toBe(0);
  });
});

describe("calculateCPC", () => {
  it("returns spend / clicks", () => {
    expect(calculateCPC(100, 50)).toBe(2);
  });

  it("returns 0 when clicks is 0", () => {
    expect(calculateCPC(100, 0)).toBe(0);
  });
});

describe("calculateCPM", () => {
  it("returns (spend / impressions) * 1000", () => {
    expect(calculateCPM(50, 10000)).toBe(5);
  });

  it("returns 0 when impressions is 0", () => {
    expect(calculateCPM(50, 0)).toBe(0);
  });
});

describe("getHealthScoreColor", () => {
  it("returns green for score >= 80", () => {
    expect(getHealthScoreColor(80)).toBe("text-green-500");
    expect(getHealthScoreColor(100)).toBe("text-green-500");
  });

  it("returns yellow for score 60-79", () => {
    expect(getHealthScoreColor(79)).toBe("text-yellow-500");
    expect(getHealthScoreColor(60)).toBe("text-yellow-500");
  });

  it("returns orange for score 40-59", () => {
    expect(getHealthScoreColor(59)).toBe("text-orange-500");
    expect(getHealthScoreColor(40)).toBe("text-orange-500");
  });

  it("returns red for score < 40", () => {
    expect(getHealthScoreColor(39)).toBe("text-red-500");
    expect(getHealthScoreColor(0)).toBe("text-red-500");
  });
});

describe("getHealthScoreLabel", () => {
  it("returns Excellent for score >= 80", () => {
    expect(getHealthScoreLabel(80)).toBe("Excellent");
    expect(getHealthScoreLabel(100)).toBe("Excellent");
  });

  it("returns Good for score 60-79", () => {
    expect(getHealthScoreLabel(79)).toBe("Good");
    expect(getHealthScoreLabel(60)).toBe("Good");
  });

  it("returns Needs Improvement for score 40-59", () => {
    expect(getHealthScoreLabel(59)).toBe("Needs Improvement");
    expect(getHealthScoreLabel(40)).toBe("Needs Improvement");
  });

  it("returns Critical for score < 40", () => {
    expect(getHealthScoreLabel(39)).toBe("Critical");
    expect(getHealthScoreLabel(0)).toBe("Critical");
  });
});

describe("formatCurrency", () => {
  it("formats USD by default", () => {
    expect(formatCurrency(1234)).toBe("$1,234");
  });

  it("handles decimal amounts", () => {
    expect(formatCurrency(19.99)).toBe("$19.99");
  });
});

describe("formatPercent", () => {
  it("formats decimal as percentage", () => {
    expect(formatPercent(0.05)).toBe("5.0%");
  });

  it("formats 1.0 as 100%", () => {
    expect(formatPercent(1)).toBe("100.0%");
  });
});
