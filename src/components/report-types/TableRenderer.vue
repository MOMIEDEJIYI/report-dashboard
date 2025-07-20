<template>
  <div class="table-renderer" @mouseleave="hoverTarget = null">
    <h3>{{ report.config.title || '未命名表格' }}</h3>
    <div class="table-wrapper" ref="tableWrapper" style="position: relative; display: inline-block;">
      
      <!-- 插入列按钮 -->
      <div
        v-if="hoverTarget === 'top'"
        class="insert-button insert-col"
        :class="{ 'insert-col-last': insertColIndex === headers.length }"
        :style="{ left: insertColLeft + 'px' }"
        @click="insertColumn"
      >
        +
      </div>

      <!-- 插入行按钮 -->
      <div
        v-if="hoverTarget === 'left'"
        class="insert-button insert-row"
        :style="{ top: insertRowTop + 'px' }"
        @click="insertRow"
      >
        +
      </div>

      <table
        ref="table"
        @mousemove="handleMouseMove"
        @mouseenter="hoverTarget = null"
        style="border-collapse: collapse; width: 100%; table-layout: fixed;"
      >
        <thead>
          <tr>
            <th
              v-for="(header, i) in headers"
              :key="'h' + i"
              style="border: 1px solid #ccc; padding: 8px; text-align: center;"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in bodyRows" :key="'r' + i">
            <td
              v-for="(cell, j) in row"
              :key="'c' + j"
              style="border: 1px solid #ccc; padding: 8px; text-align: center;"
            >
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: "TableRenderer",
  props: {
    report: { type: Object, required: true },
  },
  data() {
    return {
      hoverTarget: null,
      insertColIndex: null,
      insertRowIndex: null,
    };
  },
  computed: {
    localSource() {
      return this.report.data?.source || []
    },
    headers() {
      return this.localSource[0] || [];
    },
    bodyRows() {
      return this.localSource.slice(1);
    },
    insertColLeft() {
      if (!this.$refs.tableWrapper || !this.$refs.table || this.insertColIndex === null)
        return 0;

      const wrapperRect = this.$refs.tableWrapper.getBoundingClientRect();
      const tableRect = this.$refs.table.getBoundingClientRect();
      const colCount = this.headers.length;
      const avgColWidth = tableRect.width / colCount;
      const buttonWidth = 20; // 按钮宽度

      let left = 0;

      if (this.insertColIndex === 0) {
        // 第一个按钮，左边缘对齐，并向左偏移按钮宽度的一半
        left = 0 - (buttonWidth / 2);
      } else if (this.insertColIndex === colCount) {
        // 最后一个按钮，定位到表格的右边缘，并向右偏移按钮宽度的一半
        left = tableRect.width - (buttonWidth / 2); // +10 是额外的偏移量
      } else {
        // 中间按钮：居中对齐到列的边界
        left = this.insertColIndex * avgColWidth;
      }

      // 确保按钮在wrapperRect内部，但对于最后一个按钮，我们希望它能够稍微超出wrapper，
      // 因为它是在表格右侧，而table可能和wrapper一样宽
      if (this.insertColIndex === colCount) {
        // 针对最后一个按钮，我们只限制它不能向左太远
        return Math.max(left, 0);
      } else {
        return Math.min(Math.max(left, 0), wrapperRect.width - buttonWidth);
      }
    },

    insertRowTop() {
      if (!this.$refs.tableWrapper || !this.$refs.table || this.insertRowIndex === null)
        return 0;

      const wrapperRect = this.$refs.tableWrapper.getBoundingClientRect();
      const tableRect = this.$refs.table.getBoundingClientRect();
      const headerHeight =
        this.$refs.table.querySelector("thead")?.getBoundingClientRect().height || 30;

      const rowCount = this.bodyRows.length;
      const avgRowHeight = (tableRect.height - headerHeight) / rowCount;

      let top = headerHeight + this.insertRowIndex * avgRowHeight - 11;
      return Math.min(Math.max(top, 0), wrapperRect.height - 22);
    },
  },
  methods: {
    ...mapActions(['updateReport']),
    handleMouseMove(event) {
      const wrapper = this.$refs.tableWrapper;
      const table = this.$refs.table;
      if (!wrapper || !table) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const offsetX = event.clientX - wrapperRect.left;
      const offsetY = event.clientY - wrapperRect.top;

      const tableRect = table.getBoundingClientRect();
      const headerHeight =
      table.querySelector("thead")?.getBoundingClientRect().height || 30;

      const colCount = this.headers.length;
      const rowCount = this.bodyRows.length;
      const avgColWidth = tableRect.width / colCount;
      const avgRowHeight = (tableRect.height - headerHeight) / rowCount;

      let closestCol = { index: null, dist: Infinity };
      if (offsetY <= headerHeight - 15) {
        for (let i = 0; i <= colCount; i++) {
          const x = i * avgColWidth;
          const dist = Math.abs(offsetX - x);
          if (dist < closestCol.dist) {
            closestCol = { index: i, dist };
          }
        }
      }

      let closestRow = { index: null, dist: Infinity };
      if (offsetX <= 40) {
        for (let i = 0; i <= rowCount; i++) {
          const y = headerHeight + i * avgRowHeight;
          const dist = Math.abs(offsetY - y);
          if (dist < closestRow.dist) {
            closestRow = { index: i, dist };
          }
        }
      }

      // 只显示最近的（最小距离的）那个按钮
      const DIST_THRESHOLD = 10;
      const STABLE_GAP = 4; // 避免两者距离太近导致切换

      if (
        closestCol.index !== null &&
        closestCol.dist < DIST_THRESHOLD &&
        (closestCol.dist + STABLE_GAP < closestRow.dist || closestRow.dist >= DIST_THRESHOLD)
      ) {
        this.hoverTarget = "top";
        this.insertColIndex = closestCol.index;
        this.insertRowIndex = null;
      } else if (
        closestRow.index !== null &&
        closestRow.dist < DIST_THRESHOLD
      ) {
        this.hoverTarget = "left";
        this.insertRowIndex = closestRow.index;
        this.insertColIndex = null;
      } else {
        this.hoverTarget = null;
        this.insertRowIndex = null;
        this.insertColIndex = null;
      }

    },
    insertColumn() {
      if (this.insertColIndex === null) return;

      this.localSource[0].splice(this.insertColIndex, 0, "新列");
      for (let i = 1; i < this.localSource.length; i++) {
        this.localSource[i].splice(this.insertColIndex, 0, "");
      }
      // 传完整的 report 对象（或克隆一份，避免引用问题）
      const updatedReport = {
        ...this.report,
        data: {
          ...this.report.data,
          source: this.localSource,
        },
      };

      this.updateReport(updatedReport);
      this.hoverTarget = null;
    },
    insertRow() {
      if (this.insertRowIndex === null) return;

      const newRow = new Array(this.headers.length).fill("");
      this.localSource.splice(this.insertRowIndex + 1, 0, newRow); // 向下插入
      // 传完整的 report 对象（或克隆一份，避免引用问题）
      const updatedReport = {
        ...this.report,
        data: {
          ...this.report.data,
          source: this.localSource,
        },
      };

      this.updateReport(updatedReport);
      this.hoverTarget = null;
    },
  },
};
</script>

<style scoped>
.table-renderer {
  padding: 20px;
  background: #ffffff;
  border: 1px solid #000000;
  border-radius: 4px;
  min-width: auto;
}

.insert-button {
  position: absolute;
  background-color: #2d8cf0;
  color: white;
  font-size: 12px;
  padding: 2px 0;
  width: 20px;
  height: 20px;
  line-height: 22px;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  z-index: 10;
  user-select:none;
}

.insert-col {
  top: -22px;
  position: absolute;
  z-index: 10;
  transform: translateX(-50%); /* 默认居中 */
  transition: left 0.2s ease;
}

/* 最后一个插入列按钮，去掉居中偏移，并提供一个额外的右侧偏移 */
.insert-col-last {
  transform: none; /* 移除居中偏移 */
}
.insert-row {
  left: -22px;
}
table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}
</style>
