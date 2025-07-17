<template>
  <div class="ai-assistant">
    <div class="ai-header">
      <span class="title">小助手</span>
      <div class="operations">
        <div class="new-session" @click="newSession">新聊天</div>
        <div class="session-dropdown" ref="dropdown">
          <button class="history-button" @click="toggleSessionList">历史会话</button>
          <ul v-if="showSessionList" class="dropdown-list">
            <li v-if="sessions.length === 0" class="empty-session">暂无会话</li>
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
      <template v-if="chatRequest.session_id && visibleMessages.length > 0">
        <div
          v-for="(msg, index) in visibleMessages"
          :key="index"
          class="chat-message"
          :class="msg.role === 'user' ? 'user-message' : 'assistant-message'"
        >
          <div class="bubble">
            {{ msg.text }}
          </div>
        </div>
      </template>
      <template v-else>
        <div class="empty-chat-tip">今天想问什么？</div>
      </template>
    </div>


    <div class="ai-input-area">
      <input
        v-model="chatRequest.message"
        @keyup.enter="handleSend"
        :disabled="isSending || !chatRequest.session_id"
        class="ai-input"
        placeholder="请选择会话或新建聊天后输入..."
      />
      <button
        class="send-button"
        @click="handleSend"
        :disabled="(!chatRequest.message.trim() && !isSending) || !chatRequest.session_id"
      >
        {{ isSending ? '中止' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
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
    ...mapState(['reportList']),
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
    ...mapActions(['createReport']),
    ...mapMutations(['setSelectedReportId']),
    toggleSessionList() {
      if (this.sessions.length == 0) {
        return
      }
      this.showSessionList = !this.showSessionList;
    },
    async fetchSessions() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/conversation/sessions?user_id=${this.chatRequest.user_id}`);
        const data = await res.json();
        this.sessions = data.sessions || [];
        if (this.sessions.length > 0) {
          // 如果当前session_id已被删除或空，默认切换到第一个
          if (!this.sessions.includes(this.chatRequest.session_id)) {
            this.chatRequest.session_id = this.sessions[0];
          }
          await this.loadHistory();
        } else {
          // 没有会话了，清空当前会话和消息
          this.chatRequest.session_id = '';
          this.messages = [];
        }
        return this.sessions;
      } catch (err) {
        console.error('获取会话列表失败:', err);
        return [];
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
        this.showSessionList = false;
        return;
      }
      this.chatRequest.session_id = session_id;
      this.showSessionList = false;
      await this.loadHistory();
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

      const userMessage = this.chatRequest.message; // 保存副本
      this.messages.push({ role: 'user', text: userMessage })

      try {
        const res = await fetch('http://127.0.0.1:8000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.chatRequest)
        })
        const data = await res.json()

        this.chatRequest.session_id = data.session_id

        if (data.reply?.content || data.reply?.message) {
          const assistantText = data.reply.content || data.reply.message;
          this.messages.push({ role: 'assistant', text: assistantText });
        }
        const toolResult = data.reply?.tool_result;
        if (toolResult?.type === 'ui_command') {
          this.handleToolResult(toolResult);
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
    async handleToolResult(toolResult) {
      const commandName = toolResult.command;
      const commandFn = utils[commandName];
      let commandParams = {};
      if (toolResult.params) {
        commandParams = toolResult.params;
      }
      if (typeof commandFn === 'function') {
        if (commandName === 'exportJsonFile') {
          commandFn(this.reportList, `reports_${Date.now()}.json`);
          return
        }
        if (commandName === 'createNewReport') {
          let newReport = commandFn(commandParams, this.reportList.length);
          await this.createReport(newReport)
        }
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
        // todo 中止功能
        return
      }
      if (!this.chatRequest.message.trim()) return
      this.sendMessage()
    },
    async newSession() {
      try {
        const res = await fetch('http://127.0.0.1:8000/conversation/new_session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: this.chatRequest.user_id })
        });
        const data = await res.json();
        console.log('新会话创建成功', data);
        
        // 假设后端返回了新会话的 session_id，通常是 data.session_id
        const newSessionId = data.session_id;
        
        // 先刷新会话列表
        await this.fetchSessions();

        // 手动切换到新建的会话
        if (newSessionId) {
          this.chatRequest.session_id = newSessionId;
          await this.loadHistory();
        } else if (this.sessions.length > 0) {
          this.chatRequest.session_id = this.sessions[0];
          await this.loadHistory();
        }
      } catch (err) {
        console.error('新建会话出错', err);
      }
    },

    async deleteSession(sessionId) {
      try {
        await fetch(`http://127.0.0.1:8000/conversation/session?user_id=${this.chatRequest.user_id}&session_id=${sessionId}`, {
          method: 'DELETE'
        });
        await this.fetchSessions()
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
  display: flex;
  margin: 8px 0;
  padding: 0 12px;
}

.user-message {
  justify-content: flex-end;
}

.assistant-message {
  justify-content: flex-start;
}

.bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 16px;
  position: relative;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

/* 用户气泡样式 */
.user-message .bubble {
  background-color: #d1eaff;
  color: #000;
  border-bottom-right-radius: 2px;
}

/* AI 气泡样式 */
.assistant-message .bubble {
  background-color: #f0f0f0;
  color: #333;
  border-bottom-left-radius: 2px;
}

/* 添加小三角 */
.user-message .bubble::after {
  content: "";
  position: absolute;
  right: -6px;
  top: 10px;
  border-width: 6px 0 6px 6px;
  border-style: solid;
  border-color: transparent transparent transparent #d1eaff;
}

.assistant-message .bubble::after {
  content: "";
  position: absolute;
  left: -6px;
  top: 10px;
  border-width: 6px 6px 6px 0;
  border-style: solid;
  border-color: transparent #f0f0f0 transparent transparent;
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
