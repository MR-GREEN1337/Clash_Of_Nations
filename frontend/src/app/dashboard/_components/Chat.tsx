import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Action {
  taker: string;
  content: string;
}

type Props = {
  data: {messages: string[];
  scenarios: string[];
  actions: Action[];}
};

export default function Component(props: Props) {
  console.log("action is", props.data.actions);
  return (
    <div className="flex justify-center space-x-4">
      {/* Chat Messages */}
      <div className="w-full max-w-md flex flex-col items-center">
        <p className="text-center">Chat</p>
        <Card className="w-[300px] rounded-2xl bg-transparent">
          <CardContent className="p-4 space-y-4 bg-transparent items-center">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {props.data.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      index % 2 === 0
                        ? "flex-row-reverse justify-end"
                        : "justify-start"
                    }`}
                  >
                    <Avatar className="w-8 h-8 bg-white">
                      <AvatarImage src="/mario.png" />
                      <AvatarFallback>AI Humanoids</AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[200px] rounded-lg p-3 text-sm ${
                        index % 2 === 0
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {message}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="w-full max-w-md flex flex-col items-center">
        <p className="text-center">Actions</p>
        <Card className="w-[300px] rounded-2xl bg-transparent">
          <CardContent className="p-4 space-y-4 bg-transparent">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {props.data.actions.map((event, index) => (
                  <div key={index} className="flex gap-3 mb-4">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/event.png" />
                    </Avatar>
                    <div className="mt-7 flex-1 bg-blue-500">
                      <h5 className="text-sm font-bold text-white">
                        {event.taker}
                      </h5>
                      <p className="w-full mt-1 text-sm text-white bg-gold">
                        {event.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Events */}
      <div className="w-full max-w-md flex flex-col items-center">
        <p className="text-center">News</p>
        <Card className="w-[300px] rounded-2xl bg-transparent">
          <CardContent className="p-4 space-y-4 bg-transparent">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {props.data.scenarios.map((scenario, index) => (
                  <div key={index} className="flex gap-3 mb-4 bg-blue-500">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/event.png" />
                      <AvatarFallback>News</AvatarFallback>
                    </Avatar>
                    <div className="pr-20 mt-7 flex-1">
                      <p className="w-full mt-1 text-sm text-white bg-gold">
                        {scenario}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
