import fs from "fs";
import path from "path";
import google from "@googleapis/drive";

import { auth } from "./auth.mjs";
import { findAllFilesByName } from "../filesystem.mjs";
import { log } from "../utils.mjs";
import { isGoogleDriveExportable, getDriveExtension } from "./helpers.mjs";
import {
  driveFilesCreate,
  driveFilesGet,
  driveFilesList,
  traverseFolder,
  driveFilesExport,
  createDriveFolder,
} from "./memoize.mjs";

export const drive = google.drive({
  version: "v3",
  auth,
});

export const createDriveFolder__ = async (name, parents) => {
  if (!name || !parents || !parents.length)
    throw new Error("createDriveFolder error: wrong arguments");
  // console.log(`export const createDriveFolder__ = async (${name}, ${parents})`);
  const res = await driveFilesCreate({
    fields: "id",
    resource: {
      parents,
      name,
      mimeType: "application/vnd.google-apps.folder",
    },
  }).catch((err) => console.log(err));
  // console.log("createDriveFolder__", res.data);
  return res.data;
};

export async function traverseFolder__(
  folderId,
  path = "",
  treeMap = new Map()
) {
  if (!folderId) throw new Error("folderId is undefined");
  log("traverseFolder:", path, folderId);

  if (treeMap.size === 0) {
    const { data: folder } = await driveFilesGet({ fileId: folderId });
    treeMap.set(path, folder);
  }

  const files = await driveFilesList({
    q: `'${folderId}' in parents and trashed = false`,
  });
  // log({data})
  log("traverseFolder::files%o", { files });
  const promises = files.map(async (file, i) => {
    const { mimeType, kind, id, name } = file;
    log("___traverseFolder:", i);
    const filePath = `${path}/${name}`;
    // treeMap.set(filePath, file);
    if (name === "Untitled") throw new Error("name is Untitled");

    if (mimeType == "application/vnd.google-apps.folder") {
      const folder = await traverseFolder__(id, filePath, treeMap);
      treeMap = new Map([...treeMap, ...folder]);
      treeMap.set(filePath, file);
      log("%s\n%o", "application/vnd.google-apps.folder " + name, { treeMap });
    } else if (isGoogleDriveExportable(file)) {
      // downloadFile(id);
      const {
        extension,
        mimeType: exportMimeType,
        hasExtension,
      } = getDriveExtension(file);
      treeMap.set(hasExtension ? filePath : `${filePath}.${extension}`, {
        ...file,
        extension,
        exportMimeType,
      });
    } else {
      treeMap.set(filePath, file);
    }
    return treeMap;
  });
  const results = await Promise.all(promises);
  log("RESULTS:::%o\n\n%o\n\nkeys::%o", results, treeMap, treeMap.keys());
  return treeMap;
}

const downloader = ({ filePath, res }) => {
  function createMissingDirectories(dirPath) {
    const dirname = path.dirname(dirPath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    createMissingDirectories(dirname);
    fs.mkdirSync(dirname);
  }
  return new Promise((resolve, reject) => {
    console.log(`\nWriting to ${filePath}`);
    createMissingDirectories(filePath);
    const dest = fs.createWriteStream(filePath);
    let progress = 0;

    res.data
      .on("end", () => {
        console.log("Done downloading file.");
        resolve(filePath);
      })
      .on("error", (err) => {
        console.error("Error downloading file.");
        reject(err);
      })
      .on("data", (d) => {
        progress += d.length;
        if (process.stdout.isTTY) {
          process.stdout.clearLine(-1);
          process.stdout.cursorTo(0);
          process.stdout.write(`Downloaded ${progress} bytes`);
        }
      })
      .pipe(dest);
  });
};

export const getOrExportFile = async (filePath, file, overwrite = false) => {
  log("getOrExportFile", filePath, file, overwrite);

  if (!overwrite && fs.existsSync(filePath)) {
    log("File already exists", filePath);
    return;
  }
  if (file?.exportMimeType) {
    // export
    // https://github.com/googleapis/google-api-nodejs-client/blob/bd0accce744ddd55abdd400efbe2bccd96dc6cdf/samples/drive/export.js#L24
    const res = await driveFilesExport(
      {
        fileId: file.id,
        mimeType: file.exportMimeType,
      },
      { responseType: "stream" }
    );
    return downloader({ filePath, res });
  } else {
    // get
    const res = await driveFilesGet(
      {
        fileId: file.id,
        alt: "media",
      },
      { responseType: "stream" }
    );
    return downloader({ filePath, res });
  }
};

export const uploadFile = async (filePath, parsedPath, parent) => {
  if (!filePath || !parent || !parsedPath)
    throw new Error(
      `uploadFile error: wrong arguments\n${{ filePath, parent }}`
    );
  const fileSize = fs.statSync(filePath).size;
  const res = await driveFilesCreate(
    {
      requestBody: {
        // a requestBody element is required if you want to use multipart
        parents: [parent],
        name: parsedPath.base,
      },
      media: {
        body: fs.createReadStream(filePath),
      },
    },
    {
      // Use the `onUploadProgress` event from Axios to track the
      // number of bytes uploaded to this point.
      onUploadProgress: (evt) => {
        if (process.stdout.isTTY) {
          const progress = (evt.bytesRead / fileSize) * 100;
          process.stdout.clearLine(-1);
          process.stdout.cursorTo(0);
          process.stdout.write(`${Math.round(progress)}% complete`);
        }
      },
    }
  );
  return res;
};

export const downloadMissingFiles = async (
  { toDownload },
  { folderId, dirPath }
) => {
  if (!toDownload || !toDownload.length)
    return { message: "Nothing to download" };
  log("downloadMissingFiles");
  const tree = await traverseFolder(folderId, dirPath);
  const downloadingFiles = [];
  for await (const [filePath, file] of tree) {
    // const downloadedFile = await getOrExportFile(filePath, file);
    // log({ downloadedFile });
    downloadingFiles.push(getOrExportFile(filePath, file));
  }
  const downloadedFiles = await Promise.allSettled(downloadingFiles);
  console.log("%o", { downloadedFiles });

  log("TREE::%o", tree);
};

// Recursively create folders based on the given path
const createDriveFolders = async (tree, pathParts = [], parentFolder) => {
  if (pathParts.length === 0) {
    return parentFolder;
  }

  const folderName = pathParts.shift();

  // Check if folder already exists in parent folder
  const existingFolder = tree.get("./" + pathParts.join("/"));
  // const existingFolder = await findDriveFileByName(folderName, parentFolderId, 'application/vnd.google-apps.folder');
  if (existingFolder) {
    // If folder already exists, continue recursively creating subfolders
    return createDriveFolders(tree, pathParts, existingFolder);
  } else {
    // If folder does not exist, create it and continue recursively creating subfolders
    const folder = await createDriveFolder(folderName, parentFolder);
    return createDriveFolders(tree, pathParts, folder);
  }
};

export const findOrCreateParent = async (tree, filePath) => {
  console.log(
    "\n\nfindOrCreateParent = async (tree, filePath)",
    tree.size,
    filePath
  );

  const parsedPath2 = path.parse(filePath);
  if (!tree.has("./" + parsedPath2.dir)) {
    const pathParts = parsedPath2.dir
      .split(path.sep)
      .filter((part) => part !== "");
    let closestParentFolder = null;
    console.log("if (!tree.has('./' + parsedPath2.dir))\n%o", pathParts);

    const foldersToCreate = [];
    while (pathParts.length > 0) {
      const folderName = pathParts.pop();
      const folderPath = pathParts.join(path.sep);
      console.log(
        "while(%s > 0)\n<%s><%s>",
        pathParts.length,
        folderPath,
        folderName
      );

      foldersToCreate.push({ folderName, folderPath });

      const doesExist = tree.has("./" + folderPath);
      if (doesExist) {
        closestParentFolder = tree.get("./" + folderPath);
        break;
      }
    }

    console.log("END_WHILE", { foldersToCreate, closestParentFolder });

    while (foldersToCreate.length > 0) {
      const { folderName, folderPath } = foldersToCreate.pop();
      console.log(
        "while(foldersToCreate.lenght[%s] > 0)\n<%s><%s>",
        foldersToCreate.length,
        folderPath,
        folderName
      );

      const res = await createDriveFolder(folderName, [closestParentFolder.id]);
      tree.set("./" + folderPath + "/" + folderName, res);
      closestParentFolder = res;
    }

    return { parent: closestParentFolder, parsedPath: parsedPath2 };
  }

  const parent = tree.get("./" + parsedPath2.dir);

  return { parent, parsedPath: parsedPath2 };
};

export const uploadMissingFiles = async (
  { toUpload },
  { folderId, dirPath }
) => {
  if (!toUpload || !toUpload.length) return { message: "Nothing to upload" };
  const treePromise = traverseFolder(folderId, dirPath);
  const toUploadPaths = [
    ...new Set(toUpload.map((f) => findAllFilesByName(dirPath, f)).flat()),
  ];
  const tree = await treePromise;
  console.log("Map::keys()%o", tree.keys());
  const uploadingFiles = [];
  for await (const filePath of toUploadPaths) {
    if (fs.statSync(filePath).isDirectory()) continue;
    const { parent, parsedPath } = await findOrCreateParent(tree, filePath);
    console.log("\n\nawait findOrCreateParent(tree, filePath)", filePath, {
      parent,
      parsedPath,
    });
    uploadingFiles.push(uploadFile(filePath, parsedPath, parent.id));
  }
  const uploadedFiles = await Promise.allSettled(uploadingFiles);
  console.log({ uploadedFiles, tree });

  return toUploadPaths;
};

export const dangerouslyPurgeServiceAccountsFiles = async (
  areYouShure = false
) => {
  if (!areYouShure)
    throw new Error(
      "You are not shure to dangerously purge service account's files"
    );
  const driveList = await driveFilesList(/* { fileId: folderId } */);
  const deletePromises = [];
  for (const driveFile of driveList) {
    console.warn("Deleting '%s'....", driveFile.name);
    deletePromises.push(drive.files.delete({ fileId: driveFile.id }));
  }
  const res = await Promise.allSettled(deletePromises);
  console.log(res);
};

// todo file locking
// https://developers.google.com/drive/api/guides/file-locking
