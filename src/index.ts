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
		return new Response('export interface Env {
			// 如果使用KV命名空间，可以在这里添加
			// MY_KV_NAMESPACE: KVNamespace;
		  }
		  
		  const HTML_CONTENT = `<!DOCTYPE html>
		  <html lang="zh-TW">
		  <head>
			  <meta charset="UTF-8">
			  <meta name="viewport" content="width=device-width, initial-scale=1.0">
			  <title>井字遊戲 - 单人和双人模式</title>
			  <style>
				  * {
					  box-sizing: border-box;
					  margin: 0;
					  padding: 0;
					  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
				  }
				  
				  body {
					  background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
					  min-height: 100vh;
					  display: flex;
					  flex-direction: column;
					  align-items: center;
					  justify-content: center;
					  padding: 20px;
					  color: #fff;
				  }
				  
				  .container {
					  background: rgba(255, 255, 255, 0.1);
					  backdrop-filter: blur(10px);
					  border-radius: 20px;
					  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
					  padding: 30px;
					  text-align: center;
					  max-width: 500px;
					  width: 100%;
				  }
				  
				  h1 {
					  font-size: 2.5rem;
					  margin-bottom: 20px;
					  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
					  color: #FFD700;
				  }
				  
				  .game-mode {
					  display: flex;
					  justify-content: center;
					  gap: 20px;
					  margin-bottom: 30px;
				  }
				  
				  .mode-btn {
					  background: rgba(255, 255, 255, 0.2);
					  border: none;
					  border-radius: 10px;
					  color: white;
					  cursor: pointer;
					  font-size: 1.2rem;
					  font-weight: bold;
					  padding: 12px 25px;
					  transition: all 0.3s ease;
				  }
				  
				  .mode-btn.active {
					  background: linear-gradient(135deg, #6e8efb, #a777e3);
					  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
				  }
				  
				  .mode-btn:hover {
					  transform: translateY(-3px);
					  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
				  }
				  
				  .status {
					  font-size: 1.5rem;
					  margin: 20px 0;
					  font-weight: bold;
					  min-height: 40px;
					  color: #FFD700;
				  }
				  
				  .board {
					  display: grid;
					  grid-template-columns: repeat(3, 1fr);
					  grid-gap: 10px;
					  margin: 20px auto;
					  max-width: 300px;
				  }
				  
				  .cell {
					  background-color: rgba(255, 255, 255, 0.15);
					  border-radius: 10px;
					  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
					  cursor: pointer;
					  display: flex;
					  align-items: center;
					  justify-content: center;
					  font-size: 3rem;
					  font-weight: bold;
					  height: 100px;
					  width: 100px;
					  transition: all 0.3s ease;
				  }
				  
				  .cell:hover {
					  transform: translateY(-5px);
					  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
					  background-color: rgba(255, 255, 255, 0.25);
				  }
				  
				  .cell.x {
					  color: #FF6B6B;
				  }
				  
				  .cell.o {
					  color: #48DBFB;
				  }
				  
				  .controls {
					  display: flex;
					  justify-content: center;
					  gap: 15px;
					  margin-top: 20px;
				  }
				  
				  .btn {
					  background: linear-gradient(135deg, #6e8efb, #a777e3);
					  border: none;
					  border-radius: 50px;
					  color: white;
					  cursor: pointer;
					  font-size: 1.1rem;
					  font-weight: bold;
					  padding: 12px 25px;
					  transition: all 0.3s ease;
					  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
				  }
				  
				  .btn:hover {
					  transform: translateY(-3px);
					  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
				  }
				  
				  .btn:active {
					  transform: translateY(0);
				  }
				  
				  .score {
					  display: flex;
					  justify-content: space-around;
					  margin-top: 25px;
					  font-size: 1.2rem;
				  }
				  
				  .score div {
					  padding: 10px 20px;
					  border-radius: 10px;
					  background-color: rgba(255, 255, 255, 0.1);
					  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
				  }
				  
				  .winner {
					  background-color: rgba(255, 230, 0, 0.3) !important;
				  }
				  
				  @media (max-width: 500px) {
					  .cell {
						  height: 80px;
						  width: 80px;
						  font-size: 2.5rem;
					  }
					  
					  h1 {
						  font-size: 2rem;
					  }
					  
					  .status {
						  font-size: 1.2rem;
					  }
					  
					  .game-mode {
						  flex-direction: column;
						  gap: 10px;
					  }
				  }
			  </style>
		  </head>
		  <body>
			  <div class="container">
				  <h1>井字遊戲</h1>
				  
				  <div class="game-mode">
					  <button class="mode-btn active" id="singlePlayerBtn">单人模式</button>
					  <button class="mode-btn" id="twoPlayerBtn">双人模式</button>
				  </div>
				  
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
				  
				  <div class="score">
					  <div>玩家 X: <span id="score-x">0</span></div>
					  <div>玩家 O: <span id="score-o">0</span></div>
				  </div>
				  
				  <div class="controls">
					  <button class="btn" id="resetBtn">重新開始</button>
					  <button class="btn" id="newGameBtn">新遊戲</button>
				  </div>
			  </div>
		  
			  <script>
				  document.addEventListener('DOMContentLoaded', () => {
					  // 游戏元素
					  const statusDisplay = document.getElementById('status');
					  const scoreX = document.getElementById('score-x');
					  const scoreO = document.getElementById('score-o');
					  const cells = document.querySelectorAll('.cell');
					  const resetButton = document.getElementById('resetBtn');
					  const newGameButton = document.getElementById('newGameBtn');
					  const singlePlayerBtn = document.getElementById('singlePlayerBtn');
					  const twoPlayerBtn = document.getElementById('twoPlayerBtn');
					  
					  // 游戏状态
					  let gameActive = true;
					  let currentPlayer = 'X';
					  let gameState = ['', '', '', '', '', '', '', '', ''];
					  let scores = { X: 0, O: 0 };
					  let isSinglePlayer = true;
					  
					  // 获胜条件
					  const winningConditions = [
						  [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横向
						  [0, 3, 6], [1, 4, 7], [2, 5, 8], // 纵向
						  [0, 4, 8], [2, 4, 6]             // 对角线
					  ];
					  
					  // 消息文本
					  const winningMessage = () => '玩家 ' + currentPlayer + ' 獲勝！';
					  const drawMessage = () => '平局！';
					  const currentPlayerTurn = () => '玩家 ' + currentPlayer + ' 的回合';
					  
					  // 初始化游戏状态
					  statusDisplay.innerHTML = currentPlayerTurn();
					  
					  // 处理单元格点击
					  function handleCellClick(clickedCellEvent) {
						  const clickedCell = clickedCellEvent.target;
						  const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
						  
						  // 检查单元格是否已被填写或游戏是否已结束
						  if (gameState[clickedCellIndex] !== '' || !gameActive) {
							  return;
						  }
						  
						  // 处理玩家移动
						  handlePlayerMove(clickedCell, clickedCellIndex);
						  
						  // 单人模式下，如果是电脑的回合，则处理电脑移动
						  if (isSinglePlayer && gameActive && currentPlayer === 'O') {
							  setTimeout(handleComputerMove, 500);
						  }
					  }
					  
					  // 处理玩家移动
					  function handlePlayerMove(clickedCell, clickedCellIndex) {
						  // 更新游戏状态和界面
						  gameState[clickedCellIndex] = currentPlayer;
						  clickedCell.innerHTML = currentPlayer;
						  clickedCell.classList.add(currentPlayer.toLowerCase());
						  
						  // 检查游戏结果
						  checkResult();
					  }
					  
					  // 处理电脑移动
					  function handleComputerMove() {
						  // 简单的AI：优先选择获胜位置，然后是阻止玩家获胜，然后是中心，然后是角落，最后是其他位置
						  let bestMove = findBestMove();
						  
						  // 如果没有找到最佳移动，则随机选择空单元格
						  if (bestMove === -1) {
							  const availableCells = [];
							  for (let i = 0; i < gameState.length; i++) {
								  if (gameState[i] === '') {
									  availableCells.push(i);
								  }
							  }
							  
							  if (availableCells.length > 0) {
								  bestMove = availableCells[Math.floor(Math.random() * availableCells.length)];
							  }
						  }
						  
						  // 执行移动
						  if (bestMove !== -1) {
							  gameState[bestMove] = 'O';
							  cells[bestMove].innerHTML = 'O';
							  cells[bestMove].classList.add('o');
							  
							  // 检查游戏结果
							  checkResult();
						  }
					  }
					  
					  // 寻找最佳移动
					  function findBestMove() {
						  // 1. 检查电脑是否能获胜
						  for (let i = 0; i < winningConditions.length; i++) {
							  const [a, b, c] = winningConditions[i];
							  if (gameState[a] === 'O' && gameState[b] === 'O' && gameState[c] === '') return c;
							  if (gameState[a] === 'O' && gameState[c] === 'O' && gameState[b] === '') return b;
							  if (gameState[b] === 'O' && gameState[c] === 'O' && gameState[a] === '') return a;
						  }
						  
						  // 2. 检查是否需要阻止玩家获胜
						  for (let i = 0; i < winningConditions.length; i++) {
							  const [a, b, c] = winningConditions[i];
							  if (gameState[a] === 'X' && gameState[b] === 'X' && gameState[c] === '') return c;
							  if (gameState[a] === 'X' && gameState[c] === 'X' && gameState[b] === '') return b;
							  if (gameState[b] === 'X' && gameState[c] === 'X' && gameState[a] === '') return a;
						  }
						  
						  // 3. 优先选择中心
						  if (gameState[4] === '') return 4;
						  
						  // 4. 优先选择角落
						  const corners = [0, 2, 6, 8];
						  const availableCorners = corners.filter(index => gameState[index] === '');
						  if (availableCorners.length > 0) {
							  return availableCorners[Math.floor(Math.random() * availableCorners.length)];
						  }
						  
						  // 5. 选择其他位置
						  const sides = [1, 3, 5, 7];
						  const availableSides = sides.filter(index => gameState[index] === '');
						  if (availableSides.length > 0) {
							  return availableSides[Math.floor(Math.random() * availableSides.length)];
						  }
						  
						  return -1; // 没有可用的移动
					  }
					  
					  // 检查游戏结果
					  function checkResult() {
						  let roundWon = false;
						  let winningLine = null;
						  
						  // 检查是否获胜
						  for (let i = 0; i < winningConditions.length; i++) {
							  const [a, b, c] = winningConditions[i];
							  if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
								  continue;
							  }
							  if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
								  roundWon = true;
								  winningLine = [a, b, c];
								  break;
							  }
						  }
						  
						  // 处理获胜情况
						  if (roundWon) {
							  statusDisplay.innerHTML = winningMessage();
							  gameActive = false;
							  
							  // 更新分数
							  scores[currentPlayer]++;
							  updateScores();
							  
							  // 高亮显示获胜的单元格
							  if (winningLine) {
								  winningLine.forEach(index => {
									  cells[index].classList.add('winner');
								  });
							  }
							  
							  return;
						  }
						  
						  // 检查是否平局
						  let roundDraw = !gameState.includes('');
						  if (roundDraw) {
							  statusDisplay.innerHTML = drawMessage();
							  gameActive = false;
							  return;
						  }
						  
						  // 切换玩家
						  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
						  statusDisplay.innerHTML = currentPlayerTurn();
					  }
					  
					  // 更新分数显示
					  function updateScores() {
						  scoreX.textContent = scores['X'];
						  scoreO.textContent = scores['O'];
					  }
					  
					  // 重新开始游戏（重置棋盘但保留分数）
					  function restartGame() {
						  gameActive = true;
						  currentPlayer = 'X';
						  gameState = ['', '', '', '', '', '', '', '', ''];
						  statusDisplay.innerHTML = currentPlayerTurn();
						  
						  cells.forEach(cell => {
							  cell.innerHTML = '';
							  cell.classList.remove('x');
							  cell.classList.remove('o');
							  cell.classList.remove('winner');
						  });
					  }
					  
					  // 开始新游戏（重置棋盘和分数）
					  function newGame() {
						  restartGame();
						  scores = { X: 0, O: 0 };
						  updateScores();
					  }
					  
					  // 切换游戏模式
					  function setGameMode(singlePlayer) {
						  isSinglePlayer = singlePlayer;
						  singlePlayerBtn.classList.toggle('active', singlePlayer);
						  twoPlayerBtn.classList.toggle('active', !singlePlayer);
						  newGame();
					  }
					  
					  // 添加事件监听器
					  cells.forEach(cell => cell.addEventListener('click', handleCellClick));
					  resetButton.addEventListener('click', restartGame);
					  newGameButton.addEventListener('click', newGame);
					  singlePlayerBtn.addEventListener('click', () => setGameMode(true));
					  twoPlayerBtn.addEventListener('click', () => setGameMode(false));
				  });
			  </script>
		  </body>
		  </html>`;
		  
		  export default {
			async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
			  return new Response(HTML_CONTENT, {
				headers: {
				  'content-type': 'text/html;charset=UTF-8',
				},
			  });
			},
		  };');
	},
} satisfies ExportedHandler<Env>;
