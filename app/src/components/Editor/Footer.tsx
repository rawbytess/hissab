import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

const handleTwitterShare = () => {
  const message =
    "I found this amazing calculator called Hissab! Check it out at https://hissab.io";
  window.open(`https://twitter.com/intent/tweet?text=${message}`, "_blank");
};

export default function Footer() {
  return (
    <footer
      className={
        "flex justify-center bg-gray-950 text-gray-300 p-2 fixed z-50 h-12 -bottom-1 w-fill"
      }
    >
      <div className={"flex flex-row items-center gap-2 "}>
        <div className={"flex flex-row gap-1 items-center"}>
          <Icon icon="emojione-v1:red-heart" width="24" height="24" />
          <span className={"text-sm"}>Hissab?</span>
        </div>
        <div className={"flex items-center gap-2"}>
          <Button
            variant={"solid"}
            onPress={() => {
              handleTwitterShare();
            }}
            className={"bg-blue-950 h-8"}
          >
            <Icon icon="hugeicons:new-twitter" width="20" height="20" />{" "}
            <span className={"text-xs"}>Share the love!</span>
          </Button>
          or
          <Button className={"p-0"} variant={"light"}>
            <a href={"https://ko-fi.com/prenx4x"} target={"_blank"}>
              <img src={"https://ko-fi.com/img/githubbutton_sm.svg"} />
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}
