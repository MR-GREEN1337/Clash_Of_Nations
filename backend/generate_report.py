from typing import Union
import uuid
from langchain_nvidia_ai_endpoints import ChatNVIDIA
import markdown2
from weasyprint import HTML
from graph import Country, Enterprise, Game
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage

async def generate_markdown(game: Game, tools):
    system_prompt = """
    You are an AI Expert in Generate Geopolitical Reports, based on the data provided about the interactions that happened between different entities,
    Generate a report outlying the different actions and events an their cause as well as as what could have gone better for the {node_type}: {node_name}.
    Analyse situation of {node_type}: {node_name} And tell what are the solutions
    Here's the data about the interactions:
        - Countries: {countries}
        - Enterprises: {enterprises}
        - Actions: {actions}
        - Events: {events}
    
    Generate a thourough report in Markdown format, ONLY MARKDOWN NO OTHER MESSAGE!
    """
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            #MessagesPlaceholder(variable_name="agent_scratchpad"),
            MessagesPlaceholder(variable_name="messages"),
        ]
    ).partial(
        social_messages=', '.join(game['social_media_messages']['messages']),
        events=', '.join(game['scenario']),
        enterprises =', \n'.join([display_node(node) for node in game["enterprises"]]),
        countries=', \n'.join([display_node(node) for node in game["countries"]]),
        actions = ', '.join([f'{c["taker"]}:{c["content"]}' for c in game["actions"]]),
        node_type = node_game(game)[0],
        node_name = node_game(game)[1]
        )

    model_id = "meta/llama3-70b-instruct"
    llm = ChatNVIDIA(model=model_id)
    chain = prompt | llm

    output = chain.invoke({"messages": [HumanMessage(content="Generate a long good report")]})
    print(output.content)
    html_content = markdown2.markdown(output.content)
    uuid_key = uuid.uuid4()
    output_pdf = f"report_{uuid_key}.pdf"

    return HTML(string=html_content).write_pdf(output_pdf), output_pdf

def node_game(game: Game):
    for node in game["enterprises"]:
        if node["flag"] == "Human":
            if "military_power" in node:
                return ["Country", node["name"]]
            
            else:
                return ["Enterprise", node["name"]]

def display_node(node: Union[Country, Enterprise]) -> str:
    if 'military_power' in node:
        country = node
        env_factors_str = (f"Carbon Emissions: {country['env_factors']['carbon_emissions']}, "
                           f"Renewable Energy Percentage: {country['env_factors']['renewable_energy_percentage']}, "
                           f"Natural Disaster Risk: {country['env_factors']['natural_disaster_risk']}"
                           if country.get('env_factors') else "No environmental factors data available")

        return (f"Country: {country['name']}\n"
                f"Military Power - Nuclear Capability: {country['military_power']['nuclear_capability']}\n"
                f"Alliances: {', '.join(country['alliances'])}\n"
                f"Social Media Sentiment: {country['social_media_sentiment']}\n"
                f"Economy - Inflation Rate: {country['economy'].get('inflation_rate', 'N/A')}, "
                f"Unemployment Rate: {country['economy'].get('unemployement_rate', 'N/A')}, "
                f"GDP: {country['economy'].get('GDP', 'N/A')}, "
                f"HDI: {country['economy'].get('HDI', 'N/A')}\n"
                f"Environment: {env_factors_str}\n"
                f"Government - Name: {country['government']['name']}, System: {country['government']['system']}, "
                f"Democracy Level: {country['government'].get('democracy_level', 'N/A')}, "
                f"Corruption Index: {country['government'].get('corruption_index', 'N/A')}, "
                f"Human Rights Record: {country['government'].get('human_rights_record', 'N/A')}, "
                f"Election Frequency: {country['government'].get('election_frequency', 'N/A')}\n")
    else:
        # It's an Enterprise
        enterprise = node
        return (f"Enterprise: {enterprise['name']}\n"
                f"Industry: {enterprise['industry']}\n"
                f"Revenue: {enterprise['revenue']}\n"
                f"Number of Employees: {enterprise['number_of_employees']}\n"
                f"Market Cap: {enterprise['market_cap']}\n"
                f"Business Strategy: {enterprise['business_strategy']}\n"
                f"Country of Incorporation: {enterprise['country_of_incorporation']}\n"
                f"Tension with Country: {enterprise['tension_with_country']}\n"
                f"Social Media Sentiment: {enterprise['social_media_sentiment']}\n")

if __name__ == "__main__":
    generate_markdown()
