import * as http from "http";
import * as https from "https";
import { URL } from "url";

interface FileInfo {
  mimeType: string | null;
  size: number | null;
}

/**
 * Gets the mime type and size of a file from a URL without downloading the whole file.
 * @param url The URL of the file.
 * @returns A Promise that resolves with an object containing the mimeType and size, or null for each if not available.
 */
export function getFileInfoFromUrl(url: string): Promise<FileInfo> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "https:" ? https : http;

    const options = {
      method: "HEAD",
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
    };

    const req = client.request(options, (res) => {
      const mimeType = res.headers["content-type"] || null;
      const contentLength = res.headers["content-length"];
      const size = contentLength ? parseInt(contentLength, 10) : null;

      // Consume the response stream to avoid memory leaks, even though it's empty for HEAD requests
      res.resume();
      console.log(res.headers);
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        // Handle redirects or other non-success status codes if necessary,
        // but for simply getting headers, a non-2xx status might mean the resource isn't directly accessible.
        // For this example, we'll resolve with nulls for non-2xx status codes.
        console.warn(
          `HEAD request to ${url} returned status code ${res.statusCode}`,
        );
        resolve({ mimeType: null, size: null });
        return;
      }

      resolve({ mimeType, size });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.end();
  });
}
