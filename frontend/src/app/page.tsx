import { Globe } from "@/components/GlobeComp";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Home() {
  return (
    <>
      <div className="relative h-screen">
        <Globe />
        <div className="absolute top-4 right-4 flex space-x-4">
          <a
            href="https://github.com/mr-green1337"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-black dark:text-white"
          >
            <FaGithub className="bg-white" />
          </a>
          <a
            href="https://www.linkedin.com/in/islam-hachimi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-black dark:text-white"
          >
            <FaLinkedin className="bg-white" />
          </a>
        </div>
        <div className="flex justify-center mt-4">
          <a href="/dashboard">
            <button className="p-[5px] relative text-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
              <div className="px-10 py-3 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent">
                Clash
              </div>
            </button>
          </a>
        </div>
        <div className="flex justify-center mt-4">
          <hr className="w-60 border-gray-300" />
        </div>
      </div>
    </>
  );
}