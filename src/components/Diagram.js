import React, { useRef, useEffect } from "react";
import * as go from "gojs";

const Diagram = ({ nodeDataArray, linkDataArray, onNodeSelect, onModelChange }) => {
  const diagramRef = useRef(null);
  const diagramInstance = useRef(null);

  const handleSelectionChange = (node) => {
    if (onNodeSelect && node) {
      onNodeSelect(node.data);
    }
  };

  useEffect(() => {
    if (!diagramInstance.current) {
      const $ = go.GraphObject.make;

      diagramInstance.current = $(
        go.Diagram,
        diagramRef.current,
        {
          "undoManager.isEnabled": true,
          click: function (e) {
            const part = e.subject.part;
            if (onNodeSelect) {
              if (part) {
                onNodeSelect(part.data);
              } else {
                onNodeSelect(null);
              }
            }
          },
        }
      );

      // Define the node template
      diagramInstance.current.nodeTemplate = $(
        go.Node,
        "Auto",
        { selectable: true, selectionChanged: handleSelectionChange },
        $(go.Shape, "RoundedRectangle", { fill: "lightyellow", stroke: "gold", strokeWidth: 2 }),
        $(
          go.Panel,
          "Table",
          $(
            go.TextBlock,
            { 
              row: 0, 
              font: "bold 14px Arial", 
              margin: 5, 
              editable: true 
            },
            new go.Binding("text", "className")
          ),
          $(
            go.TextBlock,
            { row: 1, font: "italic 12px Arial", margin: 5 },
            "Attributes"
          ),
          $(
            go.TextBlock,
            {
              row: 2,
              margin: 5,
              editable: false,
              isMultiline: true,
            },
            new go.Binding("text", "attributes", (attributes) =>
              attributes.map((attr) => `${attr.visibility} ${attr.name}: ${attr.type}`).join("\n")
            )
          ),
          $(
            go.TextBlock,
            { row: 3, font: "italic 12px Arial", margin: 5 },
            "Methods"
          ),
          $(
            go.TextBlock,
            {
              row: 4,
              margin: 5,
              editable: false,
              isMultiline: true,
            },
            new go.Binding("text", "methods", (methods) =>
              methods.map((method) => {
                const args = method.args && method.args.length > 0 
                  ? method.args.join(", ")
                  : "";
                return `${method.visibility} ${method.name}(${args}): ${method.returnType}`;
              }).join("\n")
            )
          )
        )
      );

      // Define the link template
      diagramInstance.current.linkTemplate = $(
        go.Link,
        { routing: go.Link.Orthogonal, corner: 5 },
        $(
          go.Shape,
          { 
            strokeWidth: 2,
          },
          new go.Binding("stroke", "stroke"),
          new go.Binding("strokeDashArray", "strokeDashArray")
        ),
        $(
          go.Shape,
          { 
            toArrow: "Standard",
            scale: 1,
            width: 10,
            height: 10
          },
          new go.Binding("toArrow", "toArrow"),
          new go.Binding("fromArrow", "fromArrow"),
          new go.Binding("fill", "fill"),
          new go.Binding("stroke", "stroke")
        ),
        $(
          go.TextBlock,
          {
            segmentIndex: 0,
            segmentOffset: new go.Point(-30, -10),
            font: "10pt Arial"
          },
          new go.Binding("text", "fromCardinality")
        ),
        $(
          go.TextBlock,
          {
            segmentIndex: -1,
            segmentOffset: new go.Point(30, -10),
            font: "10pt Arial"
          },
          new go.Binding("text", "toCardinality")
        )
      );

      // Initialize the diagram model
      diagramInstance.current.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

      // Add model change listener
      diagramInstance.current.model.addChangedListener((e) => {
        if (e.isTransactionFinished && onModelChange) {
          onModelChange(diagramInstance.current.model.toJson());
        }
      });
    }
  }, [nodeDataArray, linkDataArray, onModelChange, onNodeSelect]);

  useEffect(() => {
    if (diagramInstance.current) {
      // Update the diagram model when nodeDataArray or linkDataArray changes
      diagramInstance.current.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
    }
  }, [nodeDataArray, linkDataArray]);

  return <div ref={diagramRef} style={{ width: "100%", height: "600px", border: "1px solid black" }} />;
};

export default Diagram;