/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request) {
	  if (request.method === 'OPTIONS') {
		// Handle CORS preflight requests
		return handleOptions(request);
	  }
  
	  if (request.method === 'POST') {
		const { board, player } = await request.json();
  
		// Validate the board
		if (!isValidBoard(board)) {
		  return new Response('Invalid board', { status: 400, headers: corsHeaders });
		}
  
		// Get the next smart move using Minimax or random logic
		// const nextMove = getRandomMove(board);
		const nextMove = findBestMove(board, player);
  
		// Return the move as a JSON response with CORS headers
		return new Response(JSON.stringify({ move: nextMove }), {
		  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	  } else {
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
		return false;
	  }
	}
	return true;
  }
  
  // Function to evaluate the board and find the best move
  function findBestMove(board, player) {
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