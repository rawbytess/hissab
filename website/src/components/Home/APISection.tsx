import { Icon } from "@iconify/react";
import { Button } from "@heroui/react";

function ApiSection() {
  return (
    <section className="flex flex-col items-center justify-center w-full text-light">
      <h2
        className={
          "text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-300 via-pink-300 to-red-300"
        }
      >
        Developers, This One’s for You
      </h2>
      <p className={"text-xl text-gray-400"}>
        Need an AI that can do math correctly?
      </p>
      <div
        className={
          "ring-2 ring-stone-600 bg-stone-900 p-5 rounded-lg my-4 text-left font-mono leading-8"
        }
      >
        $curl -X POST https://api.hissab.io/ai <br />
        -H "Content-Type: application/json"
        <br />
        -H "Authorization: Bearer YOUR_API_KEY" <br />
        -d {JSON.stringify({ prompt: "What is 50 times 120?" })}
      </div>
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
        <a href="/api" className="flex flex-col">
          <p>View API Docs</p>
          <p className={"text-gray-300 text-xs"}>(Coming Soon)</p>
        </a>
      </Button>
    </section>
  );
}

export default ApiSection;
