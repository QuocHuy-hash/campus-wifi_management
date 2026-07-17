const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const BASE_URL = process.env.CAPTIVE_TEST_BASE_URL || "http://127.0.0.1:3100";
const APPLE_URL = "https://captive.apple.com/hotspot-detect.html";
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL1WQAAAABJRU5ErkJggg==",
  "base64",
);

function deferred() {
  let resolve;
  const promise = new Promise((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

async function createAuthenticatedContext(browser) {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    localStorage.setItem("accessToken", "e2e-access-token");
    localStorage.setItem("portalLoggedIn", "true");
  });

  const response = await context.request.post(`${BASE_URL}/api/auth/session`, {
    data: { accessToken: "e2e-access-token" },
  });
  assert.equal(response.ok(), true, "test session cookie should be created");

  return context;
}

async function testDirectVisitDoesNotRegister(browser) {
  const context = await browser.newContext();
  let authorizeCalls = 0;
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem(
      "portalCaptiveContext",
      JSON.stringify({
        version: 1,
        flowId: "stale-flow",
        entryMode: "browser",
        id: "AA:BB:CC:DD:EE:FF",
        ap: "11:22:33:44:55:66",
        ssid: "HCMUS",
        url: "https://example.com/stale",
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
      }),
    );
  });
  await page.route("**/users/authorize-device", async (route) => {
    authorizeCalls += 1;
    await route.fulfill({ status: 200, body: "{}" });
  });

  await page.goto(`${BASE_URL}/login`);
  await page.waitForTimeout(500);

  assert.equal(authorizeCalls, 0, "direct login must not register a device");
  assert.equal(
    await page.evaluate(() => localStorage.getItem("portalCaptiveContext")),
    null,
    "direct login should clear stale captive registration context",
  );

  await context.close();
}

async function testRegisterFailureStopsFlow(browser) {
  const context = await createAuthenticatedContext(browser);
  const page = await context.newPage();
  let authorizeCalls = 0;

  await page.route("**/users/authorize-device", async (route) => {
    authorizeCalls += 1;
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "register failed" }),
    });
  });

  const destination = encodeURIComponent("https://example.com/failure-target");
  await page.goto(
    `${BASE_URL}/guest/AA:BB:CC:DD:EE:01?id=AA:BB:CC:DD:EE:01&ap=11:22:33:44:55:66&ssid=HCMUS&entry=browser&url=${destination}`,
  );

  await page.getByText("Đăng ký thiết bị thất bại. Vui lòng thử lại.").waitFor();
  assert.equal(authorizeCalls, 1, "register should be attempted exactly once");
  assert.match(page.url(), /\/login\?/);
  assert.notEqual(
    await page.evaluate(() => localStorage.getItem("portalCaptiveContext")),
    null,
    "registration context must remain available for retry",
  );
  assert.equal(
    await page.evaluate(() => localStorage.getItem("captiveCompletionContext")),
    null,
    "failure must not create completion context",
  );

  await context.close();
}

async function testBrowserFlowRedirectsToDestination(browser) {
  const context = await createAuthenticatedContext(browser);
  const page = await context.newPage();
  const probeGate = deferred();
  const destinationUrl = "https://example.com/wifi-destination?source=hcmus";
  let authorizeCalls = 0;

  await page.route("**/users/authorize-device", async (route) => {
    authorizeCalls += 1;
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await page.route("https://www.google.com/favicon.ico*", async (route) => {
    await probeGate.promise;
    await route.fulfill({ status: 200, contentType: "image/png", body: TRANSPARENT_PNG });
  });
  await page.route("https://example.com/wifi-destination*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>browser destination reached</body></html>",
    });
  });

  await page.goto(
    `${BASE_URL}/guest/AA:BB:CC:DD:EE:02?id=AA:BB:CC:DD:EE:02&ap=11:22:33:44:55:66&ssid=HCMUS&entry=browser&url=${encodeURIComponent(destinationUrl)}`,
  );
  await page.waitForURL(`${BASE_URL}/network-connecting`);

  const storedState = await page.evaluate(() => ({
    registration: localStorage.getItem("portalCaptiveContext"),
    completion: JSON.parse(localStorage.getItem("captiveCompletionContext") || "null"),
  }));
  assert.equal(storedState.registration, null);
  assert.equal(storedState.completion.entryMode, "browser");
  assert.equal(storedState.completion.destinationUrl, destinationUrl);
  assert.equal(authorizeCalls, 1);

  probeGate.resolve();
  await page.waitForURL(destinationUrl);
  await page.getByText("browser destination reached").waitFor();

  await context.close();
}

async function testCnaFlowUsesAppleEndpoint(browser) {
  const context = await createAuthenticatedContext(browser);
  const page = await context.newPage();
  const probeGate = deferred();
  let authorizeCalls = 0;

  await page.route("**/users/authorize-device", async (route) => {
    authorizeCalls += 1;
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await page.route(`${APPLE_URL}*`, async (route) => {
    if (route.request().resourceType() === "fetch") {
      await probeGate.promise;
      await route.fulfill({ status: 200, body: "Success" });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>Success</body></html>",
    });
  });

  await page.goto(
    `${BASE_URL}/guest/AA:BB:CC:DD:EE:03?id=AA:BB:CC:DD:EE:03&ap=11:22:33:44:55:66&ssid=HCMUS&url=${encodeURIComponent(APPLE_URL)}`,
  );
  await page.waitForURL(`${BASE_URL}/network-connecting`);

  const completion = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("captiveCompletionContext") || "null"),
  );
  assert.equal(completion.entryMode, "cna");
  assert.equal(completion.destinationUrl, null);
  assert.equal(authorizeCalls, 1);

  probeGate.resolve();
  await page.waitForURL(`${APPLE_URL}*`);
  await page.getByText("Success").waitFor();

  await context.close();
}

async function main() {
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });

  try {
    await testDirectVisitDoesNotRegister(browser);
    await testRegisterFailureStopsFlow(browser);
    await testBrowserFlowRedirectsToDestination(browser);
    await testCnaFlowUsesAppleEndpoint(browser);
    console.log("Captive flow E2E: 4/4 passed");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
