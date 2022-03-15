<template>
  <imp-modal ref="ImpModalRef" title="添加任务">
    <n-form :model="modelRef" ref="formRef">
      <n-form-item label="请输入视频地址">
        <n-input v-model:value="validUrl" />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space>
        <n-button type="primary" @click="handleSubmit()">保存</n-button>
        <n-button @click="close()">返回</n-button>
      </n-space>
    </template>
  </imp-modal>
</template>
<script lang="ts" setup>
import ImpModal from "@render/components/global/ImpModal.vue";
import { onMounted, ref } from "vue";
import {
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NButton,
  NInputGroup,
} from "naive-ui";
import { TaskForm } from "./Task.data";
import { db } from "@render/db";
import { serialize } from "@common/utils";
import dayjs from "dayjs";
import { useFileStore } from "@render/store/modules/file";
import { useIpc } from "@render/plugins";
import { nanoid } from "nanoid";
import { EVENTS } from "@common/events";

const emit = defineEmits(["load-page"]);

// useIpc
const ipc = useIpc();
const fileStore = useFileStore();
// refs
const ImpModalRef = ref();
// ref
const validUrl = ref();
const modelRef = ref(new TaskForm());

// mounted
onMounted(() => {
  //
});
// methods
const open = (row?: TaskForm) => {
  if (row) {
    modelRef.value.mergeProperties(row);
  } else {
    modelRef.value = new TaskForm();
  }
  ImpModalRef.value.showModal = true;
};
const handleSubmit = () => {
  modelRef.value.updatedAt = +dayjs();
  const form = serialize(modelRef.value);
  db.configs.add(form);
  ImpModalRef.value.showModal = false;
};
const close = () => {
  modelRef.value = new TaskForm();
  ImpModalRef.value.showModal = false;
  emit("load-page");
};
defineExpose({
  open,
});
</script>
