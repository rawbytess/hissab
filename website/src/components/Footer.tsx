import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <div className="inset-x-0 bottom-0 bg-black w-full">
      <footer className={"text-white max-w-[60em] mx-auto py-6"}>
        <div className="container flex flex-col md:flex-row justify-around items-center">
          <div className="mb-4 md:mb-0 flex flex-col items-center gap-2">
            <a
              href={"https://www.linkedin.com/in/prenx4x/"}
              target="_blank"
              rel="noopener noreferrer"
              className={"mr-2 text-gray-100 hover:text-blue-300"}
            >
              Made by: Mufaddal Makati
            </a>
            <span className={"text-xs"}>
              © {new Date().getFullYear()}. All rights reserved.
            </span>
            <div className={"flex items-center gap-2"}>
              <ExternalLink />
              <a href={"/privacy"}>Privacy Policy</a>{" "}
            </div>
          </div>

          <div className={"flex flex-col items-center gap-2 "}>
            <div className={"flex flex-row gap-1 items-center"}>
              <Heart />
              <span className={"text-sm"}>Hissab?</span>
            </div>
            <div className={"flex flex-row items-center gap-2"}>
              <button
                onClick={() => {
                  handleTwitterShare();
                }}
                className={
                  "flex  align-middle gap-2 ring-red-900 ring-2 rounded-xl ml-1 w-fit p-2"
                }
              >
                <XIcon />
                <span className={"text-xs"}>Share the love!</span>
              </button>
              or
              <button className={"p-0"}>
                <a href={"https://ko-fi.com/prenx4x"} target={"_blank"}>
                  <img src={"https://ko-fi.com/img/githubbutton_sm.svg"} />
                </a>
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-5 space-x-4">
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
    </div>
  );
}

const handleTwitterShare = () => {
  const message =
    "I found this amazing calculator called Hissab! Check it out at https://hissab.io";
  window.open(`https://twitter.com/intent/tweet?text=${message}`, "_blank");
};

function Heart() {
  return (
    <svg height="24" version="1.1" width="24">
      <g transform="translate(0 -1028.4)">
        <path
          d="m7 1031.4c-1.5355 0-3.0784 0.5-4.25 1.7-2.3431 2.4-2.2788 6.1 0 8.5l9.25 9.8 9.25-9.8c2.279-2.4 2.343-6.1 0-8.5-2.343-2.3-6.157-2.3-8.5 0l-0.75 0.8-0.75-0.8c-1.172-1.2-2.7145-1.7-4.25-1.7z"
          fill="#c0392b"
        />
      </g>
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 1200 1227"
      fill="none"
    >
      <g clip-path="url(#clip0_1_2)">
        <path
          d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_1_2">
          <rect width="1200" height="1227" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
