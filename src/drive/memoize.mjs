import { createCachedFunction } from "../utils.mjs";
import { drive, createDriveFolder__, traverseFolder__ } from "./drive.mjs";

export const driveFilesList = (() => {
  const cachedDriveFilesList = createCachedFunction((...args) =>
    drive.files.list(...args)
  );

  return async (...args) => {
    const res = await cachedDriveFilesList(...args);

    return res.data.files ?? [];
  };
})();

export const driveFilesGet = (() => {
  const cachedDriveFilesGet = createCachedFunction((...args) =>
    drive.files.get(...args)
  );

  return async (...args) => {
    const res = await cachedDriveFilesGet(...args);

    return res;
  };
})();

export const driveFilesExport = (() => {
  const cachedDriveFilesExport = createCachedFunction((...args) =>
    drive.files.export(...args)
  );

  return async (...args) => {
    const res = await cachedDriveFilesExport(...args);

    return res;
  };
})();

export const driveFilesCreate = (() => {
  const cachedDriveFilesCreate = createCachedFunction((...args) =>
    drive.files.create(...args)
  );

  return async (...args) => {
    const res = await cachedDriveFilesCreate(...args);

    return res;
  };
})();

export const createDriveFolder = (() => {
  const cachedCreateDriveFolder = createCachedFunction((...args) =>
    createDriveFolder__(...args)
  );

  return async (...args) => {
    const res = await cachedCreateDriveFolder(...args);

    return res;
  };
})();

export const traverseFolder = (() => {
  const cachedTraverseFolder = createCachedFunction((...args) =>
    traverseFolder__(...args)
  );

  return async (...args) => {
    const res = await cachedTraverseFolder(...args);

    return res;
  };
})();
