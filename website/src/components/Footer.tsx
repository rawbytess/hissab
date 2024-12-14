export default function Footer() {
  return (
    <div className="inset-x-0 bottom-0 bg-black w-full">
      <footer className={"text-white max-w-[60em] mx-auto py-6"}>
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex flex-col items-center">
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
          </div>
          <div>
            <ul>
              <li>
                <a href={"/privacy"}>Privacy Policy</a>{" "}
              </li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <div>
              <a
                href="https://www.producthunt.com/posts/hissab?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-hissab"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=406257&theme=light"
                  alt="Hissab - Just&#0032;Type&#0032;and&#0032;Calculate&#0032;Anything&#0044;&#0032;Instantly | Product Hunt"
                  style={{
                    width: "250px",
                    height: "54px",
                    marginBottom: "20px",
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
