import * as log from "../log";
import { relative } from "path";
import { promises } from "fs";
import { prepareWriteTarget } from "./support/utils";
import type { TransformResult, Transformer } from ".";
import { transformFile } from "@swc/core";

export function match(filename: string): boolean {
  return /\.ts$/.test(filename);
}

export const process: Transformer = async (filename, context): Promise<TransformResult> => {
  if (/\.d\.ts$/.test(filename)) {
    return {};
  }

  const relpath = relative(context.srcDir, filename);
  log.prepare(relpath);

  const content = (
    await transformFile(filename, {
      sourceMaps: false
    })
  ).code;

  const destPath = await (await prepareWriteTarget(filename, context)).replace(/\.ts$/, ".js");
  await promises.writeFile(destPath, content, "utf-8");

  log.processed(relpath);
  return {};
};
