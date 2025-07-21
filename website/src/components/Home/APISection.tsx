import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

function ApiSection() {
  return (
    <section className="flex flex-col items-center justify-center w-full text-light">
      <h2
        className={
          "text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-300 via-pink-300 to-red-300"
        }
      >
        The power of hissab in your own apps
      </h2>
      <p className={"text-xl text-gray-400"}>
        Need an AI that can do math correctly?
      </p>
      <div className={"flex flex-row gap-2 justify-center mt-4"}>
        <Icon icon={"mynaui:api-solid"} width={20} />
        <p>Integrate in your own productivity apps</p>
      </div>
      <div className={"flex flex-row gap-2 justify-center mt-4"}>
        <Icon icon={"eos-icons:pipeline"} width={20} />
        <p>
          Automate your workflows that require math and calculations for
          unstructured data
        </p>
      </div>
      <Button className="mt-10 bg-blue-700">
        <a href="/mcp" className="flex flex-col">
          <p>Hissab MCP Server</p>
        </a>
      </Button>
      <Button className="mt-10 bg-blue-700">
        <a href="/agent" className="flex flex-col">
          <p>Hissab AI Agent</p>
          <p className={"text-gray-300 text-xs"}>(Coming Soon)</p>
        </a>
      </Button>
    </section>
  );
}

export default ApiSection;
