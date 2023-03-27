import path from "path";
import { getAllFilenames } from "./filesystem.mjs";
import { log } from "./utils.mjs";
import {
  drive,
  downloadMissingFiles,
  uploadMissingFiles,
  dangerouslyPurgeServiceAccountsFiles,
  driveFilesList,
} from "./drive/index.mjs";

export const getLocalFilesList = (dirPath) =>
  getAllFilenames(dirPath, [path.basename(dirPath)]);

export const compareLocalWithDrive = (localList = [], driveList = []) => {
  // log({ driveList, localList });
  const toUploadList = [...localList],
    toNotDownloadIndexes = [];
  const compareNamesWithoutExt = (n1, n2) =>
    path.parse(n1).name === path.parse(n2).name;
  const isGoogleFile = (f) =>
    f.mimeType.startsWith("application/vnd.google-apps.");

  for (const [driveIndex, driveFile] of driveList.entries()) {
    if (driveFile.name === "Untitled") throw new Error("name is Untitled");

    // log('\ndriveFile.name', driveFile, driveFile.name);
    const localIndex = isGoogleFile(driveFile)
      ? toUploadList.findIndex((name) =>
          compareNamesWithoutExt(name, driveFile.name)
        )
      : toUploadList.indexOf(driveFile.name);

    if (localIndex >= 0) {
      toUploadList.splice(localIndex, 1);
      toNotDownloadIndexes.push(driveIndex);
    }
  }

  const toDownloadIndexes = driveList
    .map((_, i) => i)
    .filter((v) => toNotDownloadIndexes.indexOf(v) < 0);
  const toDownloadList = driveList.filter(
    (_, i) => toDownloadIndexes.indexOf(i) >= 0
  );
  const toDownloadWithDuplicates = toDownloadList.length
    ? driveList.reduce(
        (prev, curr) =>
          prev.every(
            (v) =>
              (isGoogleFile(v)
                ? compareNamesWithoutExt(v.name, curr.name)
                : v.name === curr.name) && v.id !== curr.id
          )
            ? [...prev, curr]
            : prev,
        toDownloadList
      )
    : [];
  const toDownload = toDownloadWithDuplicates;

  const toUpload = localList.filter((v) => toUploadList.indexOf(v) >= 0);

  return { toDownload, toUpload };
};

export const sync = async ({ folderId, dirPath }) => {
  // return dangerouslyPurgeServiceAccountsFiles(true)
  const reqDriveList = driveFilesList(/* { fileId: folderId } */);

  // const reqDriveList = drive.files.list({ fileId: folderId,fields:'files(kind,mimeType,id,name,trashed)' });
  const localList = getLocalFilesList(dirPath);
  const driveList = await reqDriveList;
  log("%o", driveList);

  const diff = compareLocalWithDrive(localList, driveList);
  log('%o', diff);
  // console.log("%o", diff);

  const downloadPromise = downloadMissingFiles(diff, { folderId, dirPath });
  const uploadPromise = uploadMissingFiles(diff, { folderId, dirPath });

  const res = await Promise.all([uploadPromise, downloadPromise]);
  log("%o", { res });
};
