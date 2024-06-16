"use client";

import { Tabs } from "@/components/ui/tabs";
import Chat from "./_components/Chat";
import Kernel from "./_components/kernel";
import { GameForm } from "./_components/form";
import { useEffect, useState } from "react";
import Scenario from "./_components/scenario";
import GraphComp from "./_components/graph";
import Report from "./_components/Report";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { loadingStates } from "@/components/ui/waiting";

const Page = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [scenarioSubmitted, setScenarioSubmitted] = useState(false);
  const [formData, setFormData] = useState(null);
  const [scenarioData, setScenarioData] = useState(null);
  const [streamFinished, setStreamFinished] = useState(false);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [kernelData, setKernel] = useState({ data: {}, flag: "" });
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState({
    messages: [],
    actions: [],
    scenarios: []
  })
  const [graphFetched, setGraphFetched] = useState(false);

  const tabs = [
    {
      title: "Kernel",
      value: "Kernel",
      content: (
        <div className="w-full h-[1300px] relative rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]">
          <Kernel data={kernelData} />
        </div>
      ),
    },
    {
      title: "People",
      value: "chat",
      content: (
        <div className="flex justify-center w-full h-[900px] overflow-hidden relative rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]">
          <Chat data={chat} />
        </div>
      ),
    },
    {
      title: "Graph",
      value: "visualize the graph",
      content: (
        <div className="w-full h-[900px] overflow-hidden relative rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]">
          <GraphComp graphData={graphData} />
        </div>
      ),
    },
    {
      title: "Report",
      value: "content",
      content: (
        <div className="w-full h-[900px] overflow-hidden relative rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]">
          <Report streamFinished={streamFinished} />
        </div>
      ),
    },
  ];

  const handleFormSubmit = (data) => {
    console.log(data);
    setFormData(data);
    setFormSubmitted(true);
  };

  const handleScenarioSubmit = (data) => {
    setScenarioData(data);
    setScenarioSubmitted(true);
    setLoading(true);
  };

  useEffect(() => {
    if (formData) {
      const postFormData = async () => {
        try {
          const response = await fetch("http://127.0.0.1:8000/form", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
          const result = await response.json();
          console.log("Form submission result:", result);
        } catch (error) {
          console.error("Error submitting form:", error);
        }
      };
      postFormData();
    }
  }, [formData]);

  useEffect(() => {
    const submitScenario = async () => {
      if (!scenarioData) return;

      try {
        const response = await fetch("http://127.0.0.1:8000/scenario", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scenario: scenarioData }),
        });
        const result = await response.json();
        console.log("Scenario submission result:", result);
      } catch (error) {
        console.error("Error submitting scenario:", error);
      }
    };

    submitScenario();
  }, [scenarioData]);

  
  useEffect(() => {
    if (scenarioSubmitted &&!graphFetched) {
      const fetchGraph = async () => {
        try {
          const response = await fetch("http://127.0.0.1:8000/graph");
          const data = await response.json();
          setGraphData({ nodes: data["nodes"], edges: data["edges"] });
          setGraphFetched(true);
        } catch (error) {
          console.error("Error fetching graph data:", error);
        }
      };
  
      fetchGraph();
    }
  }, [scenarioSubmitted, graphFetched]);

  useEffect(() => {
    const constructKernelData = (data) => {
      let datum = {};
      let flag = "";

      data["countries"].forEach((entity) => {
        if (entity["flag"] === "Human") {
          datum = entity;
          flag = "Country";
        }
      });
      data["enterprises"].forEach((entity) => {
        if (entity["flag"] === "Human") {
          datum = entity;
          flag = "Enterprise";
        }
      });

      console.log("My datum is: ", { datum });

      return { data: datum, flag: flag };
    };

    const fetchGame = async () => {
      if (!scenarioData || !formData) return;
      if (graphFetched) {
        try {
          const response = await fetch("http://127.0.0.1:8000/game");
          const reader = response.body.getReader();
    
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              setStreamFinished(true);
              console.log("Stream finished");
              break;
            }
    
            const chunkString = new TextDecoder().decode(value);
            const data = JSON.parse(chunkString);
            console.log("Streamed data is", data)
            setChat({
              messages: data["social_media_messages"]["messages"],
              actions: data["actions"],
              scenarios: data["scenario"]
            });
    
            const kernelData = constructKernelData(data);
            setKernel({ data: kernelData["data"], flag: kernelData["flag"] });
    
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchGame();
  }, [scenarioData, formData, graphFetched]);

  return (
    <div>
      {formSubmitted ? (
        scenarioSubmitted ? (
          <div className="mt-20 h-[70rem] md:h-[43rem] [perspective:1600px] relative flex flex-col mx-auto w-[60rem] items-start justify-start my-40">
            <Tabs tabs={tabs} />
          </div>
        ) : (
          <Scenario onSubmit={handleScenarioSubmit} />
        )
      ) : (
        <GameForm onSubmit={handleFormSubmit} />
      )}
      </div>
  );
};

export default Page;

//<MultiStepLoader loadingStates={loadingStates} duration={1500} loading={loading} />
