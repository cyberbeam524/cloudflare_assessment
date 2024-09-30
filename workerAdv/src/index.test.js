const { unstable_dev } = require("wrangler");

describe("Worker", () => {
	let worker;

	beforeAll(async () => {
		worker = await unstable_dev("src/index.js", {
			experimental: { disableExperimentalWarning: true },
		});
	});

	afterAll(async () => {
		await worker.stop();
	});

	// Test for valid POST request with a valid board state
	it("should return a valid move when provided a valid board", async () => {
		const validBoard = {
			board: ["X", "O", "X", null, "O", null, null, null, "X"]
		};

		const resp = await worker.fetch("/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(validBoard),
		});

		expect(resp.status).toBe(200);
		const json = await resp.json();
		expect(json).toHaveProperty("move");
		expect(json.move).toBeGreaterThanOrEqual(0);
		expect(json.move).toBeLessThanOrEqual(8);
	});

	// Test for invalid board
	it("should return 400 for an invalid board", async () => {
		const invalidBoard = {
			board: ["X", "O", "INVALID", null, "O", null, null, null, "X"]
		};

		const resp = await worker.fetch("/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(invalidBoard),
		});

		expect(resp.status).toBe(400);
		const text = await resp.text();
		expect(text).toBe("Invalid board");
	});

	// Test for unsupported method (GET instead of POST)
	it("should return 405 for unsupported methods", async () => {
		const resp = await worker.fetch("/", {
			method: "GET",
		});

		expect(resp.status).toBe(405);
		const text = await resp.text();
		expect(text).toBe("Method not allowed");
	});
});