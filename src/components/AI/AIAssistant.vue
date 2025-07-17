<template>
  <div class="ai-assistant">
    <div class="ai-header">
      <span class="title">小助手</span>
      <div class="operations">
        <div class="new-session" @click="newSession">新聊天</div>
        <div class="session-dropdown" ref="dropdown">
          <button class="history-button" @click="toggleSessionList">历史会话</button>
          <ul v-if="showSessionList" class="dropdown-list">
            <li
              v-for="session in sessions"
              :key="session"
              :class="{ active: session === chatRequest.session_id }"
            >
              <span @click="switchSession(session)">
                {{ formatSessionName(session) }}
              </span>
              <span class="delete-btn" @click.stop="deleteSession(session)">🗑</span>
            </li>
          </ul>
        </div>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
    </div>

    <div class="ai-content" ref="chatBox">
      <div
        v-for="(msg, index) in visibleMessages"
        :key="index"
        class="chat-message"
        :class="msg.role"
      >
        <span class="msg-text">{{ msg.text }}</span>
      </div>
    </div>

    <div class="ai-input-area">
      <input
        v-model="chatRequest.message"
        @keyup.enter="handleSend"
        :disabled="isSending"
        class="ai-input"
        placeholder="请输入问题..."
      />
      <button class="send-button" @click="handleSend" :disabled="!chatRequest.message.trim() && !isSending">
        {{ isSending ? '中止' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script>
import utils from '@/utils';

export default {
  name: 'AIAssistant',
  data() {
    return {
      isSending: false,
      chatRequest: {
        user_id: 'ui-user-1',
        session_id: '',
        message: '',
        stream: true
      },
      chatResponse: {
        success: false,
        reply: '',
        error: '',
        session_id: ''
      },
      messages: [],
      showSessionList: false,
      sessions: []
    }
  },
  computed: {
    visibleMessages() {
      return this.messages.filter(msg => msg.role !== 'system')
    }
  },
  mounted() {
    document.addEventListener('click', this.onClickOutside);
    this.fetchSessions()
  },
  beforeDestroy() {
    document.removeEventListener('click', this.onClickOutside);
  },
  methods: {
    toggleSessionList() {
      if (this.sessions.length == 0) {
        return
      }
      this.showSessionList = !this.showSessionList;
    },
    async fetchSessions() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/conversation/sessions?user_id=${this.chatRequest.user_id}`)
        const data = await res.json()
        this.sessions = data.sessions || []
        if (!this.chatRequest.session_id && this.sessions.length > 0) {
          this.chatRequest.session_id = this.sessions[0]
          this.loadHistory()
        }
      } catch (err) {
        console.error('获取会话列表失败:', err)
      }
    },
    formatSessionName(session) {
      const m = session.match(/session_(\d{8})_(\d{6})/)
      if (!m) return session
      const date = m[1]
      const time = m[2]
      return `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)} ${time.slice(0,2)}:${time.slice(2,4)}:${time.slice(4,6)}`
    },
    async switchSession(session_id) {
      if (this.chatRequest.session_id === session_id) {
        this.showSessionList = false
        return
      }
      this.chatRequest.session_id = session_id
      this.showSessionList = false
      await this.loadHistory()
    },
    async loadHistory() {
      if (!this.chatRequest.session_id) return
      try {
        const res = await fetch(`http://127.0.0.1:8000/conversation/session_history?user_id=${this.chatRequest.user_id}&session_id=${this.chatRequest.session_id}`)
        const data = await res.json()
        if (data.history) {
          this.messages = data.history.map(msg => {
            return {
              role: msg.role,
              text: this.parseContent(msg)
            }
          })
          this.scrollToBottom()
        }
      } catch (err) {
        console.error('获取历史失败:', err)
      }
    },
    async sendMessage() {
      if (!this.chatRequest.message.trim()) return
      this.isSending = true
      try {
        const res = await fetch('http://127.0.0.1:8000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.chatRequest)
        })
        const data = await res.json()
        this.chatRequest.session_id = data.session_id

        this.messages.push({ role: 'user', text: this.chatRequest.message })
        if (data.reply) {
          const toolResult = data.reply.tool_result;
          if (toolResult && toolResult.type === 'ui_command') {
            this.handleToolResult(toolResult);
          }
        }
        this.scrollToBottom()
        this.loadHistory()
      } catch (err) {
        console.error('发送失败:', err)
      } finally {
        this.chatRequest.message = ''
        this.isSending = false
      }
    },
    handleToolResult(toolResult, extraData) {
      const commandName = toolResult.command;
      const commandFn = utils[commandName];

      if (typeof commandFn === 'function') {
        commandFn(extraData);
      } else {
        console.warn(`未找到命令函数：${commandName}`);
      }
    },
    parseContent(msg) {
      if (msg.role !== 'assistant') return msg.text || msg.content || ''

      try {
        const parsed = JSON.parse(msg.text || msg.content)
        const explanation = parsed.explanation || ''
        const result = parsed.jsonrpc?.result
        const extra = result?.message || result?.content || ''
        return explanation + (extra && !explanation.includes(extra) ? '\n' + extra : '')
      } catch {
        return msg.text || msg.content || ''
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatBox
        if (el) el.scrollTop = el.scrollHeight
      })
    },
    handleSend() {
      if (this.isSending) {
        // 可实现中止功能
        return
      }
      if (!this.chatRequest.message.trim()) return
      this.sendMessage()
    },
    async newSession() {
      try {
        const res = await fetch('http://127.0.0.1:8000/conversation/new_session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: this.chatRequest.user_id })  // 注意是放到 body 中
        });

        const data = await res.json();
        console.log('新会话创建成功', data);
        this.fetchSessions()
      } catch (err) {
        console.error('新建会话出错', err);
      }
    },

    async deleteSession(sessionId) {
      try {
        await fetch(`http://127.0.0.1:8000/conversation/session?user_id=${this.chatRequest.user_id}&session_id=${sessionId}`, {
          method: 'DELETE'
        });
        this.fetchSessions()
      } catch (err) {
        console.error('删除会话异常:', err);
      }
    },
    onClickOutside(event) {
      const dropdown = this.$refs.dropdown;
      if (dropdown && !dropdown.contains(event.target)) {
        this.showSessionList = false;
      }
    },
  }
}
</script>

<style scoped>
.ai-assistant {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-left: 1px solid #ddd;
  padding: 0;
  box-sizing: border-box;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background-color: #f7f9fc;
}
.operations {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.close-button:hover {
  color: #f56c6c;
}

.ai-content {
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
  background: #fafafa;
}

.chat-message {
  margin-bottom: 10px;
  max-width: 80%;
  word-wrap: break-word;
}

.chat-message.user {
  text-align: right;
  margin-left: auto;
  color: #333;
}

.chat-message.ai {
  text-align: left;
  margin-right: auto;
  color: #409eff;
}

.chat-message.system {
  text-align: center;
  font-size: 13px;
  color: #aaa;
}

.ai-input-area {
  display: flex;
  padding: 10px 16px;
  border-top: 1px solid #eee;
  background: #fff;
}

.ai-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 14px;
}

.send-button {
  margin-left: 8px;
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.2s;
}

.send-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.send-button:hover:not(:disabled) {
  background-color: #66b1ff;
}
.session-dropdown {
  position: relative;
  display: inline-block;
  flex-direction: column;
}

.history-button, .new-session {
  padding: 6px 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.history-button:hover, .new-session:hover {
  background-color: #66b1ff;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 280px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  z-index: 10;
}

.dropdown-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dropdown-list li:hover {
  background: #f0f0f0;
}

.dropdown-list li.active {
  background-color: #409eff33;
}

.delete-btn {
  color: #999;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
}

.delete-btn:hover {
  color: #f56c6c;
}

</style>
