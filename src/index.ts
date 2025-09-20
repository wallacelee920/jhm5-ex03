/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const newLocal = `
		<!DOCTYPE html>
		<html lang="zh-TW">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>井字遊戲 (單人模式)</title>
			<style>
				* {
					box-sizing: border-box;
					margin: 0;
					padding: 0;
					font-family: 'Arial Rounded MT Bold', 'Arial', sans-serif;
				}
				
				body {
					background: linear-gradient(135deg, #6e8efb, #a777e3);
					min-height: 100vh;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					padding: 20px;
				}
				
				.container {
					background-color: rgba(255, 255, 255, 0.9);
					border-radius: 20px;
					box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
					padding: 30px;
					text-align: center;
					max-width: 500px;
					width: 100%;
				}
				
				h1 {
					color: #333;
					margin-bottom: 20px;
					font-size: 2.5rem;
					text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
				}
				
				.status {
					font-size: 1.2rem;
					margin: 15px 0;
					padding: 10px;
					border-radius: 10px;
					background-color: #f8f9fa;
					color: #333;
					font-weight: bold;
				}
				
				.board {
					display: grid;
					grid-template-columns: repeat(3, 1fr);
					grid-gap: 10px;
					margin: 20px auto;
					max-width: 300px;
				}
				
				.cell {
					background-color: #fff;
					border-radius: 10px;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
					cursor: pointer;
					aspect-ratio: 1;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 2.5rem;
					font-weight: bold;
					transition: all 0.2s ease;
				}
				
				.cell.x {
					color: #ff6b6b;
				}
				
				.cell.o {
					color: #48dbfb;
				}
				
				.cell:hover {
					background-color: #f1f3f5;
					transform: translateY(-3px);
				}
				
				.cell.win {
					background-color: #fff9c4;
					animation: pulse 1s infinite;
				}
				
				@keyframes pulse {
					0% { transform: scale(1); }
					50% { transform: scale(1.05); }
					100% { transform: scale(1); }
				}
				
				.controls {
					margin-top: 20px;
				}
				
				button {
					background: linear-gradient(to right, #6e8efb, #a777e3);
					border: none;
					border-radius: 50px;
					color: white;
					cursor: pointer;
					font-size: 1.1rem;
					font-weight: bold;
					padding: 12px 25px;
					margin: 10px;
					transition: all 0.3s ease;
					box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
				}
				
				button:hover {
					transform: translateY(-3px);
					box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
				}
				
				button:active {
					transform: translateY(0);
				}
				
				.score-board {
					display: flex;
					justify-content: space-around;
					margin-top: 20px;
					background-color: #f8f9fa;
					border-radius: 10px;
					padding: 15px;
				}
				
				.score {
					text-align: center;
				}
				
				.score-value {
					font-size: 1.8rem;
					font-weight: bold;
					color: #333;
				}
				
				.score-label {
					font-size: 1rem;
					color: #666;
				}
				
				@media (max-width: 480px) {
					.container {
						padding: 20px;
					}
					
					h1 {
						font-size: 2rem;
					}
					
					.cell {
						font-size: 2rem;
					}
				}
			</style>
		</head>
		<body>
			<div class="container">
				<h1>井字遊戲</h1>
				
				<div class="status" id="status">輪到你下了 (X)</div>
				
				<div class="board" id="board">
					<div class="cell" data-cell-index="0"></div>
					<div class="cell" data-cell-index="1"></div>
					<div class="cell" data-cell-index="2"></div>
					<div class="cell" data-cell-index="3"></div>
					<div class="cell" data-cell-index="4"></div>
					<div class="cell" data-cell-index="5"></div>
					<div class="cell" data-cell-index="6"></div>
					<div class="cell" data-cell-index="7"></div>
					<div class="cell" data-cell-index="8"></div>
				</div>
				
				<div class="score-board">
					<div class="score">
						<div class="score-label">玩家 (X)</div>
						<div class="score-value" id="player-score">0</div>
					</div>
					<div class="score">
						<div class="score-label">平局</div>
						<div class="score-value" id="draw-score">0</div>
					</div>
					<div class="score">
						<div class="score-label">電腦 (O)</div>
						<div class="score-value" id="ai-score">0</div>
					</div>
				</div>
				
				<div class="controls">
					<button id="restart-btn">重新開始</button>
				</div>
			</div>
		
			<script>
				document.addEventListener('DOMContentLoaded', () => {
					// 遊戲狀態變數
					let board = ['', '', '', '', '', '', '', '', ''];
					let currentPlayer = 'X';
					let gameActive = true;
					let scores = { player: 0, ai: 0, draw: 0 };
					
					// 獲取DOM元素
					const statusDisplay = document.getElementById('status');
					const cells = document.querySelectorAll('.cell');
					const restartButton = document.getElementById('restart-btn');
					const playerScoreDisplay = document.getElementById('player-score');
					const aiScoreDisplay = document.getElementById('ai-score');
					const drawScoreDisplay = document.getElementById('draw-score');
					
					// 贏得遊戲的組合
					const winningConditions = [
						[0, 1, 2], [3, 4, 5], [6, 7, 8], // 橫向
						[0, 3, 6], [1, 4, 7], [2, 5, 8], // 縱向
						[0, 4, 8], [2, 4, 6]             // 對角線
					];
					
					// 初始化遊戲
					statusDisplay.innerHTML = currentPlayerTurn();
					
					// 處理點擊格子事件
					function handleCellClick(clickedCellEvent) {
						const clickedCell = clickedCellEvent.target;
						const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
						
						// 檢查格子是否已被佔用或遊戲是否已結束
						if (board[clickedCellIndex] !== '' || !gameActive) {
							return;
						}
						
						// 處理玩家移動
						handlePlayerMove(clickedCellIndex);
						
						// 檢查結果
						checkResult();
						
						// 如果是AI的回合且遊戲仍在進行中
						if (currentPlayer === 'O' && gameActive) {
							statusDisplay.innerHTML = aiThinking();
							
							// 添加一點延遲，讓AI的移動看起來更自然
							setTimeout(() => {
								handleAIMove();
								checkResult();
							}, 800);
						}
					}
					
					// 處理玩家移動
					function handlePlayerMove(cellIndex) {
						board[cellIndex] = currentPlayer;
						cells[cellIndex].innerHTML = currentPlayer;
						cells[cellIndex].classList.add(currentPlayer.toLowerCase());
					}
					
					// 處理AI移動
					function handleAIMove() {
						// 簡單的AI：隨機選擇一個空格
						let availableCells = [];
						for (let i = 0; i < board.length; i++) {
							if (board[i] === '') {
								availableCells.push(i);
							}
						}
						
						if (availableCells.length > 0) {
							const randomIndex = Math.floor(Math.random() * availableCells.length);
							const aiChoice = availableCells[randomIndex];
							
							board[aiChoice] = currentPlayer;
							cells[aiChoice].innerHTML = currentPlayer;
							cells[aiChoice].classList.add(currentPlayer.toLowerCase());
						}
					}
					
					// 檢查遊戲結果
					function checkResult() {
						let roundWon = false;
						let winningLine = null;
						
						// 檢查是否有人贏了
						for (let i = 0; i < winningConditions.length; i++) {
							const [a, b, c] = winningConditions[i];
							if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
								roundWon = true;
								winningLine = winningConditions[i];
								break;
							}
						}
						
						if (roundWon) {
							// 有人贏了
							gameActive = false;
							
							// 標記贏家的格子
							winningLine.forEach(index => {
								cells[index].classList.add('win');
							});
							
							if (currentPlayer === 'X') {
								statusDisplay.innerHTML = winMessage();
								scores.player++;
								playerScoreDisplay.textContent = scores.player;
							} else {
								statusDisplay.innerHTML = '電腦贏了！';
								scores.ai++;
								aiScoreDisplay.textContent = scores.ai;
							}
							
							return;
						}
						
						// 檢查是否平局
						let roundDraw = !board.includes('');
						if (roundDraw) {
							gameActive = false;
							statusDisplay.innerHTML = drawMessage();
							scores.draw++;
							drawScoreDisplay.textContent = scores.draw;
							return;
						}
						
						// 切換玩家
						currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
						statusDisplay.innerHTML = currentPlayerTurn();
					}
					
					// 重新開始遊戲
					function restartGame() {
						board = ['', '', '', '', '', '', '', '', ''];
						gameActive = true;
						currentPlayer = 'X';
						statusDisplay.innerHTML = currentPlayerTurn();
						
						cells.forEach(cell => {
							cell.innerHTML = '';
							cell.classList.remove('x', 'o', 'win');
						});
					}
					
					// 添加事件監聽器
					cells.forEach(cell => cell.addEventListener('click', handleCellClick));
					restartButton.addEventListener('click', restartGame);
				});
			</script>
		</body>
		</html>`)
	},
} satisfies ExportedHandler<Env>;
