import React from 'react';
import Graph from "react-graph-vis";
import uuid from "react-uuid";

const GraphComp = ({ graphData }) => {
  const options = {
    layout: {
      hierarchical: false,
    },
    nodes: {
      color: "white",
    },
    edges: {
      color: "gold",
    },
    height: "900px",
  };

  const events = {
    select: function(event) {
      var { nodes, edges } = event;
    }
  };

  return (
    <Graph
      key={uuid()}
      graph={graphData}
      options={options}
      events={events}
    />
  );
}

export default GraphComp;
