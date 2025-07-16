<template>
  <div class="ai-assistant">
    <div class="ai-header">
      <span class="title">AI 助手</span>
      <button class="close-button" @click="$emit('close')">×</button>
    </div>

    <div class="ai-content" ref="chatBox">
      <div v-for="(msg, index) in messages" :key="index" class="chat-message" :class="msg.role">
        <span class="msg-text">{{ msg.text }}</span>
      </div>
    </div>

    <div class="ai-input-area">
      <input
        v-model="inputText"
        @keyup.enter="handleSend"
        :disabled="isSending"
        class="ai-input"
        placeholder="请输入问题..."
      />
      <button class="send-button" @click="handleSend" :disabled="!inputText.trim() && !isSending">
        {{ isSending ? '中止' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIAssistant',
  data() {
    return {
      inputText: '',
      isSending: false,
      messages: [
        { role: 'system', text: '你好，我可以帮你生成报表、分析数据或者解答问题！' }
      ]
    }
  },
  methods: {
    handleSend() {
      if (this.isSending) {
        this.abortRequest()
        return
      }

      const userMessage = this.inputText.trim()
      if (!userMessage) return

      this.messages.push({ role: 'user', text: userMessage })
      this.inputText = ''
      this.isSending = true

      // 模拟异步 AI 回复
      setTimeout(() => {
        if (this.isSending) {
          this.messages.push({ role: 'ai', text: `AI 回复：你说的是 "${userMessage}" 吗？` })
          this.isSending = false
          this.scrollToBottom()
        }
      }, 1500)

      this.scrollToBottom()
    },
    abortRequest() {
      this.isSending = false
      this.messages.push({ role: 'system', text: '已中止回复。' })
      this.scrollToBottom()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatBox
        el.scrollTop = el.scrollHeight
      })
    },
    async sendMessage() {
      this.loading = true
      try {
        const res = await fetch('http://127.0.0.1:8000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: 'default',  // 你也可以绑定用户 ID
            message: this.inputText
          })
        })
        const data = await res.json()
        this.chatHistory.push({ role: 'ai', text: data.reply })
      } catch (err) {
        console.error('发送失败:', err)
      } finally {
        this.loading = false
      }
    }
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
</style>
