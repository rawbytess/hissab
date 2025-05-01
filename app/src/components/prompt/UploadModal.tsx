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
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useContext, useEffect, useState } from "react";
import {
  FileWithPreview,
  useSupabaseUpload,
} from "@/hooks/use-supabase-upload.ts";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone.tsx";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { uploadFile } from "@/queries/useAIFileUpload.tsx";
import { supabase } from "@/lib/supabase/client.ts";
import { cn } from "@/lib/utils.ts";
import { PageContext } from "@/components/sidebar/pages/PagesProvider.tsx";
import { getFileInfoFromUrl } from "@/lib/fileMetaData.ts";
import {
  FileObject,
  FileUpload,
  supportedMimeTypes,
} from "../../../../lib/types/fileTypes.ts";
import { getMaxFileSize } from "../../../../lib/getPremiumStatus.ts";

const BucketName = "context";

export default function UploadModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { session, isPremium } = useContext(SessionContext);
  const { updateNote, currentPageNumber } = useContext(PageContext);

  const props = useSupabaseUpload({
    bucketName: BucketName,
    path: `${session?.user.id}`,
    maxFiles: 1,
    maxFileSize: getMaxFileSize(isPremium ?? ""),
    upsert: true,
    allowedMimeTypes: supportedMimeTypes,
  });
  useEffect(() => {
    if (props.isSuccess) {
      onOpenChange();

      const file = props.acceptedFiles[0];
      const url = `${import.meta.env.VITE_SUPABASE_PROJECT_URL}/storage/v1/object/public/${BucketName}/${session?.user.id}/${file.name}`;

      uploadFile({
        url: url,
        name: props.acceptedFiles[0].name,
        mimeType: props.acceptedFiles[0].type,
      })
        .then((file) => {
          updateNote(currentPageNumber, "", "chat", file);
        })
        .catch(() => {
          addToast({
            title: "Error",
            description: `Error uploading file: ${props.acceptedFiles[0].name}`,
            timeout: 5000,
            shouldShowTimeoutProgress: true,
            variant: "flat",
            color: "danger",
            icon: <Icon icon="bxs:error" width="20" height="20" />,
          });
        });
      props.setFiles([]);
    }
  }, [props.isSuccess]);

  return (
    <>
      <Button
        size="sm"
        disabled={isPremium !== "AI Plus"}
        onPress={onOpen}
        startContent={
          <Icon
            className="text-white"
            icon="solar:paperclip-linear"
            width={16}
          />
        }
        variant="solid"
      >
        Attach
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size={"xl"}
        hideCloseButton={true}
        className={"ring-2 ring-gray-950 shadow"}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className={"text-white mt-5"}>
                <div className="w-[500px]">
                  <Dropzone {...props}>
                    <DropzoneEmptyState />
                    <DropzoneContent />
                  </Dropzone>
                  <DropzoneFileList
                    bucket={BucketName}
                    currentPageNumber={currentPageNumber}
                    updateNote={updateNote}
                    onOpenChange={onOpenChange}
                  />
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
  const { session } = useContext(SessionContext);

  //console.log(recentFiles);
  useEffect(() => {
    async function fetchFiles() {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(`${session?.user.id}`, {
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
  }, [bucket, session]);

  if (!session) {
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
                url: `${import.meta.env.VITE_SUPABASE_PROJECT_URL}/storage/v1/object/public/${bucket}/${session?.user.id}/${file.name}`,
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
