<template>
  <imp-page-container>
    <div class="data-table-header">
      <n-space align="center">
        <n-button type="primary" @click="handleAdd()">
          <template #icon>
            <n-icon>
              <add-outline-icon />
            </n-icon>
          </template>
          新增</n-button
        >
        <n-button @click="handleImport()">
          <template #icon>
            <n-icon>
              <arrow-down-circle-outline-icon />
            </n-icon>
          </template>
          导入</n-button
        >
        <n-button
          @click="handleExport()"
          :loading="saveLoading"
          :disabled="saveLoading"
        >
          <template #icon>
            <n-icon>
              <arrow-up-circle-outline-icon />
            </n-icon>
          </template>
          导出</n-button
        >
      </n-space>
    </div>

    <n-data-table
      :columns="columns"
      :data="data"
      :pagination="false"
      :bordered="false"
    ></n-data-table>
  </imp-page-container>
  <task-modal ref="TaskModalRef"></task-modal>
</template>
<script lang="ts" setup>
import ImpPageContainer from "@render/components/global/ImpPageContainer.vue";
import { ref, h, onMounted, computed } from "vue";
import {
  AddOutline as AddOutlineIcon,
  ArrowDownCircleOutline as ArrowDownCircleOutlineIcon,
  ArrowUpCircleOutline as ArrowUpCircleOutlineIcon,
} from "@vicons/ionicons5";
import { NSpace, NButton, NDataTable, NIcon } from "naive-ui";
import { db, ITask } from "@render/db";
import { useObservable } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { Observable } from "rxjs";
import TaskModal from "./TaskModal.vue";
const columns = [
  {
    title: "id",
    key: "id",
  },
  {
    title: "名称",
    key: "name",
  },
  {
    title: "进度",
    key: "progress",
  },
  {
    title: "Action",
    key: "actions",
    render: (row: ITask, rowIndex: number) => {
      return h(NSpace, null, {
        default: () => {
          const spaceList = [
            h(
              NButton,
              {
                tertiary: true,
                size: "small",
              },
              { default: () => "暂停" }
            ),
            h(
              NButton,
              {
                tertiary: true,
                size: "small",
              },
              { default: () => "删除" }
            ),
          ];
          return spaceList;
        },
      });
    },
  },
];
// refs
const TaskModalRef = ref();
// ref
const saveLoading = ref(false);
const data = useObservable<ITask[]>(
  liveQuery(() =>
    db.tasks.orderBy("updatedAt").reverse().toArray()
  ) as unknown as Observable<ITask[]>
);
const handleAdd = () => {
  TaskModalRef.value.open();
};
const handleImport = () => {
  //
};
const handleExport = () => {
  //
};
</script>

<style lang="css" scoped>
.data-table-header {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}
</style>
