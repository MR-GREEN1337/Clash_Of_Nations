import operator
from pprint import pformat
import random
from typing import List, Literal, Optional, Sequence, Union, cast
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_nvidia_ai_endpoints.tools import ServerToolsMixin
from langchain_core.output_parsers import JsonOutputParser
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain import hub
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import AnyMessage
from functools import partial
from settings import load_env
from tools import simple_rag
from PIL import Image
from typing import List, TypedDict

from typing import List, Optional, Sequence

class Military(TypedDict):
    nuclear_capability: bool

class Economy(TypedDict):
    inflation_rate: Optional[float]
    unemployement_rate: Optional[float]
    GDP: Optional[float]
    HDI: Optional[float]

class Environment(TypedDict):
    carbon_emissions: float
    renewable_energy_percentage: float
    natural_disaster_risk: float

class Government(TypedDict):
    name: str
    system: str
    democracy_level: Optional[str]
    corruption_index: Optional[float]
    human_rights_record: Optional[str]
    election_frequency: Optional[str]

class Country(TypedDict):
    name: str
    military_power: Military
    alliances: List[str]
    social_media_sentiment: Literal["positive", "negative", "neutral"]
    economy: Economy
    env_factors: Optional[Environment]
    government: Government
    flag: Literal["Bot", "Human"]

class Enterprise(TypedDict):
    name: str
    industry: str
    revenue: float
    number_of_employees: int
    market_cap: float
    business_strategy: str
    country_of_incorporation: str
    tension_with_country: Literal["Low", "Mid", "High"]
    social_media_sentiment: Literal["positive", "negative", "neutral"]
    flag: Literal["Bot", "Human"]

class Organization(TypedDict):
    name: str
    type: Literal["NGO", "Government", "Private Sector", "International"]
    influence_level: float
    number_of_members: int
    primary_focus: str

class SocialMedia(TypedDict):
    messages: List[str]

class Action(TypedDict):
    taker: str
    content: str

class Game(TypedDict):
    countries: Optional[List[Country]]
    enterprises: Optional[List[Enterprise]]
    scenario: Optional[List[str]]
    social_media_messages: Optional[SocialMedia]
    messages: Optional[Sequence[BaseMessage]]
    next: Optional[str]
    actions: List[Action]

def create_country_agent(game: Game, llm: ChatNVIDIA, tools: list, country_name: str):
    """Define country agent"""
    print(f"_______________Now I'm on the country {country_name}______________")

    country = next((c for c in game['countries'] if c['name'] == country_name), None)
    if country is None:
        return None
    print(f"_______________The overall social media sentiment {country['social_media_sentiment']}______________")

    system_prompt = f"""
    You are a helpful agent representing the country '{country_name}'. 
    Here is the current state of your country:
    Military Power: {', '.join(f"{k}: {v}" for k, v in country['military_power'].items())}
    Alliances: {country['alliances']}
    Social Media Messages: {', '.join(game['social_media_messages']['messages'])}
    Social Media current Sentiment: {country['social_media_sentiment']}
    Economy: {', '.join(f"{k}: {v}," for k, v in country['economy'].items())}
    Environmental Factors: {', '.join(f"{k}: {v}" for k, v in country['env_factors'].items())}
    Government: {', '.join(f"{k}: {v}," for k, v in country['government'].items())}
    
    Scenario: {game['scenario']}

    based on the actions you and others took that affected you, update the state accordingly
    
    Based on this information, provide clear outputs to update your country's state. Your outputs should be in the following format:
    {{
        "military_action": {{
            "nuclear_capability": bool,
            "details": str
        }},
        "form_alliance": {{
            "new_alliance": str,
            "remove_alliance": str
        }},
        "send_message": {{
            "message_content": str
        }},
        "environment_update": {{
            "carbon_emissions": float,
            "renewable_energy_percentage": float,
            "natural_disaster_risk": float
        }},
    }}
    """
    action = take_action(game, llm, game["next"])
    game["actions"].append(Action(taker= game["next"], content= action))

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="messages"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )
    chain = prompt | llm.bind_tools(tools) | JsonOutputParser()

    def update_game_state(game: Game, agent_output: dict) -> Game:
        """Update the game state based on the agent's output."""
        if 'military_action' in agent_output:
            military_action = agent_output['military_action']
            if 'nuclear_capability' in military_action:
                country['military_power']['nuclear_capability'] = military_action['nuclear_capability']

        if 'form_alliance' in agent_output:
            form_alliance = agent_output['form_alliance']
            if 'new_alliance' in form_alliance:
                country['alliances'].append(form_alliance['new_alliance'])
            if 'remove_alliance' in form_alliance:
                country['alliances'].remove(form_alliance['remove_alliance'])

        if 'send_message' in agent_output:
            message_content = agent_output['send_message']['message_content']
            game['social_media_messages']['messages'].append(message_content)

        if 'environment_update' in agent_output:
            environment_update = agent_output['environment_update']
            if 'carbon_emissions' in environment_update:
                country['env_factors']['carbon_emissions'] = environment_update['carbon_emissions']
            if 'renewable_energy_percentage' in environment_update:
                country['env_factors']['renewable_energy_percentage'] = environment_update['renewable_energy_percentage']
            if 'natural_disaster_risk' in environment_update:
                country['env_factors']['natural_disaster_risk'] = environment_update['natural_disaster_risk']
       
        return game

    def execute_agent(game) -> Game:
        """Run the agent and update the game state."""
        """        agent_output = chain.run(messages=game['messages'])
        updated_game = update_game_state(game, agent_output)"""
        return update_game_state(game, chain)

    return execute_agent(game)

def create_government_agent(game: Game, llm: ChatNVIDIA, tools: list, country_name: str):
    """Define government agent"""
    
    country = next((c for c in game['countries'] if c['name'] == country_name), None)
    if country is None:
        return None
    
    gov = country['government']
    gov_name = gov['name']
    print(f"_______________Now I'm on the Gov {gov_name}______________")
    print(f"_______________The overall social media sentiment {country['social_media_sentiment']}______________")

    action = take_action(game, llm, game["next"])
    if action != "no":
        game["actions"].append(Action(taker= game["next"], content= action))


    system_prompt = f"""
    You are a helpful agent representing the government: '{gov_name} of the country {country_name}'. 
    Here is the current state of your country:
    Social Media Messages: {game['social_media_messages']['messages']}
    Social Media current Sentiment: {country['social_media_sentiment']}
    Economy: {', '.join(f"{k}: {v}" for k, v in country['economy'].items())}
    Environmental Factors: {', '.join(f"{k}: {v}" for k, v in country['env_factors'].items())}
    Government: {gov['name']}

    system: {gov["system"]},
    democracy_level: {gov["democracy_level"]},
    corruption_index: {gov["corruption_index"]},
    human_rights_record: {gov["human_rights_record"]},
    election_frequency: {gov["election_frequency"]}

    Scenario: {game['scenario']}
    
    based on the action you took, update the state accordingly

    Based on this information, provide clear outputs to update your country's state. Your outputs should be in the following format:
    {{
        "government_update": {{
            "system": str,
            "democracy_level": str,
            "corruption_index": float,
            "human_rights_record": str,
            "election_frequency": str
        }},
        "economy_update": {{
            "inflation_rate": float,
            "unemployment_rate": float,
            "GDP": float,
            "HDI": float
        }},
    }}
    """
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="messages"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )
    chain = prompt | llm.bind_tools(tools) | JsonOutputParser()

    def update_game_state(game: Game, agent_output: dict) -> Game:
        """Update the game state based on the agent's output."""

        if 'government_update' in agent_output:
            government_update = agent_output['government_update']
            if 'system' in government_update:
                country['government']['system'] = government_update['system']
            if 'democracy_level' in government_update:
                country['government']['democracy_level'] = government_update['democracy_level']
            if 'corruption_index' in government_update:
                country['government']['corruption_index'] = government_update['corruption_index']
            if 'human_rights_record' in government_update:
                country['government']['human_rights_record'] = government_update['human_rights_record']
            if 'election_frequency' in government_update:
                country['government']['election_frequency'] = government_update['election_frequency']
        
        if 'economy_update' in agent_output:
            economy_update = agent_output['economy_update']
            if 'inflation_rate' in economy_update:
                country['economy']['inflation_rate'] = economy_update['inflation_rate']
            if 'unemployment_rate' in economy_update:
                country['economy']['unemployment_rate'] = economy_update['unemployment_rate']
            if 'GDP' in economy_update:
                country['economy']['GDP'] = economy_update['GDP']
            if 'HDI' in economy_update:
                country['economy']['HDI'] = economy_update['HDI']

        return game

    return update_game_state(game, chain)

def create_enterprise_agent(game: Game, llm: ChatNVIDIA, tools: list, enterprise_name: str):
    """Define enterprise agent"""
    print(f"_______________Now I'm on the enterprise {enterprise_name}______________")
    enterprise = next((e for e in game['enterprises'] if e['name'] == enterprise_name), None)
    if enterprise is None:
        return None

    action = take_action(game, llm, game["next"])
    game["actions"].append(Action(taker= game["next"], content= action))

    system_prompt = f"""
    You are a helpful agent representing the enterprise '{enterprise_name}'. 
    Here is the current state of your enterprise:
    Industry: {enterprise['industry']}
    Revenue: {enterprise['revenue']}
    Number of Employees: {enterprise['number_of_employees']}
    Market Cap: {enterprise['market_cap']}
    
    Scenario: {game['scenario']}

    based on the action you took, update the state accordingly
    
    Based on this information, provide clear outputs to update your enterprise's state. Your outputs should be in the following format:
    
    {{
        "revenue_change": float,
        "number_of_employees_change": int,
        "market_cap_change": float,
        "new_business_strategy": str
    }}
    """
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="messages"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )
    chain = prompt | llm.bind_tools(tools) | JsonOutputParser()

    def update_enterprise_state(game: Game, agent_output: dict) -> Game:
        """Update the enterprise state based on the agent's output."""
        if 'revenue_change' in agent_output:
            enterprise['revenue'] += agent_output['revenue_change']
        
        if 'number_of_employees_change' in agent_output:
            enterprise['number_of_employees'] += agent_output['number_of_employees_change']
        
        if 'market_cap_change' in agent_output:
            enterprise['market_cap'] += agent_output['market_cap_change']
        
        if 'new_business_strategy' in agent_output:
            enterprise["business_strategy"] = agent_output["new_business_strategy"]
            pass
        
        return game

    def execute_agent(game) -> Game:
        """Run the agent and update the game state."""
        """        agent_output = chain.run(messages=game['messages'])
        updated_game = update_enterprise_state(game, agent_output)"""
        return update_enterprise_state(game, chain)

    return execute_agent(game)

def create_game_supervisor(state: Game, llm: ChatNVIDIA, tools, system_prompt, members) -> Game:
    """An LLM-based router."""
    print("_______________Now I'm on the supervisor______________")
    options = ["FINISH"] + members
    system_prompt = f"""
        You are an expert assistant, the world counts on you! the world is on the verge of apocalypse, everyone is trying to take actions, you are a very wise mediator, based on the 
        events and actions, decide what entity to allow to take action next based on whom the actions and events concern the most.

        These are the world news:
            - actions taken by these entities: {', '.join(f'{c["taker"]}: {c["content"]}' for c in state["actions"])}
            - world scenarios(latest is the most important): {state["scenario"]}
            - social media messages: {state["social_media_messages"]["messages"]}
            - this is the current next: {state["next"]} CHOOOSE A DIFFERENT OPTION!

        Here are the options, think carefully!!
            {', '.join(options)}

        Return the key value below between braces, return only that, nothing more
        CHOOOSE A DIFFERENT OPTION! BE DIVERSIFYIED, CHOOSE COUNTRIES AND ENTERPRISES
        BUT DON'T DIVERGE THE CHOICE FROM THE CURRENT ACTIONS AND EVENTS
        ENTERPRISE AND ORGANIZATIONS ARE AS IMPORTANT AS COUNTRIES
        Please respond in between braces format the following result(next followed by the option you chose):
        the 'option' is replaced by your choice, return the expected format below between below so i can parse it in json
        a person's life depends on you returning the output between braces

        "next": "option"
    """
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="messages"),
            (
                "system",
                "Given the given information, who should act next?"
                " Or should we FINISH? Select one of: {options}",
            ),
        ]
    ).partial(
        options=options
    )

    chain =prompt| llm | JsonOutputParser()
    game_output = chain.invoke({"messages": [HumanMessage(content="Choose wisely!")]})
    #Before choosing the next node, generate social media messages for current and update sentiment
    if state["next"] != "supervisor":
        state = generate_social_messages(state, llm, tools) #updating social media 
        print(f"_________Social Media for country {state['next']} have been updated")
    
    state['next'] = game_output['next']
    print(state["next"])
    return state

def generate_social_messages(game: Game, llm: ChatNVIDIA, social_tools: list) -> Game:
    """
    Generates synthetic social media messages using LangChain and updates the overall sentiment.

    Args:
    game (Game): The current game state.
    llm (ChatNVIDIA): The language model to generate messages.
    social_tools (list): List of tools to be used by the agent.

    Returns:
    Game: The updated game state.
    """
    node_country =next((c for c in game['countries'] if c['name'] == game["next"]), None)
    node_enterprise = next((c for c in game['enterprises'] if c['name'] == game["next"]), None)
    if node_country:
        node = node_country
    else:
        node = node_enterprise

    sentiments = ["positive", "negative", "neutral"]
    system_prompt = """
    You are an AI tasked with generating social media messages for the current entity in relation to the world scenario. And provide the sentiment of the people for the current enterprise or country {next}
    Based on the current events, actions, current entity and social media trends, generate a list of synthetic social media messages. And based on the updated social messages, provide the overal sentiment of the mass on {next}.
    Additionally, provide a new scenario based on the news events and actions that happened, in an objective news-repoter manner.
    
        - Here are the actions taken {actions}
        - Here are the possible sentiments {sentiments}
        - Current enterprise or country: {next}
        - Current scenario: {scenario}
        - Existing messages: {social_messages}
        -current entity: {node}
    
    Generate up to 3 synthetic social media messages reflecting the current scenario.
    Your outputs should be in the following format
    JUST OUTPUT THE JSON!!! NO TALK, I ONLY THE JSON FORMAT BELOW
    {{
        "messages": [
            "Message 1",
            "Message 2",
            ...
        ],
        "social_media_sentiment": "positive" | "neutral" | "negative",
        "scenario": "New Scenario"
    }}

    You are aided with these tools {tools}, use them when you need, they'll provide you with more information
    """
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            #MessagesPlaceholder(variable_name="agent_scratchpad"),
            MessagesPlaceholder(variable_name="messages"),
        ]
    ).partial(
        social_messages=game['social_media_messages']['messages'],
        scenario=game['scenario'],
        sentiments = sentiments,
        next = game["next"],
        node = format_object(node),
        tools=", ".join([tool.name for tool in social_tools]),
        actions = ', '.join([c["content"] for c in game["actions"]])
        )

    chain = prompt | llm.bind_tools(social_tools) | JsonOutputParser()

    # Generate synthetic messages using LangChain
    agent_output = chain.invoke({"messages": [HumanMessage(content="Do what you gotta do fantastic LLM!")]})
    synthetic_messages = agent_output['messages']

    # Update the game state with the new synthetic messages
    game['social_media_messages']['messages'].extend(synthetic_messages)
    for entity in (game["countries"]+game["enterprises"]):
        if entity["name"] == game["next"]:
            entity["social_media_sentiment"] = agent_output["social_media_sentiment"]

    game["scenario"].append(agent_output["scenario"])

    return game

def format_object(obj: Union[Country, Enterprise]) -> str:
    if 'military_power' in obj:
        obj = cast(Country, obj)
        return (
            "Country:\n"
            f"  Name: {obj['name']}\n"
            f"  Military Power: {pformat(obj['military_power'])}\n"
            f"  Alliances: {obj['alliances']}\n"
            f"  Social Media Sentiment: {obj['social_media_sentiment']}\n"
            f"  Economy: {pformat(obj['economy'])}\n"
            f"  Environmental Factors: {pformat(obj['env_factors'])}\n"
            f"  Government: {pformat(obj['government'])}\n"
            f"  Flag: {obj['flag']}"
        )
    else:
        obj = cast(Enterprise, obj)
        return (
            "Enterprise:\n"
            f"  Name: {obj['name']}\n"
            f"  Industry: {obj['industry']}\n"
            f"  Revenue: {obj['revenue']}\n"
            f"  Number of Employees: {obj['number_of_employees']}\n"
            f"  Market Cap: {obj['market_cap']}\n"
            f"  Business Strategy: {obj['business_strategy']}\n"
            f"  Country of Incorporation: {obj['country_of_incorporation']}\n"
            f"  Tension with Country: {obj['tension_with_country']}\n"
            f"  Social Media Sentiment: {obj['social_media_sentiment']}\n"
            f"  Flag: {obj['flag']}"
        )

def take_action(game: Game, llm: ChatNVIDIA, node_name: str) -> str:
    """
    Based on the game state, you're allowed to take an action in response

    Args:
    game (Game): The current game state.
    llm (ChatNVIDIA): The language model to generate messages.
    node_name: Name of your node

    Returns:
    Game: The updated game state.
    """
    system_prompt = """
    You are an expert taking charge of taking action on the behalf of the {node_type}: {node_name}
    Take an action according to previous actions takes by other countries/enterprise that affected you
    Give the action in form of political-like phrase
    current situation: {node}
    Current scenario: {scenario}
    previous world actions: {actions} (latest are slightly more important)
    current events: {events}
    
    If you see that the current {node_type}: {node_name} has talked made decision before and it's the latest, output 'action':'no' between braces
    my life depends on returning an output as a dictionnary(between braces)
        "action": str
    """
    node_country =next((c for c in game['countries'] if c['name'] == node_name), None)
    node_enterprise = next((c for c in game['enterprises'] if c['name'] == node_name), None)
    if node_country:
        node = node_country
    else:
        node = node_enterprise

    if not node:
        return "No action taken here"
    
    if game["actions"] == []:
        actions = "No actions taken yet"
    else:
        actions = ', '.join([c["content"] for c in game["actions"]])

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            #MessagesPlaceholder(variable_name="agent_scratchpad"),
            MessagesPlaceholder(variable_name="messages"),
        ]

    ).partial(
        social_messages=', '.join(game['social_media_messages']['messages']),
        scenario=', then '. join(game["scenario"]),
        actions = actions,
        node = format_object(node),
        node_type=str(type(node)),
        node_name=node_name,
        events=', '.join(game["scenario"])
        )
    chain = prompt | llm | JsonOutputParser()

    # Generate actions
    agent_output = chain.invoke({"messages": [HumanMessage(content="Do what you gotta do")]})
    #print("JSON Output for take_action is ", agent_output)
    action = agent_output['action']

    print(f"The take action for {node['name']} is {action}")

    return action

async def kickoff(game: Game, user_settings: dict):
    load_env()
    workflow = StateGraph(Game)
    tools = [simple_rag, TavilySearchResults(max_results=5)]
    gov_tools = tools # TODO: Modify RAG Funct to take other input: name: Literal["gov", "social", etc.]
    
    class TooledChatNVIDIA(ServerToolsMixin, ChatNVIDIA):
        pass

    model_id = "meta/llama3-70b-instruct"
    llm = TooledChatNVIDIA(model=model_id) # Took it from the source code :)
    members = [country["name"] for country in game["countries"]] + [enterprise["name"] for enterprise in game["enterprises"]]
    random.shuffle(members)
    supervisor_agent = partial(
        create_game_supervisor,
        llm=llm,
        tools=tools,
        system_prompt="You are an expert international mediator managing interactions between countries and enterprises",
        members=members
    )
    i=1
    graph_core = {
        "nodes": [],
        "edges": []
    }

    workflow.add_node("supervisor", supervisor_agent)
    graph_core["nodes"].append({"id": i, "label": "Mediator"})
    i+=1

    enterprise_names = [enterprise["name"] for enterprise in game["enterprises"]]
    for enterprise in enterprise_names:
        workflow.add_node(enterprise, partial(create_enterprise_agent, llm=llm, tools=gov_tools, enterprise_name=enterprise))
        graph_core["nodes"].append({"id": i, "label": enterprise})
        i+=1
        workflow.add_edge(enterprise, "supervisor")
        enterprise_id = next((node["id"] for node in graph_core["nodes"] if node["label"] == enterprise), None)
        graph_core["edges"].append({"from": enterprise_id, "to": 1})

    country_names = [country["name"] for country in game["countries"]]
    print("Countries are", country_names)
    for country_name in country_names:
        country = next((c for c in game['countries'] if c['name'] == country_name), None)
        workflow.add_node(country_name, partial(create_country_agent, llm=llm, tools=tools, country_name=country_name))
        graph_core["nodes"].append({"id": i, "label": country_name})
        i+=1
        
        if country["government"]:
            gov = country["government"]
            workflow.add_node(gov["name"], partial(create_government_agent, llm=llm, tools=tools, country_name=country_name))
            graph_core["nodes"].append({"id": i, "label": gov["name"]})
            i+=1
            
            workflow.add_edge(country_name, gov["name"])
            gov_id = next((node["id"] for node in graph_core["nodes"] if node["label"] == gov["name"]), None)
            country_id = next((node["id"] for node in graph_core["nodes"] if node["label"] == country_name), None)
            graph_core["edges"].append({"from": country_id, "to": gov_id})

            workflow.add_edge(gov["name"], "supervisor")
            gov_id = next((node["id"] for node in graph_core["nodes"] if node["label"] == gov["name"]), None)
            graph_core["edges"].append({"from": gov_id, "to": 1})

    workflow.add_conditional_edges(
        "supervisor",
        lambda x: x["next"],
        {
            **{enterprise["name"]: enterprise["name"] for enterprise in game["enterprises"]},
            **{country["name"]: country["name"] for country in game["countries"]},
            "FINISH": END
        },
    )
    workflow.set_entry_point("supervisor")

    graph = workflow.compile()

    try:
        image = Image(graph.get_graph(xray=True).draw_mermaid_png())
        with open("backend/graph.png", "wb") as png:
            png.write(image.data)
    except Exception as e:
        print(e)
    return graph, graph_core