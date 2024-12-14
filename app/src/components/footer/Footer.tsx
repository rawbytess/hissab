export default function Footer() {
  return (
    <footer
      className={
        "flex justify-between bg-gray-950 text-gray-300 p-4 sticky top-full"
      }
    >
      <div className="mb-4 md:mb-0 flex items-center gap-5">
        <span className={"text-xs"}>
          © {new Date().getFullYear()}. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
