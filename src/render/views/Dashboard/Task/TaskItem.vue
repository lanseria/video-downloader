<template>
  <n-space justify="space-between" style="width: 550px">
    <div class="img-box">
      <img
        width="200"
        :src="modelRef.thumbnail"
        referrerpolicy="no-referrer"
        object-fit="contain"
      />
      <span>{{ duration }}</span>
    </div>
    <n-space vertical justify="space-between" style="height: 100%">
      <div style="width: 335px">{{ modelRef.title }}</div>
      <div>{{ size }}</div>
    </n-space>
  </n-space>
</template>
<script lang="ts" setup>
import { convertBytes } from "@main/utils";
import { NSpace } from "naive-ui";
import { computed, PropType } from "vue";
import { TaskForm } from "./Task.data";
import dayjs from "dayjs";
import Duration from "dayjs/plugin/duration";
dayjs.extend(Duration);
const props = defineProps({
  modelRef: {
    type: Object as PropType<TaskForm>,
    required: true,
  },
});
const size = computed(() => {
  return convertBytes(props.modelRef.filesize);
});
const duration = computed(() => {
  return dayjs.duration(props.modelRef.duration, "seconds").format("HH:mm:ss");
});
</script>
<style lang="css" scoped>
.img-box {
  position: relative;
  width: 200px;
  height: 120px;
}
.img-box img {
  position: absolute;
  width: 200px;
  height: 120px;
  top: 0;
  left: 0;
}
.img-box span {
  position: absolute;
  background-color: rgba(102, 102, 102, 0.8);
  padding: 0 10px;
  bottom: 0;
  right: 0;
}
</style>
