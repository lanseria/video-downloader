import { IpcResponse } from "./types";
import { mergeProperties } from "./utils";

export class CommonDTO {
  mergeProperties(obj?: IObj) {
    if (obj) {
      Object.assign(this, mergeProperties(this, obj));
    }
  }
}

export class IpcResponseDTO<T> extends CommonDTO {
  data: T;
  error: string = null;
  constructor(data: T | null, error: string | null) {
    super();
    this.data = data;
    this.error = error;
  }
}

export class UploadMedia implements UploadMediaData {
  uploadId: string = "";
  category: CodecType = "";
  rawPath: string = "";
  audioPath: string = "";
  poster: string = "";
  step = -1;
  totalStep = 4;
  finished = false;
  msg = "";
  constructor(obj: IObj) {
    if (obj) {
      Object.assign(this, mergeProperties(this, obj));

      if (this.category === "audio") {
        this.totalStep = 3;
      } else if (this.category === "video") {
        this.totalStep = 4;
      }
      // 失败获取成功结束
      if (this.step === -1) {
        this.step = this.totalStep;
      }
      if (this.step === this.totalStep) {
        this.finished = true;
      }
    }
  }
}

export class ImportJson implements ImportData {
  id: string = "";
  data: string = "";
  constructor(obj: Partial<ImportData>) {
    if (obj) {
      Object.assign(this, mergeProperties(this, obj));
    }
  }
}
export class OpenedFolderData implements OpenedFolder {
  id: string = "";
  path: string = "";
  constructor(obj: Partial<ImportData>) {
    if (obj) {
      Object.assign(this, mergeProperties(this, obj));
    }
  }
}
