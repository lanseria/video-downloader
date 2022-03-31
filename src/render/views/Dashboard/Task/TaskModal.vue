<template>
  <imp-modal ref="ImpModalRef" title="添加任务">
    <n-form :model="modelRef" ref="formRef">
      <n-form-item label="请输入视频地址">
        <n-input-group>
          <n-input
            v-model:value="validUrl"
            :disabled="validLoading"
            @change="handleChange"
          />
          <n-button
            type="primary"
            ghost
            :loading="validLoading"
            :disabled="validLoading"
            @click="handleChange(validUrl)"
          >
            刷新
          </n-button>
        </n-input-group>
      </n-form-item>
    </n-form>
    <task-item :model-ref="modelRef"></task-item>
    <template #footer>
      <n-space>
        <n-button
          type="primary"
          @click="handleSubmit()"
          :disabled="validLoading"
          >添加</n-button
        >
        <n-button @click="handleConfig()" :disabled="validLoading"
          >修改配置</n-button
        >
        <n-button @click="close()" :disabled="validLoading">返回</n-button>
      </n-space>
    </template>
  </imp-modal>
  <config-modal ref="ConfigModalRef" @load-page="onLoadPage"></config-modal>
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
import { useIpc } from "@render/plugins";
import { EVENTS } from "@common/events";
import { ipcInstance } from "@render/plugins";
import { YtResponse } from "youtube-dl-exec";
import { IpcResponseDTO } from "@common/dto";
import TaskItem from "./TaskItem.vue";
import ConfigModal from "../Config/ConfigModal.vue";
import { nanoid } from "nanoid";

const emit = defineEmits(["load-page"]);

// useIpc
const ipc = useIpc();
// refs
const ImpModalRef = ref();
// refs
const ConfigModalRef = ref();
// ref
const validUrl = ref("");
const validLoading = ref(false);
const modelRef = ref(new TaskForm());
const getConfig = async () => {
  const configs = await db.configs.orderBy("updatedAt").reverse().toArray();
  if (configs.length >= 1) {
    const config = configs[0];
    return config;
  } else {
    throw new Error("还没有配置设置页面！");
  }
};
// mounted
onMounted(() => {
  ipc.on(EVENTS.REPLY_DOWNLOAD_INFO, (res: IpcResponseDTO<YtResponse>) => {
    validLoading.value = false;
    if (res.data) {
      const { data } = res;
      modelRef.value.mergeProperties(data);
      modelRef.value.id = nanoid();
    } else {
      window.$message.warning(res.error);
    }
  });
});
// methods
const handleChange = (url: string) => {
  validLoading.value = true;
  ipcInstance.send(EVENTS.DOWNLOAD_INFO, {
    ...modelRef.value.config,
    url,
  });
};
const open = async (row?: TaskForm) => {
  try {
    if (row) {
      modelRef.value.mergeProperties(row);
    } else {
      validUrl.value = "";
      modelRef.value = new TaskForm();
      modelRef.value.config = await getConfig();
    }
    ImpModalRef.value.showModal = true;
  } catch (error) {
    ImpModalRef.value.showModal = false;
    window.$message.warning(error.toString());
  }
};
const handleConfig = () => {
  ConfigModalRef.value.open(modelRef.value.config);
};
const onLoadPage = (data) => {
  modelRef.value.config = data;
};
const handleSubmit = () => {
  modelRef.value.updatedAt = +dayjs();
  const form = serialize(modelRef.value);
  db.tasks.add(form);
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
