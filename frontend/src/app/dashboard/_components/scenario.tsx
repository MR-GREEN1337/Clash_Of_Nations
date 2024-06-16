import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import React from 'react'

type Props = {}

const Scenario = ({onSubmit}) => {
    const placeholders = [
        "Global cyberattack on critical infrastructure",
        "Rising sea levels threaten island nations",
        "Pandemic-induced economic crisis",
        "Political unrest in oil-producing region",
        "Discovery of revolutionary energy source",
        "Escalating trade war between major economies",
        "Extreme weather devastates agricultural regions",
        "Breakthrough in renewable energy technology",
        "Collapse of major financial institution",
        "Escalating diplomatic tensions between nuclear powers"
      ];
     
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        //console.log(e.target.value);
      };
      return (
        <div className="h-[40rem] flex flex-col justify-center  items-center px-4">
          <h2 className=" sm:mb-5 text-xl text-center sm:text-5xl dark:text-white text-white font-bold">
            Imagine the scenario
          </h2>
          <h2 className='mb-5 text-center text-white'>This will set the overall scenario for the emulator</h2>
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={onSubmit}
          />
        </div>
      );
}

export default Scenario