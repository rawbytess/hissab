import { z } from "zod";

/** Source of the File. */
export enum FileSource {
  SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED",
  UPLOADED = "UPLOADED",
  GENERATED = "GENERATED",
}
/** State for the lifecycle of a File. */
export enum FileState {
  STATE_UNSPECIFIED = "STATE_UNSPECIFIED",
  PROCESSING = "PROCESSING",
  ACTIVE = "ACTIVE",
  FAILED = "FAILED",
}
/** Status of a File that uses a common error model. */
export declare interface FileStatus {
  /** A list of messages that carry the error details. There is a common set of message types for APIs to use. */
  details?: Record<string, unknown>[];
  /** A list of messages that carry the error details. There is a common set of message types for APIs to use. */
  message?: string;
  /** The status code. 0 for OK, 1 for CANCELLED */
  code?: number;
}

/** A file uploaded to the API. */
export declare interface GeminiFile {
  /** The `File` resource name. The ID (name excluding the "files/" prefix) can contain up to 40 characters that are lowercase alphanumeric or dashes (-). The ID cannot start or end with a dash. If the name is empty on create, a unique name will be generated. Example: `files/123-456` */
  name?: string;
  /** Optional. The human-readable display name for the `File`. The display name must be no more than 512 characters in length, including spaces. Example: 'Welcome Image' */
  displayName?: string;
  /** Output only. MIME type of the file. */
  mimeType?: string;
  /** Output only. Size of the file in bytes. */
  sizeBytes?: string;
  /** Output only. The timestamp of when the `File` was created. */
  createTime?: string;
  /** Output only. The timestamp of when the `File` will be deleted. Only set if the `File` is scheduled to expire. */
  expirationTime?: string;
  /** Output only. The timestamp of when the `File` was last updated. */
  updateTime?: string;
  /** Output only. SHA-256 hash of the uploaded bytes. The hash value is encoded in base64 format. */
  sha256Hash?: string;
  /** Output only. The URI of the `File`. */
  uri?: string;
  /** Output only. The URI of the `File`, only set for downloadable (generated) files. */
  downloadUri?: string;
  /** Output only. Processing state of the File. */
  state?: FileState;
  /** Output only. The source of the `File`. */
  source?: FileSource;
  /** Output only. Metadata for a video. */
  videoMetadata?: Record<string, unknown>;
  /** Output only. Error status if File processing failed. */
  error?: FileStatus;
}

export const zFileUpload = z.object({
  name: z.string(),
  mimeType: z.string(),
  fileBuffer: z.instanceof(ArrayBuffer).optional(),
  url: z.string().optional(),
});

type ProviderFileUpload = {
  superbaseFile?: FileObject;
  geminiFile?: GeminiFile;
};

export type FileUpload = z.infer<typeof zFileUpload> & ProviderFileUpload;

export interface Bucket {
  id: string;
  name: string;
  owner: string;
  file_size_limit?: number;
  allowed_mime_types?: string[];
  created_at: string;
  updated_at: string;
  public: boolean;
}
export interface FileObject {
  name: string;
  bucket_id: string;
  owner: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
  buckets: Bucket;
}

export const supportedMimeTypes = [
  "video/x-flv",
  "video/quicktime",
  "video/mpeg",
  "video/mpegs",
  "video/mpgs",
  "video/mpg",
  "video/mp4",
  "video/webm",
  "video/wmv",
  "video/3gpp",
  "audio/x-aac",
  "audio/flac",
  "audio/mp3",
  "audio/m4a",
  "audio/mpeg",
  "audio/mpga",
  "audio/mp4",
  "audio/opus",
  "audio/pcm",
  "audio/wav",
  "audio/webm",
  "application/pdf",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
];
export const ALLOWED_MIME_TYPES = {
  "video/x-flv": [".flv"],
  "video/quicktime": [".mov"],
  "video/mpeg": [".mpeg", ".mpg", ".mpegs", ".mpgs"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
  "video/wmv": [".wmv"],
  "video/3gpp": [".3gp", ".3g2"],
  "audio/x-aac": [".aac"],
  "audio/flac": [".flac"],
  "audio/mp3": [".mp3"],
  "audio/m4a": [".m4a"],
  "audio/mpeg": [".mp3", ".mpeg", ".mpga"],
  "audio/mp4": [".mp4", ".m4a"],
  "audio/opus": [".opus"],
  "audio/pcm": [".pcm"],
  "audio/wav": [".wav"],
  "audio/webm": [".webm"],
  "application/pdf": [".pdf"],
  "text/plain": [".txt", ".text"],
  "image/png": [".png"],
  "image/jpeg": [".jpeg", ".jpg"],
  "image/webp": [".webp"],
};
