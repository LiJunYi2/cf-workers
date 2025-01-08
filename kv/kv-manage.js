// KV 映射表，value 值为当前 workers 绑定的 KV 名称
const KV_MAP = {
    'kv1': 'KV_NAME:当前 workers 绑定的 KV 名称'
    // 可以添加更多 KV 映射
  };
  
  const html = `<!DOCTYPE html>
  <html lang="zh">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KV 管理系统</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsoneditor/dist/jsoneditor.min.css">
      <script src="https://cdn.jsdelivr.net/npm/jsoneditor/dist/jsoneditor.min.js"></script>
      <style>
          .jsoneditor-modal {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              z-index: 1000;
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              width: 90%;
              max-width: 800px;
              max-height: 90vh;
              display: none;
          }
          .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0,0,0,0.5);
              z-index: 999;
              display: none;
          }
      </style>
  </head>
  <body class="bg-gray-50 min-h-screen">
      <div class="max-w-4xl mx-auto p-6">
          <h1 class="text-3xl font-bold text-gray-800 mb-8">Cloudflare KV 管理系统</h1>
          <!-- 授权和选择区域 -->
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="password" 
                      id="authCode" 
                      placeholder="请输入授权码" 
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <select id="kvSelect" 
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">请选择 KV</option>
                      <option value="kv1">KV 存储1</option>
                  </select>
              </div>
          </div>
  
          <!-- 添加/更新区域 -->
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 class="text-xl font-semibold text-gray-700 mb-4">操作</h2>
              <div id="message" class="mb-4"></div>
              <div class="space-y-4">
                  <div class="flex items-center space-x-4">
                      <label class="w-20 text-gray-600">Key:</label>
                      <input type="text" 
                          id="key" 
                          placeholder="请输入 Key" 
                          class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div class="flex items-center space-x-4">
                      <label class="w-20 text-gray-600">Value:</label>
                      <input type="text" 
                          id="value" 
                          placeholder="请输入 Value" 
                          class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div class="flex items-center space-x-4 pt-2">
                      <div class="w-20"></div>
                      <button id="saveButton" 
                          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                          <svg id="saveLoading" class="w-4 h-4 mr-2 animate-spin hidden" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <svg id="saveIcon" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span id="saveText">保存</span>
                      </button>
                  </div>
              </div>
          </div>
  
          <!-- 列表区域 -->
          <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex justify-between items-center mb-4">
                  <h2 class="text-xl font-semibold text-gray-700">数据列表</h2>
                  <button id="refreshButton" 
                      class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-md transition duration-200 flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      刷新列表
                  </button>
              </div>
              <div id="kvList" class="overflow-x-auto"></div>
              <div id="pagination" class="mt-4 flex justify-center space-x-2"></div>
          </div>
  
          <!-- 添加页脚信息 -->
          <div class="mt-8 text-center text-sm text-gray-500">
              <p>Created by <a href="https://github.com/LiJunYi2/cf-workers/tree/main/kv" 
                  class="text-blue-600 hover:text-blue-800 hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer">
                  @AAA
              </a></p>
          </div>
      </div>
  
      <!-- 添加 JSON 编辑器模态框 -->
      <div id="modalOverlay" class="modal-overlay"></div>
      <div id="jsonEditorModal" class="jsoneditor-modal">
          <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">编辑 JSON</h3>
              <button onclick="closeJsonEditor()" class="text-gray-500 hover:text-gray-700">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
              </button>
          </div>
          <div id="jsoneditor" style="height: 400px;"></div>
          <div class="mt-4 flex justify-end">
              <button onclick="saveJsonEditorContent()" 
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mr-2">
                  确认
              </button>
              <button onclick="closeJsonEditor()" 
                  class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-md">
                  取消
              </button>
          </div>
      </div>
  
      <script>
          document.addEventListener('DOMContentLoaded', function() {
              document.getElementById('saveButton').addEventListener('click', saveKV);
              document.getElementById('refreshButton').addEventListener('click', listKV);
              
              // 添加 KV 选择框的变更事件监听
              const kvSelect = document.getElementById('kvSelect');
              kvSelect.addEventListener('change', function() {
                  saveKVSelection(this.value);
                  listKV();
              });
  
              // 恢复存储的授权码和 KV 选择
              const storedAuthCode = getStoredAuthCode();
              const storedKVSelection = getStoredKVSelection();
              
              if (storedAuthCode) {
                  document.getElementById('authCode').value = storedAuthCode;
              }
              
              if (storedKVSelection) {
                  kvSelect.value = storedKVSelection;
                  if (storedAuthCode) {
                      listKV(); // 如果有授权码和 KV 选择，自动加载列表
                  }
              }
  
              initJsonEditor();
  
              // 为 value 输入框添加点击事件
              const valueInput = document.getElementById('value');
              valueInput.addEventListener('click', function() {
                  try {
                      const value = this.value.trim();
                      if (!value) return;
                      
                      const jsonValue = JSON.parse(value);
                      if (typeof jsonValue === 'object') {
                          showJsonEditor(value, this);
                      }
                  } catch (e) {
                      console.log('Not a JSON value:', e);
                      // 如果不是 JSON，保持普通输入框行为
                  }
              });
          });
  
          // 添加分页相关变量
          let currentPage = 1;
          const pageSize = 20;
          let totalKeys = [];
  
          // 修改保存函数，添加 loading 效果
          async function saveKV() {
              const saveButton = document.getElementById('saveButton');
              const saveLoading = document.getElementById('saveLoading');
              const saveIcon = document.getElementById('saveIcon');
              const saveText = document.getElementById('saveText');
              
              // 显示 loading 状态
              saveButton.disabled = true;
              saveLoading.classList.remove('hidden');
              saveIcon.classList.add('hidden');
              saveText.textContent = '保存中...';
              
              const authCode = document.getElementById('authCode').value;
              const kvName = document.getElementById('kvSelect').value;
              const key = document.getElementById('key').value;
              let value = document.getElementById('value').value;
              
              if (!kvName) {
                  showMessage('请选择 KV 存储', false);
                  return;
              }
              
              if (!key || value === '') {
                  showMessage('Key 和 Value 不能为空', false);
                  return;
              }
              
              // 先验证授权码
              if (!await verifyAuthCode(authCode)) {
                  showMessage('授权码错误', false);
                  localStorage.removeItem('kvAuthCode');
                  return;
              }
              
              try {
                  // 尝试将数字字符串转换为数字
                  if (!isNaN(value) && value !== '') {
                      value = Number(value);
                  } else {
                      // 尝试解析 JSON
                      try {
                          value = JSON.parse(value);
                      } catch (e) {
                          // 如果不是有效的 JSON，就使用原始字符串
                      }
                  }
                  
                  const response = await fetch('/kv', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'X-Auth-Code': authCode,
                          'X-KV-Name': kvName
                      },
                      body: JSON.stringify({ key, value })
                  });
                  
                  const result = await response.json();
                  showMessage(result.message, response.ok);
                  if (response.ok) {
                      listKV();
                  }
              } catch (error) {
                  showMessage('操作失败', false);
              } finally {
                  // 恢复按钮状态
                  saveButton.disabled = false;
                  saveLoading.classList.add('hidden');
                  saveIcon.classList.remove('hidden');
                  saveText.textContent = '保存';
              }
          }
  
          // 修改列表加载函数，添加分页功能
          async function listKV() {
              const authCode = document.getElementById('authCode').value;
              const kvName = document.getElementById('kvSelect').value;
              
              if (!kvName) {
                  document.getElementById('kvList').innerHTML = '';
                  document.getElementById('pagination').innerHTML = '';
                  return;
              }
  
              // 先验证授权码
              if (!await verifyAuthCode(authCode)) {
                  showMessage('授权码错误', false);
                  localStorage.removeItem('kvAuthCode'); // 清除无效的授权码
                  return;
              }
  
              try {
                  const response = await fetch('/kv', {
                      headers: {
                          'X-Auth-Code': authCode,
                          'X-KV-Name': kvName
                      }
                  });
                  
                  const result = await response.json();
                  if (response.ok) {
                      totalKeys = result.keys;
                      const keysWithValues = await Promise.all(
                          getPaginatedKeys().map(async (key) => {
                              const valueResponse = await fetch('/kv/' + key.name, {
                                  headers: {
                                      'X-Auth-Code': authCode,
                                      'X-KV-Name': kvName
                                  }
                              });
                              const value = await valueResponse.json();
                              return { ...key, value: value.value };
                          })
                      );
                      
                      const table = createTable(keysWithValues);
                      document.getElementById('kvList').innerHTML = table;
                      createPagination();
                      
                      if (result.message) {
                          showMessage(result.message, true);
                      }
                  } else {
                      showMessage(result.message || '获取列表失败', false);
                  }
              } catch (error) {
                  showMessage('获取列表失败', false);
              }
          }
  
          // 添加分页相关函数
          function getPaginatedKeys() {
              const start = (currentPage - 1) * pageSize;
              return totalKeys.slice(start, start + pageSize);
          }
  
          function createPagination() {
              const totalPages = Math.ceil(totalKeys.length / pageSize);
              const paginationDiv = document.getElementById('pagination');
              let html = '';
              
              // 上一页按钮
              html += '<button class="' + 
                  (currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700') + 
                  ' px-3 py-1" ' + (currentPage === 1 ? 'disabled' : 'onclick="changePage(' + (currentPage - 1) + ')"') + 
                  '">上一页</button>';
              
              // 页码按钮
              for (let i = 1; i <= totalPages; i++) {
                  html += '<button class="px-3 py-1 ' + 
                      (currentPage === i ? 'bg-blue-500 text-white' : 'text-blue-500 hover:text-blue-700') + 
                      ' rounded" onclick="changePage(' + i + ')">' + i + '</button>';
              }
              
              // 下一页按钮
              html += '<button class="' + 
                  (currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700') + 
                  ' px-3 py-1" ' + (currentPage === totalPages ? 'disabled' : 'onclick="changePage(' + (currentPage + 1) + ')"') + 
                  '">下一页</button>';
              
              paginationDiv.innerHTML = html;
          }
  
          function changePage(page) {
              currentPage = page;
              listKV();
          }
  
          function createTable(keys) {
              if (!keys.length) return '<p class="text-gray-500 text-center py-4">没有数据</p>';
              
              let table = '<table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr>' +
                  '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Key</th>' +
                  '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>' +
                  '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">操作</th>' +
                  '</tr></thead><tbody class="bg-white divide-y divide-gray-200">';
              
              keys.forEach((key, index) => {
                  let displayValue = key.value;
                  try {
                      const parsedValue = JSON.parse(key.value);
                      displayValue = Array.isArray(parsedValue) ? 
                          JSON.stringify(parsedValue) : 
                          String(parsedValue);
                  } catch (e) {
                      displayValue = String(key.value);
                  }
                  
                  table += '<tr class="' + (index % 2 === 0 ? 'bg-white' : 'bg-gray-50') + ' hover:bg-gray-100">' +
                      '<td class="px-6 py-4 text-sm text-gray-900">' + key.name + '</td>' +
                      '<td class="px-6 py-4 text-sm text-gray-500 break-all">' + displayValue + '</td>' +
                      '<td class="px-6 py-4 text-sm font-medium">' +
                      '<div class="flex items-center space-x-3">' +
                      // 更新按钮
                      '<button class="update-button inline-flex items-center whitespace-nowrap px-3 py-1.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-colors duration-200" ' +
                      'data-key="' + key.name + '" data-value="' + encodeURIComponent(key.value) + '">' +
                      '<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>' +
                      '</svg>更新</button>' +
                      // 删除按钮
                      '<button class="delete-button inline-flex items-center whitespace-nowrap px-3 py-1.5 text-red-600 hover:text-white hover:bg-red-600 rounded-md transition-colors duration-200" ' +
                      'data-key="' + key.name + '">' +
                      '<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>' +
                      '</svg>删除</button>' +
                      '</div>' +
                      '</td></tr>';
              });
              
              table += '</tbody></table>';
              
              setTimeout(() => {
                  document.querySelectorAll('.update-button').forEach(button => {
                      button.addEventListener('click', function() {
                          const key = this.getAttribute('data-key');
                          const value = decodeURIComponent(this.getAttribute('data-value'));
                          document.getElementById('key').value = key;
                          document.getElementById('value').value = value;
                          document.getElementById('key').scrollIntoView({ behavior: 'smooth', block: 'center' });
                      });
                  });
  
                  document.querySelectorAll('.delete-button').forEach(button => {
                      button.addEventListener('click', function() {
                          const key = this.getAttribute('data-key');
                          if (confirm('确定要删除 ' + key + ' 吗？')) {
                              deleteKV(key);
                          }
                      });
                  });
              }, 0);
              
              return table;
          }
  
          function showMessage(message, isSuccess) {
              const messageDiv = document.getElementById('message');
              const iconPath = isSuccess 
                  ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
                  : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
              
              messageDiv.innerHTML = 
                  '<div class="flex items-center p-4 ' + (isSuccess ? 'bg-green-50' : 'bg-red-50') + ' rounded-md">' +
                      '<svg class="w-5 h-5 mr-3 ' + (isSuccess ? 'text-green-500' : 'text-red-500') + 
                      '" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                      iconPath +
                      '</svg>' +
                      '<span class="' + (isSuccess ? 'text-green-700' : 'text-red-700') + '">' + 
                      message +
                      '</span>' +
                  '</div>';
  
              if (isSuccess) {
                  setTimeout(() => {
                      messageDiv.innerHTML = '';
                  }, 3000);
              }
          }
  
          function saveAuthCode(code) {
              localStorage.setItem('kvAuthCode', code);
          }
  
          function getStoredAuthCode() {
              return localStorage.getItem('kvAuthCode');
          }
  
          async function verifyAuthCode(authCode) {
              try {
                  const response = await fetch('/verify-auth', {
                      headers: {
                          'X-Auth-Code': authCode
                      }
                  });
                  if (response.ok) {
                      saveAuthCode(authCode); // 验证成功后保存授权码
                      return true;
                  }
                  return false;
              } catch (error) {
                  return false;
              }
          }
  
          function saveKVSelection(kvName) {
              localStorage.setItem('selectedKV', kvName);
          }
  
          function getStoredKVSelection() {
              return localStorage.getItem('selectedKV');
          }
  
          let jsonEditor = null;
          let currentValueInput = null;
  
          // 初始化 JSON 编辑器
          function initJsonEditor() {
              const container = document.getElementById('jsoneditor');
              const options = {
                  mode: 'tree',
                  modes: ['tree', 'view', 'form', 'code', 'text'],
                  language: 'zh-CN'
              };
              jsonEditor = new JSONEditor(container, options);
          }
  
          // 显示 JSON 编辑器
          function showJsonEditor(value, inputElement) {
              currentValueInput = inputElement;
              const modal = document.getElementById('jsonEditorModal');
              const overlay = document.getElementById('modalOverlay');
              
              try {
                  // 尝试解析 JSON
                  let jsonValue = value;
                  if (typeof value === 'string') {
                      jsonValue = JSON.parse(value);
                  }
                  console.log('Parsed JSON:', jsonValue); // 添加日志
                  
                  if (typeof jsonValue === 'object') {
                      jsonEditor.set(jsonValue);
                      modal.style.display = 'block';
                      overlay.style.display = 'block';
                  }
              } catch (e) {
                  console.error('JSON parse error:', e); // 添加错误日志
                  // 如果不是有效的 JSON，不打开编辑器
                  return;
              }
          }
  
          // 关闭 JSON 编辑器
          function closeJsonEditor() {
              const modal = document.getElementById('jsonEditorModal');
              const overlay = document.getElementById('modalOverlay');
              modal.style.display = 'none';
              overlay.style.display = 'none';
          }
  
          // 保存 JSON 编辑器内容
          function saveJsonEditorContent() {
              if (currentValueInput && jsonEditor) {
                  const jsonValue = jsonEditor.get();
                  currentValueInput.value = JSON.stringify(jsonValue);
                  closeJsonEditor();
              }
          }
  
          // 添加删除 KV 的函数
          async function deleteKV(key) {
              const authCode = document.getElementById('authCode').value;
              const kvName = document.getElementById('kvSelect').value;
              
              try {
                  const response = await fetch('/kv/' + key, {
                      method: 'DELETE',
                      headers: {
                          'X-Auth-Code': authCode,
                          'X-KV-Name': kvName
                      }
                  });
                  
                  const result = await response.json();
                  showMessage(result.message, response.ok);
                  if (response.ok) {
                      listKV();
                  }
              } catch (error) {
                  showMessage('删除失败', false);
              }
          }
      </script>
  </body>
  </html>`;
  
  export default {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      const authCode = request.headers.get('X-Auth-Code');
      const kvName = request.headers.get('X-KV-Name');
  
      // 验证授权码的专门接口
      if (url.pathname === '/verify-auth') {
        if (authCode === env.AUTH_CODE) {
          return new Response(JSON.stringify({ message: '授权成功' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ message: '授权码错误' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // 验证授权码
      if (url.pathname !== '/' && authCode !== env.AUTH_CODE) {
        return new Response(JSON.stringify({ message: '授权码错误', code: 401 }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // 获取实际的 KV 绑定
      const actualKVBinding = kvName ? KV_MAP[kvName] : null;
      if (url.pathname !== '/' && !actualKVBinding) {
        return new Response(JSON.stringify({ message: '无效的 KV 选择' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // 路由处理
      if (url.pathname === '/') {
        return new Response(html, {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      }
  
      if (url.pathname === '/kv') {
        if (request.method === 'GET') {
          // 列出所有 keys
          const keys = await env[actualKVBinding].list();
          return new Response(JSON.stringify({ keys: keys.keys }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
  
        if (request.method === 'POST') {
          // 添加或更新 KV
          const { key, value } = await request.json();
          if (!key || value === undefined || value === '') {
            return new Response(JSON.stringify({ message: 'Key 和 Value 不能为空' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
  
          try {
              // 如果是字符串形式的 JSON，先解析再存储
              const valueToStore = typeof value === 'string' ? 
                  JSON.stringify(JSON.parse(value)) : 
                  JSON.stringify(value);
              
              await env[actualKVBinding].put(key, valueToStore);
              return new Response(JSON.stringify({ message: '保存成功' }), {
                  headers: { 'Content-Type': 'application/json' }
              });
          } catch (e) {
              // 如果不是 JSON，直接存储原始值
              await env[actualKVBinding].put(key, value);
              return new Response(JSON.stringify({ message: '保存成功' }), {
                  headers: { 'Content-Type': 'application/json' }
              });
          }
        }
      }
  
      if (url.pathname.startsWith('/kv/') && request.method === 'GET') {
          const key = url.pathname.replace('/kv/', '');
          const value = await env[actualKVBinding].get(key);
          
          try {
              // 尝试解析存储的值
              const parsedValue = JSON.parse(value);
              return new Response(JSON.stringify({ value: JSON.stringify(parsedValue) }), {
                  headers: { 'Content-Type': 'application/json' }
              });
          } catch (e) {
              // 如果不是 JSON，返回原始值
              return new Response(JSON.stringify({ value }), {
                  headers: { 'Content-Type': 'application/json' }
              });
          }
      }
  
      if (url.pathname.startsWith('/kv/') && request.method === 'DELETE') {
          const key = url.pathname.replace('/kv/', '');
          await env[actualKVBinding].delete(key);
          return new Response(JSON.stringify({ message: '删除成功' }), {
              headers: { 'Content-Type': 'application/json' }
          });
      }
  
      return new Response('Not Found', { status: 404 });
    },
  }; 
