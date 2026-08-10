import { readFileSync } from "fs";
import { resolve } from "path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Emulator-backed security-rules tests. Run with:
//   firebase emulators:exec --only firestore "vitest run"
// The two tests the spec calls out as worth more than the rest of the suite
// combined: cross-tenant queue isolation, and no self-promotion via rules.

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "gplus-rules-test",
    firestore: { rules: readFileSync(resolve(__dirname, "../../firestore.rules"), "utf8") },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    // A moderator in tenant A only.
    await setDoc(doc(db, "memberships/modA_tenantA"), {
      uid: "modA",
      tenantId: "tenantA",
      role: "moderator",
      status: "active",
      districtScope: [],
    });
    // Queue items in each tenant.
    await setDoc(doc(db, "moderationQueue/vidA"), {
      videoId: "vidA",
      tenantId: "tenantA",
      districtId: "durgapur",
      status: "waiting",
    });
    await setDoc(doc(db, "moderationQueue/vidB"), {
      videoId: "vidB",
      tenantId: "tenantB",
      districtId: "patna",
      status: "waiting",
    });
  });
});

describe("tenant isolation", () => {
  it("a moderator at tenant A cannot read tenant B's queue", async () => {
    const db = env.authenticatedContext("modA").firestore();
    await assertFails(getDoc(doc(db, "moderationQueue/vidB")));
  });

  it("a moderator at tenant A can read tenant A's queue", async () => {
    const db = env.authenticatedContext("modA").firestore();
    await assertSucceeds(getDoc(doc(db, "moderationQueue/vidA")));
  });
});

describe("membership writes are function-only", () => {
  it("a user cannot write their own membership (no self-promotion)", async () => {
    const db = env.authenticatedContext("modA").firestore();
    await assertFails(
      setDoc(doc(db, "memberships/modA_tenantA"), {
        uid: "modA",
        tenantId: "tenantA",
        role: "admin",
        status: "active",
        districtScope: [],
      }),
    );
  });
});

describe("verificationRequests are never client-writable", () => {
  it("a user cannot create a verification request directly", async () => {
    const db = env.authenticatedContext("someone").firestore();
    await assertFails(
      setDoc(doc(db, "verificationRequests/req1"), {
        uid: "someone",
        tenantId: "tenantA",
        districtId: "durgapur",
        phoneEncrypted: "x",
        status: "waiting",
      }),
    );
  });
});
