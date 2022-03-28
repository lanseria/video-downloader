<template>
  <n-button
    :type="isHovered ? 'primary' : 'default'"
    tertiary
    size="small"
    :disabled="hoverMap[hoverNum].disabled"
    v-element-hover="onHover"
    @click="
      () => {
        hoverMap[hoverNum].click();
      }
    "
  >
    {{ btnText }}
  </n-button>
</template>
<script lang="ts" setup>
import { ipcInstance } from "@render/plugins";
import { ITask } from "@render/db";
import { NButton } from "naive-ui";
import { computed, PropType, ref } from "vue";
import { vElementHover } from "@vueuse/components";
import { EVENTS } from "@common/events";
import { serialize } from "@common/utils";
const props = defineProps({
  row: {
    type: Object as PropType<ITask>,
    required: true,
  },
});
const hoverMap = {
  1: {
    0: "待下载",
    1: "下载=>",
    disabled: false,
    click: () => {
      const row = { ...props.row };
      console.log(row);
      row.pending = true;
      ipcInstance.send(EVENTS.DOWNLOAD_FILE, serialize(row));
    },
  },
  2: {
    0: "获取信息中",
    1: "获取信息中",
    disabled: true,
    click: () => {
      return;
    },
  },
  3: {
    0: "下载中..",
    1: "暂停下载",
    disabled: false,
    click: () => {
      return;
    },
  },
  4: {
    0: "暂停中..",
    1: "继续下载",
    disabled: false,
    click: () => {
      const row = { ...props.row };
      row.pending = true;
      ipcInstance.send(EVENTS.DOWNLOAD_FILE, row);
    },
  },
  5: {
    0: "完成下载",
    1: "打开目录",
    disabled: false,
    click: () => {
      const row = { ...props.row };
      ipcInstance.send(EVENTS.OPEN_FILE_IN_DIR, row);
    },
  },
};
const isHovered = ref(false);
const hoverNum = computed(() => {
  if (props.row.progress === 0) {
    if (props.row.pending === false) {
      return 1;
    } else {
      return 2;
    }
  } else if (props.row.progress > 0 && props.row.progress < 100) {
    if (props.row.pending === false) {
      return 3;
    } else {
      return 4;
    }
  } else {
    return 5;
  }
});
const btnText = computed(() => {
  return hoverMap[hoverNum.value][+isHovered.value];
});

function onHover(state: boolean) {
  isHovered.value = state;
}
</script>
