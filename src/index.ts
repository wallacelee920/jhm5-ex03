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
	async fetch(request, env, ctx): Promise<Response> {`
		return new Response('<!DOCTYPE html>
		<html lang="zh-TW">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>井字遊戲 | Cloudflare Workers部署</title>
			<style>
				* {
					box-sizing: border-box;
					margin: 0;
					padding: 0;
					font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
				}
				
				body {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					min-height: 100vh;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					padding: 20px;
					color: #333;
				}
				
				.container {
					background-color: rgba(255, 255, 255, 0.9);
					border-radius: 15px;
					box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
					width: 100%;
					max-width: 500px;
					padding: 30px;
					text-align: center;
				}
				
				h1 {
					color: #4a4a4a;
					margin-bottom: 20px;
					font-size: 2.2rem;
				}
				
				.status {
					font-size: 1.2rem;
					margin: 15px 0;
					padding: 10px;
					border-radius: 8px;
					background-color: #f8f9fa;
					font-weight: 500;
				}
				
				.board {
					display: grid;
					grid-template-columns: repeat(3, 1fr);
					grid-gap: 10px;
					margin: 20px auto;
					max-width: 300px;
				}
				
				.cell {
					width: 100%;
					height: 80px;
					background-color: #f0f0f0;
					border-radius: 8px;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 2.5rem;
					font-weight: bold;
					cursor: pointer;
					transition: all 0.3s ease;
					box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
				}
				
				.cell:hover {
					background-color: #e0e0e0;
					transform: translateY(-2px);
				}
				
				.cell.x {
					color: #ff6b6b;
				}
				
				.cell.o {
					color: #4ecdc4;
				}
				
				.controls {
					margin-top: 20px;
				}
				
				button {
					background-color: #667eea;
					color: white;
					border: none;
					padding: 12px 24px;
					border-radius: 8px;
					cursor: pointer;
					font-size: 1rem;
					font-weight: 600;
					transition: all 0.3s ease;
					margin: 5px;
				}
				
				button:hover {
					background-color: #5a67d8;
					transform: translateY(-2px);
				}
				
				.score-board {
					display: flex;
					justify-content: space-around;
					margin-top: 20px;
					background-color: #f8f9fa;
					padding: 15px;
					border-radius: 8px;
				}
				
				.score {
					text-align: center;
				}
				
				.score-value {
					font-size: 1.8rem;
					font-weight: bold;
					color: #667eea;
				}
				
				.winner {
					background-color: #ffd700;
					animation: pulse 1s infinite;
				}
				
				@keyframes pulse {
					0% { transform: scale(1); }
					50% { transform: scale(1.05); }
					100% { transform: scale(1); }
				}
				
				.footer {
					margin-top: 30px;
					color: white;
					text-align: center;
					font-size: 0.9rem;
				}
				
				.footer a {
					color: #ffd700;
					text-decoration: none;
				}
				
				@media (max-width: 500px) {
					.container {
						padding: 20px;
					}
					
					h1 {
						font-size: 1.8rem;
					}
					
					.cell {
						height: 70px;
						font-size: 2rem;
					}
				}
			</style>
		</head>
		<body>
			<div class="container">
				<h1>井字遊戲 (Tic-Tac-Toe)</h1>
				
				<div class="status" id="status">玩家 X 的回合</div>
				
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
						<div>玩家 X</div>
						<div class="score-value" id="score-x">0</div>
					</div>
					<div class="score">
						<div>平局</div>
						<div class="score-value" id="score-draw">0</div>
					</div>
					<div class="score">
						<div>玩家 O</div>
						<div class="score-value" id="score-o">0</div>
					</div>
				</div>
				
				<div class="controls">
					<button id="restart-btn">重新開始</button>
					<button id="reset-score-btn">重置分數</button>
				</div>
			</div>
			
			<div class="footer">
				<p>部署於 Cloudflare Workers | <a href="https://developers.cloudflare.com/workers/" target="_blank">了解更多</a></p>
			</div>
		
			<script>
				document.addEventListener('DOMContentLoaded', () => {
					// 遊戲狀態變數
					let currentPlayer = 'X';
					let gameBoard = ['', '', '', '', '', '', '', '', ''];
					let gameActive = true;
					let scores = {
						X: 0,
						O: 0,
						draw: 0
					};
					
					// 獲取DOM元素
					const statusDisplay = document.getElementById('status');
					const cells = document.querySelectorAll('.cell');
					const restartBtn = document.getElementById('restart-btn');
					const resetScoreBtn = document.getElementById('reset-score-btn');
					const scoreX = document.getElementById('score-x');
					const scoreO = document.getElementById('score-o');
					const scoreDraw = document.getElementById('score-draw');
					
					// 贏家組合
					const winningConditions = [
						[0, 1, 2], [3, 4, 5], [6, 7, 8], // 橫向
						[0, 3, 6], [1, 4, 7], [2, 5, 8], // 縱向
						[0, 4, 8], [2, 4, 6]             // 對角線
					];
					
					// 處理玩家點擊格子
					function handleCellClick(e) {
						const cell = e.target;
						const cellIndex = parseInt(cell.getAttribute('data-cell-index'));
						
						// 檢查格子是否已被佔用或遊戲已結束
						if (gameBoard[cellIndex] !== '' || !gameActive) {
							return;
						}
						
						// 更新遊戲狀態
						gameBoard[cellIndex] = currentPlayer;
						cell.textContent = currentPlayer;
						cell.classList.add(currentPlayer.toLowerCase());
						
						// 檢查遊戲結果
						checkResult();
					}
					
					// 檢查遊戲結果
					function checkResult() {
						let roundWon = false;
						let winningLine = null;
						
						// 檢查是否有贏家
						for (let i = 0; i < winningConditions.length; i++) {
							const [a, b, c] = winningConditions[i];
							if (gameBoard[a] === '' || gameBoard[b] === '' || gameBoard[c] === '') {
								continue;
							}
							if (gameBoard[a] === gameBoard[b] && gameBoard[b] === gameBoard[c]) {
								roundWon = true;
								winningLine = winningConditions[i];
								break;
							}
						}
						
						// 處理贏家或平局
						if (roundWon) {
							gameActive = false;
							statusDisplay.textContent = '玩家 ${currentPlayer} 獲勝！';
							updateScore(currentPlayer);
							
							// 標記贏家連線
							winningLine.forEach(index => {
								document.querySelector('[data-cell-index="${index}"]').classList.add('winner');
							});
							
							return;
						}
						
						// 檢查平局
						let roundDraw = !gameBoard.includes('');
						if (roundDraw) {
							gameActive = false;
							statusDisplay.textContent = '平局！';
							updateScore('draw');
							return;
						}
						
						// 切換玩家
						currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
						statusDisplay.textContent = `玩家 ${currentPlayer} 的回合`;
					}
					
					// 更新分數
					function updateScore(winner) {
						if (winner === 'draw') {
							scores.draw++;
							scoreDraw.textContent = scores.draw;
						} else {
							scores[winner]++;
							if (winner === 'X') {
								scoreX.textContent = scores.X;
							} else {
								scoreO.textContent = scores.O;
							}
						}
					}
					
					// 重新開始遊戲
					function restartGame() {
						currentPlayer = 'X';
						gameBoard = ['', '', '', '', '', '', '', '', ''];
						gameActive = true;
						statusDisplay.textContent = `玩家 ${currentPlayer} 的回合`;
						
						cells.forEach(cell => {
							cell.textContent = '';
							cell.classList.remove('x', 'o', 'winner');
						});
					}
					
					// 重置分數
					function resetScore() {
						scores.X = 0;
						scores.O = 0;
						scores.draw = 0;
						scoreX.textContent = '0';
						scoreO.textContent = '0';
						scoreDraw.textContent = '0';
						restartGame();
					}
					
					// 添加事件監聽器
					cells.forEach(cell => {
						cell.addEventListener('click', handleCellClick);
					});
					
					restartBtn.addEventListener('click', restartGame);
					resetScoreBtn.addEventListener('click', resetScore);
					
					// 初始化遊戲
					restartGame();
				});
			</script>
		</body>
		</html>);
	`},
} satisfies ExportedHandler<Env>;
