<template>
  <imp-modal ref="ImpModalRef" title="添加配置">
    <n-form :model="modelRef" ref="formRef">
      <n-form-item path="proxy" label="代理地址">
        <n-input v-model:value="modelRef.proxy" />
      </n-form-item>
      <n-form-item path="dist" label="保存目录">
        <n-input-group>
          <n-input
            v-model:value="modelRef.dist"
            placeholder="请打开目录"
            disabled
          />
          <n-button type="primary" ghost @click="handleOpenFolder()">
            打开目录
          </n-button>
        </n-input-group>
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
import { ConfigForm } from "./Config.data";
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
const modelRef = ref(new ConfigForm());

// mounted
onMounted(() => {
  ipc.on(EVENTS.REPLY_OPEN_DIST_FOLDER, (obj: OpenedFolder) => {
    console.log(obj);
    modelRef.value.dist = obj.path;
  });
});
// methods
const handleOpenFolder = () => {
  fileStore.selectFolder(nanoid());
};
const open = (row?: ConfigForm) => {
  if (row) {
    modelRef.value.mergeProperties(row);
  } else {
    modelRef.value = new ConfigForm();
  }
  ImpModalRef.value.showModal = true;
};
const handleSubmit = () => {
  modelRef.value.updatedAt = +dayjs();
  ImpModalRef.value.showModal = false;
  emit("load-page", modelRef.value);
};
const close = () => {
  modelRef.value = new ConfigForm();
  ImpModalRef.value.showModal = false;
};
defineExpose({
  open,
});
</script>
