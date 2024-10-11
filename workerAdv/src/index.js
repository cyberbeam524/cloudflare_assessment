/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
// import { env } from '@cloudflare/workers-types'; // Make sure to use this for KV

// Custom mock KV store for local testing
class MockKVStore {
	constructor() {
	  this.store = new Map(); // Use Map to store key-value pairs
	}
  
	async put(key, value) {
	  console.log(`MockKVStore: storing key=${key}, value=${value}`);
	  this.store.set(key, value);
	}
  
	async get(key) {
	  if (this.store.has(key)) {
		console.log(`MockKVStore: found value for key=${key}`);
		return this.store.get(key);
	  } else {
		console.log(`MockKVStore: no value found for key=${key}`);
		return null; // Simulate KV behavior if the key is not found
	  }
	}
  
	async delete(key) {
	  console.log(`MockKVStore: deleting key=${key}`);
	  this.store.delete(key);
	}
  }
  
  const mockKVStore = new MockKVStore();  // Instantiate mock KV store



export default {
	async fetch(request, env) {

		console.log('Incoming request:', request.method, request.url);

		if (!env.tictactoe) {
			console.log('KV Namespace not available');
		  }else{
			console.log('tictactoe AVAILABLE');
		  }

		const kvStore = env.tictactoe || mockKVStore;


	  if (request.method === 'OPTIONS') {
		// Handle CORS preflight requests
		return handleOptions(request);
	  }
  
	  if (request.method === 'POST') {
		const { board, player } = await request.json();

		const cacheKey = `board_${board.join('')}_player_${player}`;

		// Try to fetch from KV Store
		const cachedResponse = await kvStore.get(cacheKey);
		if (cachedResponse) {
			console.log('Cache hit:', cacheKey);
			// Parse the cached value (assuming it's stored as JSON string)
			return new Response(cachedResponse, {
				headers: { 'Content-Type': 'application/json' },
			});
		}else{
				console.log('Cache miss:', cacheKey);
			}
	

		// Process as if for the first time
		// Validate the board
		if (!isValidBoard(board)) {
			console.error('Invalid board:', board);
		  	return new Response('Invalid board', { status: 400, headers: corsHeaders });
		}
		console.log('Valid board received. Player:', player);
  
		// Get the next smart move using Minimax or random logic
		// const nextMove = getRandomMove(board);
		const nextMove = findBestMove(board, player);
		console.log('Next move calculated:', nextMove);

		// Create the response
		const response = new Response(JSON.stringify({ move: nextMove }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		  });

		// Cache the response in KV Store
		await kvStore.put(cacheKey, JSON.stringify({ move: nextMove }));
		// console.log(kvStore);
  
		// Return the move as a JSON response with CORS headers
		return response;
	  } else {
		console.warn('Invalid method received:', request.method);
		return new Response('Method not allowed', {
		  status: 405,
		  headers: corsHeaders,
		});
	  }
	},
  };
  
  // CORS headers to allow cross-origin requests
  const corsHeaders = {
	'Access-Control-Allow-Origin': '*', // Allow any origin
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Allow these methods
	'Access-Control-Allow-Headers': 'Content-Type', // Allow these headers
  };
  
  // Handle OPTIONS preflight requests
  function handleOptions(request) {
	if (request.headers.get('Origin') !== null &&
		request.headers.get('Access-Control-Request-Method') !== null &&
		request.headers.get('Access-Control-Request-Headers') !== null) {
	  // Handle CORS preflight request
	  console.log('Handling CORS preflight');
	  return new Response(null, {
		headers: {
		  ...corsHeaders,
		  'Access-Control-Max-Age': '86400', // Cache preflight response for 1 day
		},
	  });
	} else {
	  // Handle standard OPTIONS request
	  return new Response(null, {
		headers: {
		  'Allow': 'GET, POST, OPTIONS',
		},
	  });
	}
  }
  

  
  // Function to validate the board
  function isValidBoard(board) {
	if (!Array.isArray(board) || board.length !== 9) return false;
	for (const cell of board) {
	  if (cell !== 'X' && cell !== 'O' && cell !== null) {
		console.error('Invalid cell value:', cell);
		return false;
	  }
	}
	return true;
  }
  
  // Function to evaluate the board and find the best move
  function findBestMove(board, player) {
	console.log('Evaluating best move for player:', player);
	let bestVal = -Infinity;
	let bestMove = -1;
  
	for (let i = 0; i < board.length; i++) {
	  if (board[i] === null) {
		board[i] = player; // Make the move
		let moveVal = minimax(board, 0, false, player); // Evaluate the move
		board[i] = null; // Undo the move
  
		if (moveVal > bestVal) {
		  bestMove = i;
		  bestVal = moveVal;
		}
	  }
	}
	console.log('Best move found:', bestMove);
	return bestMove;
  }
  
  // Minimax function to evaluate the board
  function minimax(board, depth, isMaximizing, player) {
	const score = evaluateBoard(board, player);
  
	// Base case: if a terminal state is reached
	if (score === 10 || score === -10) return score;
	if (isMovesLeft(board) === false) return 0;
  
	// If this is the maximizer's move (AI)
	if (isMaximizing) {
	  let best = -Infinity;
	  for (let i = 0; i < board.length; i++) {
		if (board[i] === null) {
		  board[i] = player;
		  best = Math.max(best, minimax(board, depth + 1, !isMaximizing, player));
		  board[i] = null;
		}
	  }
	  return best - depth; // Prioritize earlier victories
	}
  
	// If this is the minimizer's move (opponent)
	else {
	  let best = Infinity;
	  const opponent = player === 'X' ? 'O' : 'X';
	  for (let i = 0; i < board.length; i++) {
		if (board[i] === null) {
		  board[i] = opponent;
		  best = Math.min(best, minimax(board, depth + 1, !isMaximizing, player));
		  board[i] = null;
		}
	  }
	  return best + depth; // Delay losses
	}
  }
  
  // Function to evaluate the current board state
  function evaluateBoard(board, player) {
	const opponent = player === 'X' ? 'O' : 'X';
  
	// Check for winning patterns
	const winningPatterns = [
	  [0, 1, 2],
	  [3, 4, 5],
	  [6, 7, 8],
	  [0, 3, 6],
	  [1, 4, 7],
	  [2, 5, 8],
	  [0, 4, 8],
	  [2, 4, 6],
	];
  
	for (let pattern of winningPatterns) {
	  const [a, b, c] = pattern;
	  if (board[a] === board[b] && board[b] === board[c]) {
		if (board[a] === player) return 10;
		if (board[a] === opponent) return -10;
	  }
	}
  
	return 0; // No winner yet
  }
  
  // Function to check if any moves are left
  function isMovesLeft(board) {
	return board.includes(null);
  }
  



  // Function to get a random available move
  function getRandomMove(board) {
	const availableMoves = board
	  .map((cell, index) => (cell === null ? index : null))
	  .filter(index => index !== null);
  
	if (availableMoves.length === 0) {
	  return null; // No moves left
	}
  
	// Randomly select an available move
	const randomIndex = Math.floor(Math.random() * availableMoves.length);
	return availableMoves[randomIndex];
  }