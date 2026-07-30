import { describe, expect, it } from "vitest";
import {
  isCustomerVisibleJob,
  mapLifecycleToCustomer,
} from "../map-ops-to-customer";

describe("mapLifecycleToCustomer (Phase C0 map)", () => {
  it("maps happy-path ops statuses to the 7 customer UI states", () => {
    expect(mapLifecycleToCustomer("awaiting_arrival")).toBe("booked");
    expect(mapLifecycleToCustomer("boxes_received")).toBe("picked_up");
    expect(mapLifecycleToCustomer("in_assembly")).toBe("in_workshop");
    expect(mapLifecycleToCustomer("assembly_completed")).toBe(
      "assembled_inspected"
    );
    expect(mapLifecycleToCustomer("ready_for_delivery")).toBe(
      "assembled_inspected"
    );
    expect(mapLifecycleToCustomer("out_for_delivery")).toBe("out_for_delivery");
    expect(mapLifecycleToCustomer("delivered")).toBe("delivered");
  });

  it("hides pre-book and cancelled from My Jobs projection", () => {
    expect(mapLifecycleToCustomer("draft")).toBeNull();
    expect(mapLifecycleToCustomer("pending_quote")).toBeNull();
    expect(mapLifecycleToCustomer("cancelled_no_payment")).toBeNull();
    expect(isCustomerVisibleJob("draft")).toBe(false);
    expect(isCustomerVisibleJob("awaiting_arrival")).toBe(true);
  });
});
