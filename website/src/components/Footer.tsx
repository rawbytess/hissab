import { Icon } from "@iconify/react";
import { Button } from "@heroui/react";

export default function Footer() {
  return (
    <footer
      className={"flex flex-col items-center text-white py-6 bg-black w-full"}
    >
      <div className="container flex flex-col md:flex-row justify-around items-center">
        <div className="mb-4 md:mb-0 flex flex-col items-center gap-3">
          <a
            href={"https://www.linkedin.com/in/prenx4x/"}
            target="_blank"
            rel="noopener noreferrer"
            className={"mr-2 text-gray-100 hover:text-blue-300"}
          >
            Made by: Mufaddal Makati
          </a>
          <div className={"flex items-center gap-5"}>
            <a href={"https://www.reddit.com/r/hissab/"} target={"_blank"}>
              <Icon icon="logos:reddit-icon" width={24} />
            </a>
            <a href={"https://x.com/prenx4x"} target={"_blank"}>
              <Icon icon="hugeicons:new-twitter" width={24} />
            </a>
          </div>

          <a
            className={"flex items-center gap-2 font-light"}
            href={"mailto:hello@hissab.io"}
          >
            <Icon icon="fluent:mail-16-filled" width={20} />
            hello@hissab.io
          </a>
        </div>
        <div>
          <div className={"flex items-center gap-2"}>
            <Icon icon="tabler:external-link" width={16} />
            <a href={"/privacy"}>Privacy Policy</a>
          </div>
          <div className={"flex items-center gap-2"}>
            <Icon icon="tabler:external-link" width={16} />
            <a href={"/privacy-app"}>App Privacy Policy</a>
          </div>
          <div className={"flex items-center gap-2"}>
            <Icon icon="tabler:external-link" width={16} />
            <a href={"/terms"}>Terms of Use</a>
          </div>
          <div className={"text-xs mt-4"}>
            © {new Date().getFullYear()}. All rights reserved.
          </div>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className={"flex flex-row items-center gap-5"}>
            <div className={"flex flex-row gap-1 items-center"}>
              <Icon icon="emojione-v1:red-heart" width={16} />
              <span className={"text-sm"}>Hissab?</span>
            </div>
            <div className={"flex items-center gap-4"}>
              <Button
                variant={"solid"}
                onPress={() => {
                  handleTwitterShare();
                }}
                className={"bg-blue-950 h-6"}
              >
                <Icon icon="hugeicons:new-twitter" width={18} />
                <span className={"text-xs"}>Share the love!</span>
              </Button>
            </div>
          </div>
          <div>
            <a
              href="https://www.producthunt.com/posts/hissab?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-hissab"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=406257&theme=dark"
                alt="Hissab - Just&#0032;Type&#0032;and&#0032;Calculate&#0032;Anything&#0044;&#0032;Instantly | Product Hunt"
                style={{
                  width: "250px",
                }}
                width="250"
                height="54"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const handleTwitterShare = () => {
  const message =
    "I found this amazing calculator called Hissab! Check it out at https://hissab.io";
  window.open(`https://twitter.com/intent/tweet?text=${message}`, "_blank");
};
