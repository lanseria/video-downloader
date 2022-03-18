<template>
  <n-spin :show="loading">
    <template #description>
      {{ progressStr }}
    </template>
    <imp-page-container>
      <n-result
        :status="checkExec.youtubedl ? 'success' : 'error'"
        :title="checkExec.youtubedl ? '正常' : '缺失'"
        :description="checkExec.youtubedl ? '有可执行文件' : '缺失可执行文件'"
      >
        <template #footer>
          <n-button @click="handleDownload()">手动下载 youtubedl</n-button>
        </template>
      </n-result>
    </imp-page-container></n-spin
  >
</template>
<script lang="ts" setup>
import { EVENTS } from "@common/events";
import { NResult, NButton, NSpin } from "naive-ui";
import ImpPageContainer from "@render/components/global/ImpPageContainer.vue";
import { onMounted, reactive, ref } from "vue";
import { ipcInstance, useIpc } from "@render/plugins";
import { IpcResponseDTO } from "@common/dto";
// useIpc
const ipc = useIpc();
// ref
const loading = ref(false);
const progressStr = ref("加载中");
const checkExec = reactive({
  youtubedl: false,
});
// mounted
onMounted(() => {
  ipc.on(EVENTS.REPLY_EXEC_PRELOAD, (res: IpcResponseDTO<boolean>) => {
    loading.value = false;
    if (res.data) {
      checkExec.youtubedl = res.data;
    } else {
      window.$message.warning(res.error);
    }
  });
  ipc.on(EVENTS.REPLY_EXEC_DOWNLOAD, (res: IpcResponseDTO<string>) => {
    if (res.data) {
      progressStr.value = res.data;
    } else {
      window.$message.warning(res.error);
    }
  });
  //
  loading.value = true;
  progressStr.value = "加载中";
  ipcInstance.send(EVENTS.EXEC_PRELOAD);
});
// methods
const handleDownload = () => {
  loading.value = true;
  ipcInstance.send(EVENTS.EXEC_DOWNLOAD);
};
</script>
