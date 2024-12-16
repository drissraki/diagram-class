// In src/components/Diagram.js
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import go from 'gojs';

const Diagram = forwardRef(({ nodeDataArray, linkDataArray, onNodeSelect, selectedNode }, ref) => {
  const diagramRef = useRef(null);
  const diagramInstance = useRef(null);
  const positionsRef = useRef(new Map());

  const handleSelectionChange = (node) => {
    if (onNodeSelect && node) {
      onNodeSelect(node.data);
    }
  };

  const saveNodePositions = () => {
    if (diagramInstance.current) {
      diagramInstance.current.nodes.each(node => {
        if (node.location) {
          positionsRef.current.set(node.data.key, {
            x: node.location.x,
            y: node.location.y
          });
        }
      });
    }
  };

  const restoreNodePositions = () => {
    if (diagramInstance.current) {
      diagramInstance.current.nodes.each(node => {
        const savedPos = positionsRef.current.get(node.data.key);
        if (savedPos) {
          node.location = new go.Point(savedPos.x, savedPos.y);
        }
      });
    }
  };

  useEffect(() => {
    if (!diagramInstance.current && diagramRef.current) {
      const $ = go.GraphObject.make;
      
      // Initialize diagram
      diagramInstance.current = $(go.Diagram, diagramRef.current, {
        "undoManager.isEnabled": true,
        contentAlignment: go.Spot.Center,
        layout: $(go.ForceDirectedLayout, { 
          defaultSpringLength: 100,
          defaultElectricalCharge: 100
        }),
        "animationManager.isEnabled": false,
        initialDocumentSpot: go.Spot.Center,
        initialViewportSpot: go.Spot.Center,
        fixedBounds: new go.Rect(0, 0, 750, 750),
        "grid.visible": true,
        "grid.gridCellSize": new go.Size(50, 50),
        "draggingTool.isGridSnapEnabled": true,
        "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
        minScale: 0.25,
        maxScale: 2,
        padding: new go.Margin(50, 50, 50, 50),
        "SelectionMoved": saveNodePositions,
        "InitialLayoutCompleted": (e) => {
          restoreNodePositions();
          const boardBorder = $(
            go.Part,
            {
              layerName: "Background",
              position: new go.Point(0, 0),
              selectable: false,
              pickable: false
            },
            $(go.Shape,
              "Rectangle",
              {
                width: 750,
                height: 750,
                strokeWidth: 2,
                stroke: "#cbd5e1",
                fill: "transparent"
              }
            )
          );
          e.diagram.add(boardBorder);
        },
        click: function(e) {
          const part = e.diagram.findPartAt(e.viewPoint, true);
          if (onNodeSelect) {
            if (part instanceof go.Node) {
              onNodeSelect(part.data);
            } else {
              onNodeSelect(null);
            }
          }
        }
      });

      // Node template
      diagramInstance.current.nodeTemplate = $(
        go.Node,
        "Auto",
        { selectable: true, selectionChanged: handleSelectionChange },
        $(
          go.Shape,
          "RoundedRectangle",
          { 
            fill: "white",
            stroke: "#1a365d",
            strokeWidth: 2,
          },
          new go.Binding("fill", "key", (k) => {
            const hue = (k * 137.508) % 360;
            return `hsl(${hue}, 70%, 95%)`;
          })
        ),
        $(
          go.Panel,
          "Table",
          { defaultAlignment: go.Spot.Left },
          $(
            go.TextBlock,
            { 
              row: 0, 
              font: "bold 14px Arial", 
              margin: 8,
              alignment: go.Spot.Center,
              editable: true 
            },
            new go.Binding("text", "className")
          ),
          $(
            go.Shape,
            "LineH",
            { 
              row: 1, 
              height: 1, 
              stretch: go.GraphObject.Horizontal,
              strokeWidth: 1,
              stroke: "#1a365d"
            }
          ),
          $(
            go.TextBlock,
            { row: 2, font: "italic 12px Arial", margin: new go.Margin(5, 5, 0, 5) },
            "Attributes"
          ),
          $(
            go.TextBlock,
            {
              row: 3,
              margin: 5,
              editable: false,
              isMultiline: true,
            },
            new go.Binding("text", "attributes", (attributes) =>
              attributes.map((attr) => `${attr.visibility} ${attr.name}: ${attr.type}`).join("\n")
            )
          ),
          $(
            go.Shape,
            "LineH",
            { 
              row: 4, 
              height: 1, 
              stretch: go.GraphObject.Horizontal,
              strokeWidth: 1,
              stroke: "#1a365d"
            }
          ),
          $(
            go.TextBlock,
            { row: 5, font: "italic 12px Arial", margin: new go.Margin(5, 5, 0, 5) },
            "Methods"
          ),
          $(
            go.TextBlock,
            {
              row: 6,
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

      // Link template
      diagramInstance.current.linkTemplate = $(
        go.Link,
        { routing: go.Link.Orthogonal, corner: 5 },
        $(
          go.Shape,
          { strokeWidth: 2 },
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
            segmentOffset: new go.Point(10, -10),
            segmentIndex: 0,
            font: "12px Arial"
          },
          new go.Binding("text", "fromCardinality")
        ),
        $(
          go.TextBlock,
          {
            segmentOffset: new go.Point(-10, -10),
            segmentIndex: -1,
            font: "12px Arial"
          },
          new go.Binding("text", "toCardinality")
        )
      );

      // Ensure model is set
      const model = new go.GraphLinksModel({
        nodeDataArray: nodeDataArray,
        linkDataArray: linkDataArray,
        linkKeyProperty: 'key'
      });
      
      diagramInstance.current.model = model;
    }

    // Update model data
    if (diagramInstance.current) {
      const diagram = diagramInstance.current;
      diagram.startTransaction("update");
      diagram.model.nodeDataArray = nodeDataArray;
      diagram.model.linkDataArray = linkDataArray;
      restoreNodePositions();
      diagram.commitTransaction("update");
    }

    diagramRef.current = diagramInstance.current;
  }, [nodeDataArray, linkDataArray, onNodeSelect, handleSelectionChange]);

  useEffect(() => {
    const handleResize = () => {
      if (diagramInstance.current && diagramRef.current) {
        const container = diagramRef.current;
        const containerWidth = container.clientWidth || 800;
        const containerHeight = container.clientHeight || 600;
        
        if (containerWidth && containerHeight) {
          const scale = Math.min(
            Math.max(0.25, (containerWidth - 100) / 750),
            Math.max(0.25, (containerHeight - 100) / 750)
          );
          
          if (!isNaN(scale) && isFinite(scale) && scale > 0) {
            diagramInstance.current.scale = scale;
            diagramInstance.current.centerRect(diagramInstance.current.fixedBounds);
          }
        }
      }
    };

    const timer = setTimeout(() => {
      handleResize();
    }, 100);

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getDiagram: () => diagramInstance.current
  }));

  return (
    <div className="relative">
      <div 
        ref={diagramRef} 
        style={{ 
          width: "100%", 
          height: "calc(100vh - 140px)",
          minWidth: "800px",
          minHeight: "600px",
          border: "1px solid #e2e8f0",
          borderRadius: "0.375rem",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          position: "relative"
        }} 
      />
    </div>
  );
});

export default Diagram;