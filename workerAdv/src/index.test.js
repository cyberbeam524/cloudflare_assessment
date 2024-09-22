// const { unstable_dev } = require("wrangler");

// describe("Worker", () => {
// 	let worker;

// 	beforeAll(async () => {
// 		worker = await unstable_dev("src/index.js", {
// 			experimental: { disableExperimentalWarning: true },
// 		});
// 	});

// 	afterAll(async () => {
// 		await worker.stop();
// 	});

// 	it("should return Hello World", async () => {
// 		const resp = await worker.fetch();
// 		if (resp) {
// 			const text = await resp.text();
// 			expect(text).toMatchInlineSnapshot(`"Hello World!"`);
// 		}
// 	});
// });
// ------------------------------------------------------------------------------------------


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



// --------------------------------------------------------------------------

// const { unstable_dev } = require("wrangler");

// describe("Smart Tic-Tac-Toe Worker", () => {
// 	let worker;

// 	beforeAll(async () => {
// 		worker = await unstable_dev("src/index.js", {
// 			experimental: { disableExperimentalWarning: true },
// 		});
// 	});

// 	afterAll(async () => {
// 		await worker.stop();
// 	});

// 	// Test for AI choosing a winning move
// 	it("should return the winning move", async () => {
// 		const winningBoard = {
// 			board: ["X", "O", "X", "O", "X", null, null, "O", null],
// 			player: "X"
// 		};

// 		const resp = await worker.fetch("/", {
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 			body: JSON.stringify(winningBoard),
// 		});

// 		expect(resp.status).toBe(200);
// 		const json = await resp.json();
// 		expect(json).toHaveProperty("move");
// 		// AI should take position 5 to win
// 		expect(json.move).toBe(5);
// 	});

// 	// Test for AI blocking opponent's winning move
// 	it("should block the opponent's winning move", async () => {
// 		const defensiveBoard = {
// 			board: ["X", "O", "X", "O", "X", null, null, null, "O"],
// 			player: "O"
// 		};

// 		const resp = await worker.fetch("/", {
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 			body: JSON.stringify(defensiveBoard),
// 		});

// 		expect(resp.status).toBe(200);
// 		const json = await resp.json();
// 		expect(json).toHaveProperty("move");
// 		// AI should block at position 5 to stop X from winning
// 		expect(json.move).toBe(5);
// 	});

// 	// Test for AI making the optimal first move in an empty board
// 	it("should make the first move optimally", async () => {
// 		const emptyBoard = {
// 			board: [null, null, null, null, null, null, null, null, null],
// 			player: "X"
// 		};

// 		const resp = await worker.fetch("/", {
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 			body: JSON.stringify(emptyBoard),
// 		});

// 		expect(resp.status).toBe(200);
// 		const json = await resp.json();
// 		expect(json).toHaveProperty("move");
// 		// Best opening move is usually the center (position 4)
// 		expect(json.move).toBe(4);
// 	});

// 	// Test for tie game (no moves left)
// 	it("should return null when no moves are left", async () => {
// 		const fullBoard = {
// 			board: ["X", "O", "X", "X", "O", "X", "O", "X", "O"],
// 			player: "X"
// 		};

// 		const resp = await worker.fetch("/", {
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 			body: JSON.stringify(fullBoard),
// 		});

// 		expect(resp.status).toBe(200);
// 		const json = await resp.json();
// 		// No moves left, expect null
// 		expect(json.move).toBeNull();
// 	});

// 	// Test for invalid board (too many 'X' or 'O' values)
// 	it("should return 400 for an invalid board", async () => {
// 		const invalidBoard = {
// 			board: ["X", "X", "X", "O", "O", "X", "O", "O", "O"],
// 			player: "X"
// 		};

// 		const resp = await worker.fetch("/", {
// 			method: "POST",
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 			body: JSON.stringify(invalidBoard),
// 		});

// 		expect(resp.status).toBe(400);
// 		const text = await resp.text();
// 		expect(text).toBe("Invalid board");
// 	});

// 	// Test for unsupported method (GET instead of POST)
// 	it("should return 405 for unsupported methods", async () => {
// 		const resp = await worker.fetch("/", {
// 			method: "GET",
// 		});

// 		expect(resp.status).toBe(405);
// 		const text = await resp.text();
// 		expect(text).toBe("Method not allowed");
// 	});
// });
