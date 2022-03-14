import { CommonDTO } from "@common/dto";
import { IConfig } from "@render/db";

export class ConfigForm extends CommonDTO implements IConfig {
  id?: number;
  updatedAt: number;
  proxy = "";
  dist = "";
  ignoreError = false;
  abortOnError = false;
  dumpUserAgent = false;
  ignoreConfig = false;
  socketTimeout = -1;
}
