import path from "path";
import { log } from "../utils.mjs";
import {
  GoogleDriveMimeTypeMap,
  DefaultGoogleDriveExportType,
} from "./config.mjs";

export const isGoogleDriveExportable = ({ mimeType }) =>
  Object.prototype.hasOwnProperty.call(GoogleDriveMimeTypeMap, mimeType);
export const getDriveExtension = ({ mimeType, name }) => {
  log("\n\n\n\n", { mimeType, name });
  if (
    !Object.prototype.hasOwnProperty.call(GoogleDriveMimeTypeMap, mimeType) ||
    !Object.prototype.hasOwnProperty.call(
      DefaultGoogleDriveExportType,
      mimeType
    )
  )
    throw new Error(`Unknown mimeType: <${mimeType}>`);

  const exportOptions = GoogleDriveMimeTypeMap[mimeType];

  const nameExt = path.parse(name).ext;
  if (nameExt) {
    const optionForExtension = exportOptions.find(
      ({ extension }) => "." + extension === nameExt
    );
    if (optionForExtension)
      return { ...optionForExtension, hasExtension: true };
  }

  const defaultOption = DefaultGoogleDriveExportType[mimeType];

  return exportOptions[defaultOption];
};
