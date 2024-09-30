export const tictactoeHTML = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tic-Tac-Toe</title>
  <script src="https://cdn.tailwindcss.com"></script> <!-- Import Tailwind -->
</head>
<body class="bg-blue-300 flex flex-col justify-center items-center min-h-screen">

  <div id="symbol-selection" class="text-center mb-8">
      <p class="text-2xl font-semibold mb-4">Select X or O to start the game:</p>
      <button id="choose-x" class="bg-blue-500 text-white px-6 py-3 rounded-lg text-xl m-2 hover:bg-blue-600">Play as X</button>
      <button id="choose-o" class="bg-green-500 text-white px-6 py-3 rounded-lg text-xl m-2 hover:bg-green-600">Play as O</button>
  </div>

  <!-- Tic-Tac-Toe board is hidden initially -->
  <div class="flex justify-center items-center">
    <div id="tic-tac-toe-board" style="display: none; " class="grid grid-cols-3 gap-4 w-full max-w-md aspect-square justify-center items-center">
      <!-- Tic-Tac-Toe grid will be generated here -->
    </div>

    </div>
    <button id="restart-button" style="display: none;" class="bg-red-500 text-white px-6 py-3 rounded-lg text-xl mt-8 hover:bg-red-600">
    Restart Game
  </button>


  <!-- Custom modal for displaying winner or draw -->
  <div id="game-modal" class="modal fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center" style="display: none;">
    <div class="modal-content bg-white p-6 rounded-lg text-center">
      <span id="close-modal" class="close text-xl font-bold text-gray-600 hover:text-gray-800 cursor-pointer"></span>
      <p id="modal-message" class="text-2xl font-semibold my-4"></p>
      <button id="close-modal-btn" class="bg-blue-500 text-white px-6 py-3 rounded-lg text-xl hover:bg-blue-600">Close</button>
      
    </div>
  </div>

  <script src="/webcm/tic-tac-toe/static/game.js"></script>
</body>
</html>`;



export const gameJS = `
document.addEventListener("DOMContentLoaded", () => {
    const board = Array(9).fill(null);
    let playerSymbol = null;
    let aiSymbol = null;
    let isPlayerTurn = true;
    let isGameOver = false;

    const grid = document.getElementById('tic-tac-toe-board');
    const restartButton = document.getElementById('restart-button');
    const symbolSelection = document.getElementById('symbol-selection');
    const chooseXButton = document.getElementById('choose-x');
    const chooseOButton = document.getElementById('choose-o');
    const messageDisplay = document.createElement('div'); // For displaying winner or turn info
    document.body.appendChild(messageDisplay);

    // Modal elements
    const modal = document.getElementById('game-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalMessage = document.getElementById('modal-message');
    const closeSpan = document.getElementById('close-modal');

    // Close modal function
    const closeModal = () => {
      modal.style.display = 'none';
    };

    closeModalBtn.addEventListener('click', closeModal);
    closeSpan.addEventListener('click', closeModal);

    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    // Handle Player Selection of Symbol
    chooseXButton.addEventListener('click', () => startGame('X'));
    chooseOButton.addEventListener('click', () => startGame('O'));

    const startGame = async (selectedSymbol) => {
      playerSymbol = selectedSymbol;
      aiSymbol = playerSymbol === 'X' ? 'O' : 'X';
      isPlayerTurn = playerSymbol === 'X'; // Player starts if they are X

      // Hide the symbol selection UI and show the game board and restart button
      symbolSelection.style.display = 'none';
      grid.style.display = 'grid'; // Show the Tic-Tac-Toe board
      restartButton.style.display = 'block'; // Show the restart button

      createGrid();
      updateMessage();

      // If AI is X, trigger AI move immediately
      if (aiSymbol === 'X') {
        const aiMove = await getNextMove(board); // Fetch AI move
        if (aiMove !== null) {
          board[aiMove] = aiSymbol; // AI plays 'X'
          document.querySelector('.cell[data-index="'+aiMove+'"]').textContent = aiSymbol;
          isPlayerTurn = true; // Now it's the player's turn
          updateMessage(); // Update message for player's turn
        }
      }
    };

    const createGrid = () => {
      grid.innerHTML = ''; // Clear the grid
      messageDisplay.textContent = ''; // Clear the message
      board.forEach((_, idx) => {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'bg-gray-300', 'text-5xl', 'flex', 'justify-center', 'items-center', 'cursor-pointer', 'h-full', 'aspect-square');
        cell.dataset.index = idx;
        cell.addEventListener('click', handlePlayerMove);
        grid.appendChild(cell);
      });
    };

    const updateMessage = () => {
      if (!isGameOver) {
        messageDisplay.textContent = isPlayerTurn ? 'Your turn ('+playerSymbol+')' : 'Adversary turn ('+aiSymbol+')';
      }
    };

    const showWinnerModal = (message) => {
      modalMessage.textContent = message;
      modal.style.display = 'block';
    };

    const checkWinner = (player) => {
      for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] === player && board[b] === player && board[c] === player) {
          return true; // Player wins
        }
      }
      return false; // No winner yet
    };

    const checkDraw = () => {
      return board.every(cell => cell !== null); // If all cells are filled, it's a draw
    };

    const handlePlayerMove = async (e) => {
      const idx = e.target.dataset.index;

      if (!isGameOver && isPlayerTurn && board[idx] === null) {
        board[idx] = playerSymbol;  // Player plays their chosen symbol
        e.target.textContent = playerSymbol;

        if (checkWinner(playerSymbol)) {
          isGameOver = true;
          showWinnerModal('Player ' + playerSymbol + ' wins!');
          messageDisplay.textContent = 'Player ' + playerSymbol + ' wins!';
          return;
        } else if (checkDraw()) {
          isGameOver = true;
          showWinnerModal("It's a draw!");
          messageDisplay.textContent = "It's a draw!";
          return;
        }

        isPlayerTurn = false; // Player turn is over

        // Fetch the next move from the Cloudflare Worker (AI)
        const move = await getNextMove(board);
        if (move !== null) {
          board[move] = aiSymbol; // AI plays its symbol
          document.querySelector('.cell[data-index="'+move+'"]').textContent = aiSymbol;

          if (checkWinner(aiSymbol)) {
            isGameOver = true;
            showWinnerModal('Adversary ' + aiSymbol + ' wins!');
            messageDisplay.textContent = 'Adversary ' + aiSymbol + ' wins!';
            return;
          } else if (checkDraw()) {
            isGameOver = true;
            showWinnerModal("It's a draw!");
            messageDisplay.textContent = "It's a draw!";
            return;
          }
        }

        isPlayerTurn = true; // Player's turn again
        updateMessage();
      }
    };

    const fetchNextMove = async (board) => {
      try {
        const workerUrl = 'http://127.0.0.1:8787/'; // Replace with your Worker URL
        const response = await fetch(workerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ board, player: aiSymbol }),
        });

        const data = await response.json();
        return data.move;
      } catch (error) {
        console.error('Error fetching next move from Cloudflare Worker:', error);
        return null;
      }
    };

    async function getNextMove(board) {
        try {
          const response = await fetch('/webcm/tic-tac-toe/move', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ board, player: aiSymbol }),
          });
      
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
      
          const data = await response.json();
          return data.move;
        } catch (error) {
          console.error('Error fetching the Adversary move:', error);
          return null;
        }
      }

    restartButton.addEventListener('click', () => {
      board.fill(null);
      isGameOver = false;
      isPlayerTurn = true;
      symbolSelection.style.display = 'block'; // Show the selection UI again
      grid.style.display = 'none'; // Hide the game board
      restartButton.style.display = 'none'; // Hide the restart button
      createGrid(); // Reset the grid
    });

    createGrid(); // Initialize the game board
});
`;




export const styleCSS = `
#tic-tac-toe-board {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  grid-template-rows: repeat(3, 100px);
  gap: 5px;
}

.cell {
  width: 100px;
  height: 100px;
  background-color: lightgray;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
}

#message {
  font-size: 1.5rem;
  margin-top: 20px;
  text-align: center;
}

#symbol-selection {
  text-align: center;
  margin-bottom: 20px;
}

/* Modal styles */
.modal {
  display: none;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 300px;
  text-align: center;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

#close-modal-btn {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

#close-modal-btn:hover {
  background-color: #0056b3;
}
`;

