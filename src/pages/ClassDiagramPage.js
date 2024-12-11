import React, { useState } from "react";
import Diagram from "../components/Diagram"; // Ensure this component can render nodes and links
import ClassEditor from "../components/ClassEditor"; // For editing class details
import AssociationModal from "../components/AssociationModal"; // Modal for creating associations

const ClassDiagramPage = () => {
  const [nodeDataArray, setNodeDataArray] = useState([
    { key: 1, className: "Class1", attributes: [], methods: [] },
    { key: 2, className: "Class2", attributes: [], methods: [] },
  ]);

  const [linkDataArray, setLinkDataArray] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // Add a new class to the diagram
  const handleAddClass = () => {
    const newClass = {
      key: Date.now(), // Unique key using current timestamp
      className: `Class${nodeDataArray.length + 1}`,
      attributes: [],
      methods: [],
    };
    setNodeDataArray((prev) => [...prev, newClass]);
  };

  // Delete the selected class and its related links
  const handleDeleteClass = () => {
    if (selectedNode) {
      setNodeDataArray((prev) =>
        prev.filter((node) => node.key !== selectedNode.key)
      );

      setLinkDataArray((prev) =>
        prev.filter(
          (link) => link.from !== selectedNode.key && link.to !== selectedNode.key
        )
      );

      setSelectedNode(null); // Clear the selected node
    } else {
      alert("Please select a class to delete.");
    }
  };

  // Save a new association link
  const handleSaveAssociation = (
    fromClassKey,
    toClassKey,
    fromCardinality,
    toCardinality,
    associationType
  ) => {
    if (fromClassKey === toClassKey) {
      alert("An association cannot link a class to itself.");
      return;
    }

    const isDuplicate = linkDataArray.some(
      (link) =>
        (link.from === parseInt(fromClassKey) &&
          link.to === parseInt(toClassKey)) ||
        (link.from === parseInt(toClassKey) &&
          link.to === parseInt(fromClassKey))
    );

    if (isDuplicate) {
      alert("This association already exists.");
      return;
    }

    const newLink = {
      from: parseInt(fromClassKey),
      to: parseInt(toClassKey),
      fromCardinality,
      toCardinality,
      type: associationType,
    };

    setLinkDataArray((prev) => [...prev, newLink]);
    setModalOpen(false); // Close modal after saving
  };

  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-blue-600 text-white p-4">
        <h1 className="text-lg font-bold">UML Class Diagram Editor</h1>
      </nav>
      <div className="flex-grow flex">
        {/* Diagram Section */}
        <div className="w-2/3 p-4">
          <div className="mb-4 flex space-x-4">
            <button
              className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded"
              onClick={handleAddClass}
            >
              Add Class
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded"
              onClick={handleDeleteClass}
            >
              Delete Selected Class
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
              onClick={() => setModalOpen(true)}
            >
              Add Association
            </button>
          </div>
          <Diagram
            nodeDataArray={nodeDataArray}
            linkDataArray={linkDataArray}
            onNodeSelect={setSelectedNode}
            selectedNode={selectedNode}
          />
        </div>

        {/* Class Editor Section */}
        <div className="w-1/3 p-4 border-l">
          {selectedNode ? (
            <ClassEditor
              selectedNode={selectedNode}
              onUpdateClass={(updated) =>
                setNodeDataArray((prev) =>
                  prev.map((node) =>
                    node.key === updated.key ? updated : node
                  )
                )
              }
            />
          ) : (
            <p className="text-gray-500">Select a class to edit its details.</p>
          )}
        </div>
      </div>

      {/* Association Modal */}
      {isModalOpen && (
        <AssociationModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          nodeDataArray={nodeDataArray}
          onSave={handleSaveAssociation}
        />
      )}
    </div>
  );
};

export default ClassDiagramPage;
