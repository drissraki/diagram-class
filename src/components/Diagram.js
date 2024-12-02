import React, { useRef, useEffect } from "react";
import * as go from "gojs";

const Diagram = ({ nodeDataArray, linkDataArray, onNodeSelect, onModelChange }) => {
  const diagramRef = useRef(null);
  const diagramInstance = useRef(null);

  useEffect(() => {
    if (!diagramInstance.current) {
      const $ = go.GraphObject.make;

      diagramInstance.current = $(
        go.Diagram,
        diagramRef.current,
        {
          "undoManager.isEnabled": true,
          click: function (e, obj) {
            if (onNodeSelect) {
              onNodeSelect(obj.part.data);
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
          $(go.TextBlock, { row: 0, font: "bold 14px Arial", margin: 5, editable: true }, new go.Binding("text", "className")),
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
              methods.map((method) => `${method.visibility} ${method.name}(): ${method.returnType}`).join("\n")
            )
          )
        )
      );

      // Define the link template
      diagramInstance.current.linkTemplate = $(
        go.Link,
        $(go.Shape),
        $(go.Shape, { toArrow: "Standard" })
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

  const handleSelectionChange = (node) => {
    if (onNodeSelect && node) {
      onNodeSelect(node.data);
    }
  };

  useEffect(() => {
    if (diagramInstance.current) {
      // Update the diagram model when nodeDataArray or linkDataArray changes
      diagramInstance.current.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
    }
  }, [nodeDataArray, linkDataArray]);

  return <div ref={diagramRef} style={{ width: "100%", height: "600px", border: "1px solid black" }} />;
};

export default Diagram;
