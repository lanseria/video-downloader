<template>
  <n-el class="progress-wrap">
    <n-progress
      class="progress"
      type="line"
      :percentage="modelRef.progress"
      indicator-placement="inside"
      :height="30"
      :border-radius="4"
      :fill-border-radius="0"
      :processing="processing"
    />
    <div v-if="![0, 100].includes(modelRef.progress)" class="other">
      <span class="speed">{{ modelRef.speed }}</span>
      <span class="eta">ETA {{ modelRef.eta }}</span>
    </div>
  </n-el>
</template>
<script lang="ts" setup>
import { NProgress, NEl } from "naive-ui";
import { computed, PropType } from "vue";
import { TaskForm } from "./Task.data";
const props = defineProps({
  modelRef: {
    type: Object as PropType<TaskForm>,
    required: true,
  },
});
const processing = computed(() => {
  return ![0, 100].includes(props.modelRef.progress);
});
</script>
<style lang="css" scoped>
.progress-wrap {
  position: relative;
  width: 200px;
  height: 30px;
}
.progress {
  position: absolute;
}
.other {
  display: flex;
  width: 100%;
  justify-content: space-between;
  position: absolute;
  top: 30px;
}
.other .eta {
  margin-left: 20px;
}
</style>
