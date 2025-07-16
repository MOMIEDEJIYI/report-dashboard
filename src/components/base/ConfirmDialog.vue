<template>
  <div v-if="visible" class="confirm-overlay">
    <div class="confirm-dialog">
      <p class="message">{{ message }}</p>
      <div class="buttons">
        <button @click="$emit('cancel')">取消</button>
        <button @click="$emit('confirm')">确认</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    visible: Boolean,
    message: {
      type: String,
      default: '你确定要执行此操作吗？'
    }
  }
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.confirm-dialog {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
}

.message {
  margin-bottom: 16px;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:first-child {
  background-color: #ccc;
}

button:last-child {
  background-color: #409eff;
  color: white;
}
</style>
