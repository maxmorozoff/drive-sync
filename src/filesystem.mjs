import fs from "fs";
import path from "path";

export const getAllFilenames = (dirPath, arrayOfFiles = []) => {
  if (!dirPath) throw new Error("dirPath is undefined");
  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      // log(file);
      arrayOfFiles.push(file);

      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFilenames(path.join(dirPath, file), arrayOfFiles);
      }
    }

    return arrayOfFiles;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return [];
  }
};

export const findAllFilesByName = (dirPath, filename, arrayOfFiles = []) => {
  if (!dirPath) throw new Error("dirPath is undefined");
  if (!filename) throw new Error("filename is undefined");
  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      // log(file);
      const filePath = path.join(dirPath, file);
      if (file === filename) arrayOfFiles.push(filePath);

      if (fs.statSync(filePath).isDirectory()) {
        arrayOfFiles = findAllFilesByName(filePath, filename, arrayOfFiles);
      }
    }

    return arrayOfFiles;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return [];
  }
};
