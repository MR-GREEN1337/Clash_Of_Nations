import asyncio
import io
import json
import os
from typing import Literal, Union, TypedDict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
import uvicorn
from settings import load_env
from graph import Environment, Game, Economy, Enterprise, Country, Government, Military, Organization, SocialMedia, kickoff
import random
from faker import Faker
from langchain_core.messages import HumanMessage
from generate_report import generate_markdown
from tools import simple_rag

class ScenarioData(TypedDict):
    scenario: str

class CountryForm(TypedDict):
    name: str
    capital: int
    military_power: Literal["Yes", "No"]
    alliances: str
    social_media_sentiment: Literal["Positive", "Negative", "Neutral"]
    government_type: Literal["Democracy", "Dictatorship", "Monarchy", "Communist"]
    international_org: Literal["Yes", "No"]
    Number_of_AI_Enterprises: int
    Number_of_AI_Countries: int

class EnterpriseForm(TypedDict):
    name: str
    industry: str
    revenue: int
    number_of_employees: int
    market_cap: int
    business_strategy: str
    country_of_incorporation: str
    tension_with_country: Literal["Low", "Mid", "High"]
    international_org: Literal["Yes", "No"]
    Number_of_AI_Enterprises: int
    Number_of_AI_Countries: int
    social_media_sentiment: str

app = FastAPI()

# Define global variables
game = {
            "countries": [],
            "enterprises": [],
            "scenario": [], 
            "social_media_messages": {"messages": []},
            "next": "supervisor",
            "actions": []
        }
graph = None
user_settings = None
graph_core = None
graph_initialized_event = asyncio.Event()
graph_core_fetched_event = asyncio.Event()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_game(form: Union[CountryForm, EnterpriseForm], type):
    faker = Faker()
    global user_settings, game
    def generate_fake_country(game):
        while True:
            name_country = faker.country()
            country = {
                "name": name_country,
                "military_power": {
                    "expenditure": random.uniform(1, 1000),
                    "nuclear_capability": random.choice([True, False])
                },
                "alliances": [faker.country() for _ in range(random.randint(1, 5))],
                "social_media_sentiment": random.choice(["positive", "negative", "neutral"]),
                "economy": {
                    "inflation_rate": random.uniform(0, 20),
                    "unemployment_rate": random.uniform(0, 25),
                    "GDP": random.uniform(1e9, 1e13),
                    "HDI": random.uniform(0, 1)
                },
                "env_factors": {
                    "carbon_emissions": random.uniform(0, 1000),
                    "renewable_energy_percentage": random.uniform(0, 100),
                    "natural_disaster_risk": random.uniform(0, 100)
                },
                "government": {
                    "name": "Gov of "+name_country,
                    "system": random.choice(["Democracy", "Monarchy", "Communism", "Dictatorship"]),
                    "democracy_level": random.choice(["High", "Medium", "Low"]),
                    "corruption_index": random.uniform(0, 100),
                    "human_rights_record": random.choice(["Excellent", "Good", "Fair", "Poor"]),
                    "election_frequency": random.choice(["4 years", "5 years", "6 years", "Indefinite"])
                },
                "flag": "Bot"
            }
            if game["countries"] == [] or not game["countries"]:
                return country
            elif country["name"] not in [c["name"] for c in game["countries"]]:
                return country

    def generate_fake_enterprise(game):
        while True:
            enterprise = {
                "name": "Corporate: " + faker.company(),
                "industry": faker.job(),
                "revenue": random.uniform(1e6, 1e12),
                "number_of_employees": random.randint(1, 100000),
                "market_cap": random.uniform(1e6, 1e12),
                "business_strategy": random.choice(["Cost Leadership", "Differentiation", "Focus"]),
                "country_of_incorporation": faker.country(),
                "tension_with_country": random.choice(["Low", "Mid", "High"]),
                "social_media_sentiment": random.choice(["positive", "negative", "neutral"]),
                "flag": "Bot"
            }
            
            if game["enterprises"] == [] or not game["enterprises"]:
                return enterprise
            elif enterprise["name"] not in [e["name"] for e in game["enterprises"]]:
                return enterprise

    user_settings = {"international_org":True}
    for _ in range(form["Number_of_AI_Countries"]):
        game["countries"].append(generate_fake_country(game))

    for _ in range(form["Number_of_AI_Enterprises"]):
        game["enterprises"].append(generate_fake_enterprise(game))

    game["scenario"]= [] 
    game["social_media_messages"]= {"messages": []}
    game["next"] = "supervisor"

    if type == "country":
        country = Country(
                name=form["name"],
                military_power= Military(
                    nuclear_capability=(form["military_power"]=="Yes")),
                alliances= form["alliances"],
                social_media_sentiment= form["social_media_sentiment"],
                economy= Economy(
                    GDP= form["capital"],
                    HDI= random.uniform(0, 1),
                    inflation_rate= random.uniform(0, 20),
                    unemployment_rate= random.uniform(0, 25),

                ),
                government= Government(
                    name = f"Gov: {form['name']}",
                    system = form["government_type"],
                    democracy_level= random.choice(["High", "Medium", "Low"]),
                    corruption_index= random.uniform(0, 100),
                    human_rights_record= random.choice(["Excellent", "Good", "Fair", "Poor"]),
                    election_frequency= random.choice(["4 years", "5 years", "6 years", "Indefinite"])
                ),
                env_factors=Environment(
                carbon_emissions= random.uniform(0, 1000),
                renewable_energy_percentage= random.uniform(0, 100),
                natural_disaster_risk= random.uniform(0, 100)
                ),
                flag="Human"
            )

        game["countries"] += [country]

    else:
        print("Social media sentime for this corp is: ", form)
        enterprise = Enterprise(
                name=form["name"],
                industry= form["industry"],
                number_of_employees= form["number_of_employees"],
                social_media_sentiment= form["social_media_sentiment"].capitalize(),
                business_strategy = form["business_strategy"],
                country_of_incorporation = form["country_of_incorporation"],
                tension_with_country = form["tension_with_country"],
                market_cap = form["market_cap"],
                revenue=form["revenue"],
                flag="Human"
            )

        game["enterprises"] += [enterprise]

        
    user_settings["international_org"] = form["international_org"]

    return game, user_settings

@app.post("/form")
async def post_form(form: Union[CountryForm, EnterpriseForm]):
    global game, user_settings
    if 'military_power' in form:
        game, user_settings = create_game(form, "country")
    else:
        game, user_settings = create_game(form, "enterprise")
    return "good job"

@app.post("/scenario")
async def post_scenario(scenario: dict):
    global graph, user_settings, graph_core
    game["scenario"] = [scenario["scenario"]]
    #print("the game is", game)
    graph, graph_core = await kickoff(game, user_settings)
    graph_initialized_event.set() 
    return "graph initiated"

@app.get("/game")
async def stream():
    async def stream_game():
        global game, graph
        await graph_core_fetched_event.wait()
        i=1

        if graph is None:
            raise HTTPException(status_code=500, detail="Graph is not initialized")
        
        load_env()
        game['messages'] = [HumanMessage(content="hello there")]
        events = graph.stream(game)

        try:
            for event in events:
                result = dict(event)
                result = next(iter(result.values()))
                result["messages"] = [message.content for message in result["messages"]]
                if i == 5:
                    yield json.dumps(result)
                    break
                yield json.dumps(result)
                i+=1
                await asyncio.sleep(2)
        except asyncio.CancelledError:
            print("Task was cancelled")


    return StreamingResponse(stream_game(), media_type="text/event-stream")

@app.get("/graph")
async def get_graph():
    global graph_core
    await graph_initialized_event.wait()

    graph_core_fetched_event.set()
    return graph_core

@app.get("/report")
async def generate_report():
    global game
    tools = [simple_rag]
    _, output_pdf = await generate_markdown(game, tools)

    if os.path.exists(output_pdf):
        return FileResponse(output_pdf, media_type='application/octet-stream')

    else:
        raise HTTPException(status_code=404, detail="Report file not found")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

"""        try:
            image = Image(graph.get_graph(xray=True).draw_mermaid_png())
            with open("backend/graph.png", "wb") as png:
                png.write(image.data)
        except Exception as e:
            print(e)
"""