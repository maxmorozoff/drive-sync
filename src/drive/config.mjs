export const MimeTypesExtensions = {
  // https://developers.google.com/drive/api/guides/ref-export-formats
  // [...$$('.devsite-table-wrapper tr > td:nth-child(1)')].map(el=>el.innerText=`/* ${el.innerText} */`)
  // [...$$('.devsite-table-wrapper tr > td:nth-child(2)')].map(el=>el.innerText=`/* ${el.innerText} */`)
  // [...$$('.devsite-table-wrapper tr > td:nth-child(3)')].map(el=>el.innerText=`'${el.innerText}':  `)
  // [...$$('.devsite-table-wrapper tr > td:nth-child(4)')].map(el=>el.innerText=`'${el.innerText}',  `)
  /**
   *? Documents */
  /* Microsoft Word */
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  /* OpenDocument */
  "application/vnd.oasis.opendocument.text": ".odt",
  /* Rich Text */
  "application/rtf": ".rtf",
  /* PDF */
  "application/pdf": ".pdf",
  /* Plain Text */
  "text/plain": ".txt",
  /* Web Page (HTML) */
  "application/zip": ".zip",
  /* EPUB */
  "application/epub+zip": ".epub",

  /**
   *? Spreadsheets */
  /* Microsoft Excel */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  /* OpenDocument */
  "application/x-vnd.oasis.opendocument.spreadsheet": ".ods",
  /* PDF */
  "application/pdf": ".pdf",
  /* Web Page (HTML) */
  "application/zip": ".zip",
  /* Comma Separated Values (first-sheet only) */
  "text/csv": ".csv",
  /* Tab Separated Values (first-sheet only) */
  "text/tab-separated-values": ".tsv",

  /**
   *? Presentations */
  /* Microsoft PowerPoint */
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
  /* ODP */
  "application/vnd.oasis.opendocument.presentation": ".odp",
  /* PDF */
  "application/pdf": ".pdf",
  /* Plain Text */
  "text/plain": ".txt",
  /* JPEG (first-slide only) */
  "image/jpeg": ".jpg",
  /* PNG (first-slide only) */
  "image/png": ".png",
  /* Scalable Vector Graphics (first-slide only) */
  "image/svg+xml": ".svg",

  /**
   *? Drawings */
  /* PDF */
  "application/pdf": ".pdf",
  /* JPEG */
  "image/jpeg": ".jpg",
  /* PNG */
  "image/png": ".png",
  /* Scalable Vector Graphics */
  "image/svg+xml": ".svg",

  /**
   *? Apps Script */
  /* JSON */
  "application/vnd.google-apps.script+json": ".json",
};

export const GoogleDriveMimeTypeMap = {
  "application/vnd.google-apps.document": [
    {
      extension: "docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    { extension: "pdf", mimeType: "application/pdf" },
    { extension: "odt", mimeType: "application/vnd.oasis.opendocument.text" },
    { extension: "txt", mimeType: "text/plain" },
    { extension: "zip", mimeType: "application/zip" },
    { extension: "csv", mimeType: "text/csv" },
    { extension: "epub", mimeType: "application/epub+zip" },
    { extension: "rtf", mimeType: "application/rtf" },
  ],
  "application/vnd.google-apps.spreadsheet": [
    {
      extension: "xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    { extension: "pdf", mimeType: "application/pdf" },
    {
      extension: "ods",
      mimeType: "application/x-vnd.oasis.opendocument.spreadsheet",
    },
    { extension: "csv", mimeType: "text/csv" },
  ],
  "application/vnd.google-apps.presentation": [
    {
      extension: "pptx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
    { extension: "pdf", mimeType: "application/pdf" },
    {
      extension: "odp",
      mimeType: "application/vnd.oasis.opendocument.presentation",
    },
  ],
  "application/vnd.google-apps.drawing": [
    { extension: "png", mimeType: "image/png" },
    { extension: "jpeg", mimeType: "image/jpeg" },
    { extension: "svg", mimeType: "image/svg+xml" },
    { extension: "pdf", mimeType: "application/pdf" },
  ],
  "application/vnd.google-apps.script": [
    { extension: "json", mimeType: "application/vnd.google-apps.script+json" },
  ],
};

export const DefaultGoogleDriveExportType = {
  "application/vnd.google-apps.document": 0,
  "application/vnd.google-apps.spreadsheet": 0,
  "application/vnd.google-apps.presentation": 0,
  "application/vnd.google-apps.drawing": 0,
  "application/vnd.google-apps.script": 0,
};
