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
  <config-modal ref="ConfigModalRef" @load-page="onLoadPage"></config-modal>
</template>
<script lang="ts" setup>
import {
  AddOutline as AddOutlineIcon,
  ArrowDownCircleOutline as ArrowDownCircleOutlineIcon,
  ArrowUpCircleOutline as ArrowUpCircleOutlineIcon,
} from "@vicons/ionicons5";
import { NSpace, NButton, NDataTable, NIcon } from "naive-ui";
import { ref, h, onMounted, computed } from "vue";
import { Observable } from "rxjs";
import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";
import { db, IConfig } from "@render/db";
import { serialize } from "@common/utils";
import ConfigModal from "./ConfigModal.vue";
import ImpPageContainer from "@render/components/global/ImpPageContainer.vue";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { useFileStore } from "@render/store/modules/file";
import { useIpc } from "@render/plugins";
import IDBExportImport from "indexeddb-export-import";
import { EVENTS } from "@common/events";

// useIpc
const ipc = useIpc();
const fileStore = useFileStore();

const columns = [
  {
    title: "id",
    key: "id",
  },
  {
    title: "代理地址",
    key: "proxy",
  },
  {
    title: "保存目录",
    key: "dist",
  },
  {
    title: "Action",
    key: "actions",
    render: (row: IConfig, rowIndex: number) => {
      return h(NSpace, null, {
        default: () => {
          const spaceList = [
            h(
              NButton,
              {
                tertiary: true,
                size: "small",
                onClick: () => db.configs.delete(row.id!),
              },
              { default: () => "Delete" }
            ),
          ];
          if (rowIndex) {
            spaceList.push(
              h(
                NButton,
                {
                  secondary: true,
                  type: "primary",
                  size: "small",
                  onClick: () => {
                    row.updatedAt = +dayjs();
                    const form = serialize(row);
                    db.configs.put(form);
                  },
                },
                { default: () => "Select" }
              )
            );
          } else {
            spaceList.push(
              h(
                NButton,
                {
                  disabled: true,
                  type: "primary",
                  size: "small",
                  onClick: () => db.configs.delete(row.id!),
                },
                { default: () => "Selected" }
              )
            );
          }
          return spaceList;
        },
      });
    },
  },
];
// refs
const ConfigModalRef = ref();
const data = useObservable<IConfig[]>(
  liveQuery(() =>
    db.configs.orderBy("updatedAt").reverse().toArray()
  ) as unknown as Observable<IConfig[]>
);
// computed
const saveLoading = computed(() => {
  return fileStore.saveLoading;
});
// mouted
onMounted(() => {
  ipc.on(EVENTS.REPLY_SAVE_FILE, (filepath) => {
    window.$message.success(`导出成功: ${filepath}`);
  });
  ipc.on(EVENTS.REPLY_OPEN_IMPORT_FILE, (obj: ImportData) => {
    db.open().then(() => {
      const idbDatabase = db.backendDB();
      IDBExportImport.clearDatabase(idbDatabase, (err) => {
        if (!err) {
          // cleared data successfully
          IDBExportImport.importFromJsonString(idbDatabase, obj.data, (err) => {
            if (!err) {
              window.$message.success("导入成功, 请重新进入");
            }
          });
        }
      });
    });
  });
});
// methods
const onLoadPage = (data) => {
  const form = serialize(data);
  db.configs.add(form);
};
const handleAdd = () => {
  ConfigModalRef.value.open();
};
const handleImport = () => {
  fileStore.importFileDialog(nanoid());
};
const handleExport = () => {
  db.open().then(() => {
    const idbDatabase = db.backendDB();
    IDBExportImport.exportToJsonString(idbDatabase, (err, jsonString) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Exported as JSON: " + jsonString);
        const filename = `config-${+dayjs()}.json`;
        fileStore.saveFileDialog("导出数据", filename, JSON.parse(jsonString));
      }
    });
  });
};
</script>

<style lang="css" scoped>
.data-table-header {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}
</style>
