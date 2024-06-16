import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { IconArrowWaveRightUp, IconBoxAlignRightFilled, IconBoxAlignTopLeft, IconBrandMeta, IconClipboardCopy, IconCoin, IconFileBroken, IconSignature, IconTableColumn} from "@tabler/icons-react";

type Props = {
  data: any
}

const Kernel: React.FC<Props> = ({ data }) => {
  console.log("Kernel Data is: ",data)
  const isCountry = data.flag === "Country";

  const items = isCountry? [
    {
      title: `Country: ${data.data.name}`,
      description: `Military Power: ${data.data.military_power.nuclear_capability? 'Yes' : 'No'}`,
      icon: <IconClipboardCopy className="w-4 text-white-500" />,
    },
    {
      title: 'Alliances',
      description: data.data.alliances,
      icon: <IconFileBroken className="h-4 w-4 text-white-500" />,
    },
    {
      title: 'Social Media Sentiment',
      description: data.data.social_media_sentiment,
      icon: <IconBrandMeta className="h-4 w-4 text-white-500" />,
    },
    {
      title: 'Economy',
      description: (
        <ul>
          <li>Inflation Rate: {data.data.economy.inflation_rate}</li>
          <li>Unemployment Rate: {data.data.economy.unemployement_rate}</li>
          <li>GDP: {data.data.economy.GDP}</li>
          <li>HDI: {data.data.economy.HDI}</li>
        </ul>
      ),
      icon: <IconCoin className="h-4 w-4 text-gold" />,
    },
    {
      title: 'Environment',
      description: (
        <ul>
          <li>Carbon Emissions: {data.data.env_factors?.carbon_emissions}</li>
          <li>Renewable Energy Percentage: {data.data.env_factors?.renewable_energy_percentage}</li>
          <li>Natural Disaster Risk: {data.data.env_factors?.natural_disaster_risk}</li>
        </ul>
      ),
    },
    {
      title: 'Government',
      description: (
        <ul>
          <li>Name: {data.data.government.name}</li>
          <li>System: {data.data.government.system}</li>
          <li>Democracy Level: {data.data.government.democracy_level}</li>
          <li>Corruption Index: {data.data.government.corruption_index}</li>
          <li>Human Rights Record: {data.data.government.human_rights_record}</li>
          <li>Election Frequency: {data.data.government.election_frequency}</li>
        </ul>
      ),
    },
  ] : [
    {
      title: `Enterprise: ${data.data.name}`,
      description: `Industry: ${data.data.industry}`,
      icon: <IconClipboardCopy className="h-4 w-4 text-gold" />,
    },
    {
      title: 'Revenue',
      description: data.data.revenue,
      icon: <IconFileBroken className="h-4 w-4 text-gold" />,
    },
    {
      title: 'Number of Employees',
      description: data.data.number_of_employees,
      icon: <IconSignature className="h-4 w-4 text-gold" />,
    },
    {
      title: 'Market Cap',
      description: data.data.market_cap,
      icon: <IconTableColumn className="h-4 w-4 text-gold" />,
    },
    {
      title: 'Social Media Sentiment',
      description: data.data.social_media_sentiment,
      icon: <IconBrandMeta className="h-4 w-4 text-white-500" />,
    },
    {
      title: 'Business Strategy',
      description: data.data.business_strategy,
      icon: <IconArrowWaveRightUp className="h-4 w-4 text-gold" />,
    },
    {
      title: 'Country of Incorporation',
      description: data.data.country_of_incorporation,
      icon: <IconBoxAlignTopLeft className="h-4 w-4 text-gold" />,
    },
    {
      title: 'Tension with Country',
      description: data.data.tension_with_country,
      icon: <IconBoxAlignRightFilled className="h-4 w-4 text-gold" />,
    },
  ];

  return (
    <BentoGrid>
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          icon={item.icon}
          className={i === 3 || i === 6? "md:col-span-2" : ""}
        />
      ))}
    </BentoGrid>
  );
};

export default Kernel;