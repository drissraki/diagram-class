import React, { useState } from "react";
import Diagram from "../components/Diagram";
import ClassEditor from "../components/ClassEditor";

const ClassDiagramPage = () => {
  const [nodeDataArray, setNodeDataArray] = useState([
    {
      key: 1,
      className: "Example",
      attributes: [{ visibility: "public", name: "attr1", type: "String" }],
      methods: [{ visibility: "public", name: "method1", returnType: "void" }],
    },
  ]);
  const [linkDataArray, setLinkDataArray] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  const handleAddClass = () => {
    const newClass = {
      key: Date.now(), // Unique key
      className: "NewClass",
      attributes: [],
      methods: [],
    };
    setNodeDataArray((prevNodes) => [...prevNodes, newClass]);
  };

  const handleDeleteClass = () => {
    if (selectedNode) {
      setNodeDataArray((prevNodes) =>
        prevNodes.filter((node) => node.key !== selectedNode.key)
      );
      setSelectedNode(null); // Deselect after deletion
    }
  };

  const handleUpdateClass = (updatedClass) => {
    setNodeDataArray((prevNodes) =>
      prevNodes.map((node) => (node.key === updatedClass.key ? updatedClass : node))
    );
    setSelectedNode(updatedClass); // Update the selected node in the state
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4">
        <h1 className="text-lg font-bold">UML Class Diagram Editor</h1>
      </nav>

      {/* Content */}
      <div className="flex flex-1">
        {/* Diagram */}
        <div className="w-2/3 p-4">
          <div className="flex justify-between mb-4">
            <button
              onClick={handleAddClass}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Add Class
            </button>
            <button
              onClick={handleDeleteClass}
              className={`bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded ${
                !selectedNode ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!selectedNode}
            >
              Delete Class
            </button>
          </div>
          <Diagram
            nodeDataArray={nodeDataArray}
            linkDataArray={linkDataArray}
            onNodeSelect={handleNodeSelect}
            onModelChange={(model) => console.log("Model changed", model)}
          />
        </div>

        {/* Class Editor */}
        <div className="w-1/3 p-4 border-l">
          {selectedNode ? (
            <ClassEditor
              selectedNode={selectedNode}
              onUpdateClass={handleUpdateClass}
            />
          ) : (
            <p className="text-gray-500">Select a class to edit its details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDiagramPage;
