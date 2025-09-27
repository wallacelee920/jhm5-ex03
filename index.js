export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const kv = env.MY_KV;

    // CORS 頭部
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API 路由
    if (path.startsWith('/api/tasks')) {
      try {
        // GET /api/tasks - 獲取所有任務
        if (request.method === 'GET' && path === '/api/tasks') {
          const tasksJson = await kv.get('tasks');
          const tasks = tasksJson ? JSON.parse(tasksJson) : [];
          return Response.json({ tasks }, { headers: corsHeaders });
        }

        // POST /api/tasks - 創建新任務
        if (request.method === 'POST' && path === '/api/tasks') {
          const taskData = await request.json();
          const tasksJson = await kv.get('tasks');
          const tasks = tasksJson ? JSON.parse(tasksJson) : [];
          
          const newTask = {
            id: Date.now().toString(),
            text: taskData.text,
            completed: taskData.completed || false,
            createdAt: new Date().toISOString()
          };
          
          tasks.unshift(newTask);
          await kv.put('tasks', JSON.stringify(tasks));
          
          return Response.json({ success: true, task: newTask }, { headers: corsHeaders });
        }

        // PUT /api/tasks/:id - 更新任務
        if (request.method === 'PUT' && path.startsWith('/api/tasks/')) {
          const taskId = path.split('/').pop();
          const taskData = await request.json();
          
          const tasksJson = await kv.get('tasks');
          const tasks = tasksJson ? JSON.parse(tasksJson) : [];
          
          const taskIndex = tasks.findIndex(task => task.id === taskId);
          if (taskIndex === -1) {
            return Response.json({ error: '任務不存在' }, { status: 404, headers: corsHeaders });
          }
          
          tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
          await kv.put('tasks', JSON.stringify(tasks));
          
          return Response.json({ success: true, task: tasks[taskIndex] }, { headers: corsHeaders });
        }

        // DELETE /api/tasks/:id - 刪除任務
        if (request.method === 'DELETE' && path.startsWith('/api/tasks/')) {
          const taskId = path.split('/').pop();
          
          const tasksJson = await kv.get('tasks');
          const tasks = tasksJson ? JSON.parse(tasksJson) : [];
          
          const filteredTasks = tasks.filter(task => task.id !== taskId);
          
          if (tasks.length === filteredTasks.length) {
            return Response.json({ error: '任務不存在' }, { status: 404, headers: corsHeaders });
          }
          
          await kv.put('tasks', JSON.stringify(filteredTasks));
          
          return Response.json({ success: true }, { headers: corsHeaders });
        }

        return new Response('Not Found', { status: 404 });
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
    }

    // 提供 HTML 頁面
    if (path === '/todo2.html' || path === '/to-do' || path === '/') {
      const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>待辦事項 (Cloudflare KV版)</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px; display: flex; justify-content: center; }
        .container { background: white; border-radius: 15px; padding: 30px; width: 100%; max-width: 600px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        h1 { text-align: center; color: #333; margin-bottom: 30px; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .input-section { display: flex; gap: 10px; margin-bottom: 25px; }
        #task-input { flex: 1; padding: 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; }
        #task-input:focus { outline: none; border-color: #667eea; }
        #add-btn { background: #667eea; color: white; border: none; padding: 15px 25px; border-radius: 8px; cursor: pointer; font-size: 16px; transition: background 0.3s; }
        #add-btn:hover { background: #5a6fd8; }
        .filters { display: flex; gap: 10px; margin-bottom: 20px; }
        .filter-btn { flex: 1; padding: 10px; border: 2px solid #ddd; background: white; border-radius: 6px; cursor: pointer; transition: all 0.3s; }
        .filter-btn.active { background: #667eea; color: white; border-color: #667eea; }
        .task-item { display: flex; align-items: center; padding: 15px; margin-bottom: 10px; background: #f8f9ff; border-radius: 8px; border-left: 4px solid #667eea; transition: transform 0.2s; }
        .task-item:hover { transform: translateY(-2px); box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
        .task-item.completed { border-left-color: #4CAF50; opacity: 0.7; }
        .task-checkbox { margin-right: 15px; width: 20px; height: 20px; cursor: pointer; }
        .task-text { flex: 1; font-size: 16px; }
        .completed .task-text { text-decoration: line-through; color: #666; }
        .task-actions { display: flex; gap: 5px; }
        .delete-btn { background: #ff4757; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 14px; }
        .edit-btn { background: #ffa502; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 14px; }
        .stats { display: flex; justify-content: space-around; margin-top: 25px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
        .loading { text-align: center; padding: 20px; color: #666; }
        .error { background: #ffe6e6; color: #d63031; padding: 10px; border-radius: 5px; margin-bottom: 15px; text-align: center; display: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📝 待辦事項清單 (Cloudflare KV)</h1>
        <div class="error" id="error-message"></div>
        <div class="input-section">
            <input type="text" id="task-input" placeholder="輸入新的待辦事項...">
            <button id="add-btn">添加任務</button>
        </div>
        <div class="filters">
            <button class="filter-btn active" data-filter="all">全部任務</button>
            <button class="filter-btn" data-filter="pending">待完成</button>
            <button class="filter-btn" data-filter="completed">已完成</button>
        </div>
        <div id="task-list"><div class="loading">載入中...</div></div>
        <div class="stats">
            <div><div class="stat-number" id="total-tasks">0</div><div>總任務數</div></div>
            <div><div class="stat-number" id="completed-tasks">0</div><div>已完成</div></div>
            <div><div class="stat-number" id="pending-tasks">0</div><div>待完成</div></div>
        </div>
    </div>
    <script>
        const API_BASE = 'https://jhm5-ex03.lizhongyan744.workers.dev';
        let currentFilter = 'all';
        let tasks = [];
        function showError(message) {
            const errorEl = document.getElementById('error-message');
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            setTimeout(() => errorEl.style.display = 'none', 5000);
        }
        async function apiRequest(endpoint, options = {}) {
            try {
                const response = await fetch(API_BASE + endpoint, {
                    headers: { 'Content-Type': 'application/json', ...options.headers },
                    ...options
                });
                if (!response.ok) throw new Error('請求失敗');
                return await response.json();
            } catch (error) {
                showError('網路錯誤: ' + error.message);
                throw error;
            }
        }
        async function loadTasks() {
            try {
                const data = await apiRequest('/api/tasks');
                tasks = data.tasks || [];
                renderTasks();
                updateStats();
            } catch (error) {
                tasks = [];
                renderTasks();
            }
        }
        async function addTask() {
            const input = document.getElementById('task-input');
            const text = input.value.trim();
            if (!text) { showError('請輸入任務內容'); return; }
            try {
                await apiRequest('/api/tasks', { method: 'POST', body: JSON.stringify({ text, completed: false }) });
                input.value = '';
                await loadTasks();
            } catch (error) {}
        }
        async function toggleTask(id) {
            try {
                const task = tasks.find(t => t.id === id);
                if (!task) return;
                await apiRequest(\`/api/tasks/\${id}\`, { method: 'PUT', body: JSON.stringify({ ...task, completed: !task.completed }) });
                await loadTasks();
            } catch (error) {}
        }
        async function deleteTask(id) {
            if (!confirm('確定要刪除這個任務嗎？')) return;
            try {
                await apiRequest(\`/api/tasks/\${id}\`, { method: 'DELETE' });
                await loadTasks();
            } catch (error) {}
        }
        async function editTask(id, oldText) {
            const newText = prompt('編輯任務:', oldText);
            if (newText === null || newText.trim() === '') return;
            try {
                const task = tasks.find(t => t.id === id);
                if (!task) return;
                await apiRequest(\`/api/tasks/\${id}\`, { method: 'PUT', body: JSON.stringify({ ...task, text: newText.trim() }) });
                await loadTasks();
            } catch (error) {}
        }
        function renderTasks() {
            const taskList = document.getElementById('task-list');
            let filteredTasks = tasks;
            if (currentFilter === 'completed') filteredTasks = tasks.filter(t => t.completed);
            else if (currentFilter === 'pending') filteredTasks = tasks.filter(t => !t.completed);
            if (filteredTasks.length === 0) {
                taskList.innerHTML = \`<div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📝</div>
                    <div>目前沒有\${currentFilter !== 'all' ? (currentFilter === 'completed' ? '已完成' : '待完成') : ''}的任務</div>
                </div>\`;
                return;
            }
            taskList.innerHTML = filteredTasks.map(task => \`
                <div class="task-item \${task.completed ? 'completed' : ''}">
                    <input type="checkbox" class="task-checkbox" \${task.completed ? 'checked' : ''} onchange="toggleTask('\${task.id}')">
                    <span class="task-text">\${task.text}</span>
                    <div class="task-actions">
                        <button class="edit-btn" onclick="editTask('\${task.id}', '\${task.text.replace(/'/g, "\\\\'")}')">編輯</button>
                        <button class="delete-btn" onclick="deleteTask('\${task.id}')">刪除</button>
                    </div>
                </div>
            \`).join('');
        }
        function updateStats() {
            const total = tasks.length;
            const completed = tasks.filter(t => t.completed).length;
            const pending = total - completed;
            document.getElementById('total-tasks').textContent = total;
            document.getElementById('completed-tasks').textContent = completed;
            document.getElementById('pending-tasks').textContent = pending;
        }
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('add-btn').addEventListener('click', addTask);
            document.getElementById('task-input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') addTask();
            });
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentFilter = this.dataset.filter;
                    renderTasks();
                });
            });
            loadTasks();
        });
    </script>
</body>
</html>`;
      
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new Response('頁面不存在', { status: 404 });
  },
};