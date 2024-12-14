export default function Header() {
  return (
    <header
      className={
        "h-12 w-full bg-[#530e97] flex flex-row items-center px-5 drop-shadow-2xl shadow-2xl justify-around fixed top-0 z-50"
      }
    >
      <div className={"flex flex-row items-center gap-5"}>
        <a href="/" className={"flex items-center gap-2 text-white"}>
          <img
            src="/img/logomark.svg"
            className={"w-10 drop-shadow"}
            alt="Hissab logo"
          />
          <h1 className={"shadow"}>Hissab</h1>
        </a>
        <a
          href={"/faqs"}
          className={"learn-more-nav h-6 px-2 py-1 hover:text-[#efefef]"}
        >
          Learn More
        </a>
      </div>
      <div className={"h-fit"}>
        <a
          href={"https://app.hissab.io"}
          target={"_blank"}
          className={
            "hissab-app-nav drop-shadow-2xl shadow-2xl h-10 p-2 text-white hover:text-[#efefef]"
          }
        >
          Hissab App
        </a>
      </div>
    </header>
  );
}
