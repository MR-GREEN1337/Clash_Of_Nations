"use client"

import * as React from "react"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { countries } from "@/lib/constants"

const CountrySchema = z.object({
  name: z.string(),
  capital: z.string().transform((v) => Number(v)||0),
  military_power: z.enum(["Yes", "No"]),
  alliances: z.string(), //z.array(z.string()),
  social_media_sentiment: z.enum(["Positive", "Negative", "Neutral"]),
  government_type: z.enum(["Democracy", "Dictatorship", "Monarchy", "Communist"]),
  international_org: z.enum(["Yes", "No"]),
  Number_of_AI_Enterprises: z.string().transform((v) => Number(v)||0),
  Number_of_AI_Countries: z.string().transform((v) => Number(v)||0),
});

const EnterpriseSchema = z.object({
  name: z.string(),
  industry: z.string(),
  revenue: z.string().transform((v) => Number(v)||0),
  number_of_employees: z.string().transform((v) => Number(v)||0),
  market_cap: z.string().transform((v) => Number(v)||0),
  business_strategy: z.string(),
  country_of_incorporation: z.string(),
  tension_with_country: z.enum(["Low", "Mid", "High"]),
  international_org: z.enum(["Yes", "No"]),
  Number_of_AI_Enterprises: z.string().transform((v) => Number(v)||0),
  Number_of_AI_Countries: z.string().transform((v) => Number(v)||0),
  social_media_sentiment: z.enum(["Positive", "Negative", "Neutral"]),
});

const playMode = [
  {
    value: "Enterprise",
    label: "Enterprise",
  },
  {
    value: "Country",
    label: "Country",
  },
]

const CountryForm = ({ onSubmit }: any ) => {
  const form = useForm<z.infer<typeof CountrySchema>>({
    resolver: zodResolver(CountrySchema),
    defaultValues: {
      name: "",
      military_power: "No",
      social_media_sentiment: "Neutral",
      government_type: "Democracy",
      international_org: "No",
    },
  })

  return (
    <div className="justify-center items-center h-screen">
      <h2 className="mb-2 text-3xl flex font-bold text-gray-400 items-center">Create Your Country Agent!</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit )} className="space-y-4">
          <div className="grid grid-cols-2 gap-x-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Country Name</FormLabel>
                  <FormControl>
                    <Input placeholder="country name" {...field} />
                  </FormControl>
                  <FormDescription>This is your Country Name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Capital</FormLabel>
                  <FormControl>
                    <Input placeholder="2000000(2M$)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alliances"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Alliances</FormLabel>
                  <FormControl>
                    <Input placeholder="alliances" {...field} />
                  </FormControl>
                  <FormDescription>Select Countries you want to be allied with</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="social_media_sentiment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Social Media Sentiment</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Neutral" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Positive">Positive</SelectItem>
                        <SelectItem value="Neutral">Neutral</SelectItem>
                        <SelectItem value="Negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>What do people think of you</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="government_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Form of Government</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Democracy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Democracy">Democracy</SelectItem>
                        <SelectItem value="Dictatorship">Dictatorship</SelectItem>
                        <SelectItem value="Monarchy">Monarchy</SelectItem>
                        <SelectItem value="Communist">Communist</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="military_power"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Military Power</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="No" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>Posession of nuclear missiles</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <hr />
          <div className="flex flex-col items-center space-y-4 mt-8 ml-30">
            <h2 className="text-3xl flex font-bold text-gray-400 items-center">Compose your environment</h2>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="Number_of_AI_Countries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Number of AI Countries</FormLabel>
                    <FormControl>
                      <Input placeholder="2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Number_of_AI_Enterprises"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Number of AI Enterprises</FormLabel>
                    <FormControl>
                      <Input placeholder="2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="international_org"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Include an International Organization</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="No" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>International Organizations aid to maintain order</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button type="submit" className="bg-blue-500 hover:bg-blue-700">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};


const EnterpriseForm = ({ onSubmit }) => {
  const form = useForm<z.infer<typeof EnterpriseSchema>>({
    resolver: zodResolver(EnterpriseSchema),
    defaultValues: {
      name: "",
      industry: "",
      business_strategy: "",
      country_of_incorporation: "Morocco",
      social_media_sentiment: "Neutral",
      tension_with_country: "Low",
      international_org: "No"
    }
  })

  return (
    <div className="flex justify-center items-center h-screen justify-start">
      <div className="space-y-8 w-full max-w-4xl overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-x-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="industry (ex. Tech)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="revenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Company Revenue</FormLabel>
                      <FormControl>
                        <Input placeholder="1000000 (1M$)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="number_of_employees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Number of Employees</FormLabel>
                      <FormControl>
                        <Input placeholder="2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="market_cap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Market Cap</FormLabel>
                      <FormControl>
                        <Input placeholder="5000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="business_strategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Business Strategy</FormLabel>
                      <FormControl>
                        <Input placeholder="Strategy details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="country_of_incorporation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Country of Incorporation</FormLabel>
                      <FormControl>
                        <Select {...field} onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tension_with_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tension with Country</FormLabel>
                      <FormControl>
                        <Select {...field} onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tension" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Mid">Mid</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
              control={form.control}
              name="social_media_sentiment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Social Media Sentiment</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Neutral" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Positive">Positive</SelectItem>
                        <SelectItem value="Neutral">Neutral</SelectItem>
                        <SelectItem value="Negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>What do people think of you</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
              </div>
            </div>
            <h2 className="text-2xl text-white">Compose your environment</h2>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="Number_of_AI_Countries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Number of AI Countries</FormLabel>
                    <FormControl>
                      <Input placeholder="2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Number_of_AI_Enterprises"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Number of AI Enterprises</FormLabel>
                    <FormControl>
                      <Input placeholder="2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="international_org"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Include an International Organization</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="No" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>International Organizations aid to maintain order</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-center">
              <Button className="mt-10" type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

const PlayModeSelector = ({ onSelect }) => {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  const handleSelect = (currentValue) => {
    setValue(currentValue)
    setOpen(false)
    onSelect(currentValue)
  }

  return (
    <div>
      <div className="justify-start font-bold text-white mb-5">
        <h2>Select Your Role</h2>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value
              ? playMode.find((framework) => framework.value === value)?.label
              : "Select Play mode..."}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandEmpty>No play mode found.</CommandEmpty>
              <CommandGroup>
                {playMode.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onSelect={() => handleSelect(framework.value)}
                  >
                    {framework.label}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === framework.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}


export const GameForm = ({ onSubmit }) => {
  const [selectedMode, setSelectedMode] = React.useState(null)

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    // Disable scrolling when the form is displayed
    if (mode === "Country") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  const handleBack = () => {
    setSelectedMode(null);
    document.body.style.overflow = "auto";
  }

  return (
    <div className="flex relative justify-center h-full w-full mt-40">
      {selectedMode && (
        <button onClick={handleBack} className="absolute justify-start left-4  text-white">
          &larr; Back
        </button>
      )}
      {!selectedMode ? (
        <PlayModeSelector onSelect={handleModeSelect} />
      ) : selectedMode === "Enterprise" ? (
        <EnterpriseForm onSubmit={onSubmit}/>
      ) : (
        <CountryForm onSubmit={onSubmit}/>
      )}
    </div>
  )
}
