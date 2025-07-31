import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Progress,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Dropzone, { type FileRejection, useDropzone } from "react-dropzone";
import { PageContext } from "@/components/sidebar/pages/PagesProvider.tsx";
import { useAuth } from "@/components/user/auth/AuthProvider";
import { BACKEND_URL, cn } from "@/lib/utils.ts";
import { uploadFile } from "@/queries/useAIFileUpload.tsx";
import { getMaxFileSize } from "../../../../lib/getPremiumStatus.ts";
import {
  ALLOWED_MIME_TYPES,
  type FileObject,
  type FileUpload,
  supportedMimeTypes,
} from "../../../../lib/types/fileTypes.ts";

export default function UploadModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { user, isPremium } = useAuth();
  const { updateNote, currentPageNumber } = useContext(PageContext);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<FileUpload | null>(null);

  // This function is called when a file is dropped or selected
  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Reset state on new upload attempt
      setUploadError(null);
      setUploadedFile(null);

      // Handle rejected files (e.g., wrong type or too large)
      if (fileRejections.length > 0) {
        const firstError = fileRejections[0].errors[0];
        setUploadError(firstError.message);
        return;
      }

      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);

      setIsUploading(true);

      try {
        // The endpoint for your worker route
        const response = await fetch(`${BACKEND_URL}/user/upload`, {
          method: "POST",
          // If your auth middleware expects a token, add it here
          // headers: { 'Authorization': `Bearer ${yourAuthToken}` },
          body: formData,
          credentials: "include", // Include credentials for session management
        });

        if (!response.ok) {
          // Use the error message from the backend if available
          throw new Error(`Upload failed with status: ${response.status}`);
        }
        const result = await response.json();

        updateNote(currentPageNumber, "", "chat", {
          name: file.name,
          url: result.url,
          mimeType: file.type,
        });

        setUploadedFile(result as FileUpload);
      } catch (error: any) {
        addToast({
          title: "Error",
          description: `Error uploading file: ${file.name}`,
          timeout: 5000,
          shouldShowTimeoutProgress: true,
          variant: "flat",
          color: "danger",
          icon: <Icon icon="bxs:error" width="20" height="20" />,
        });
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: ALLOWED_MIME_TYPES,
      maxFiles: 1,
      maxSize: getMaxFileSize(isPremium ?? ""),
      multiple: false, // Allow only a single file upload
    });

  return (
    <>
      <Button
        size="sm"
        onPress={onOpen}
        startContent={<Icon icon="solar:paperclip-linear" width={16} />}
        disableAnimation={isPremium !== "AI Plus"}
        isDisabled={isPremium !== "AI Plus"}
        variant="solid"
      >
        Attach
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={() => {
          setIsUploading(false);
          setUploadError(null);
          setUploadedFile(null);
          onOpenChange();
        }}
        size={"xl"}
        hideCloseButton={true}
        className={"ring-2 ring-gray-950 shadow"}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className={"text-white mt-5"}>
                <div className="w-[500px]">
                  <div
                    {...getRootProps()}
                    className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors duration-300 ease-in-out
                ${isDragActive ? "border-primary bg-primary-50" : "border-default-300 hover:border-default-500"}
                ${uploadError ? "border-danger bg-danger-50" : ""}`}
                  >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <p className="text-primary">Drop the file here...</p>
                    ) : (
                      <p className="text-default-500">
                        Drag & drop a file, or click to select
                      </p>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-default-400 text-center">
                      Allowed types: JPG, PNG, PDF, TXT. Max size:{" "}
                      {getMaxFileSize(isPremium ?? "")}MB.
                    </p>

                    {isUploading && (
                      <Progress
                        size="sm"
                        isIndeterminate
                        aria-label="Uploading..."
                      />
                    )}

                    {acceptedFiles.length > 0 &&
                      !isUploading &&
                      !uploadedFile &&
                      !uploadError && (
                        <Chip color="default" variant="flat">
                          {acceptedFiles[0].name}
                        </Chip>
                      )}

                    {uploadError && (
                      <Chip color="danger" variant="solid">
                        {uploadError}
                      </Chip>
                    )}

                    {uploadedFile && (
                      <div className="p-3 border rounded-lg bg-success-50 border-success-200">
                        <p className="font-semibold text-success-800">
                          Upload Successful!
                        </p>
                        <a
                          href={uploadedFile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 break-all hover:underline"
                        >
                          View File: {uploadedFile.name}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className={"text-white"}>
                <Button
                  size={"sm"}
                  color="danger"
                  variant="faded"
                  onPress={onClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

/*
const DropzoneFileList = ({
  bucket,
  updateNote,
  currentPageNumber,
  onOpenChange,
}: {
  bucket: string;
  updateNote: any;
  currentPageNumber: string;
  onOpenChange: () => void;
}) => {
  const [recentFiles, setrecentFiles] = useState<FileObject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  //console.log(recentFiles);
  useEffect(() => {
    async function fetchFiles() {
       const { data, error } = await supabase.storage
        .from(bucket)
        .list(`${user.id}`, {
          limit: 10,
          offset: 0,
          sortBy: { column: "updated_at", order: "asc" },
        });
      //console.log(data);
      if (error) {
        setError("Error fetching your files.");
      } else {
        setrecentFiles(data);
      }
    }
    //console.log("Fetching files");
    fetchFiles();
  }, [bucket, user]);

  if (!user) {
    return null;
  }
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader>Recently Uploaded Files:</CardHeader>
      <CardBody className={cn("flex flex-row flex-wrap gap-2")}>
        {recentFiles.map((file) => (
          <Chip
            size={"md"}
            key={file.name}
            startContent={<Icon icon={"fa6-solid:file"} className={"mx-1"} />}
            className={"cursor-pointer"}
            onClick={() => {
              onOpenChange();
              uploadFile({
                url: `${import.meta.env.VITE_SUPABASE_PROJECT_URL}/storage/v1/object/public/${bucket}/${user.id}/${file.name}`,
                name: file.name,
              })
                .then((file) => {
                  updateNote(currentPageNumber, "", "chat", file);
                })
                .catch(() => {
                  addToast({
                    title: "Error",
                    description: `Error uploading file: ${file.name}`,
                    timeout: 5000,
                    shouldShowTimeoutProgress: true,
                    variant: "flat",
                    color: "danger",
                    icon: <Icon icon="bxs:error" width="20" height="20" />,
                  });
                });
            }}
            endContent={
              <Icon
                color={"red"}
                icon={"fluent:delete-16-filled"}
                className={"mx-1 cursor-pointer"}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();

                  supabase.storage
                    .from(bucket)
                    .remove([`${session?.user.id}/${file.name}`])
                    .then(({ error }) => {
                      if (error) {
                        setError(`Error deleting file:${file.name}`);
                      } else {
                        setrecentFiles((prevFiles) =>
                          prevFiles.filter((f) => f.name !== file.name),
                        );
                      }
                    });

                }}
              />
            }
            variant="flat"
          >
            {file.name}
          </Chip>
        ))}
      </CardBody>
    </Card>
  );
};

*/
