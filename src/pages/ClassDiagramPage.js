import React, { useState } from "react";
import Diagram from "../components/Diagram";
import ClassEditor from "../components/ClassEditor";
import AssociationModal from "../components/AssociationModal";

const ClassDiagramPage = () => {
  const [nodeDataArray, setNodeDataArray] = useState([
    { key: 1, className: "Class1", attributes: [], methods: [] },
    { key: 2, className: "Class2", attributes: [], methods: [] },
  ]);
  const [linkDataArray, setLinkDataArray] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleAddClass = () => {
    const newClass = {
      key: Date.now(),
      className: `Class${nodeDataArray.length + 1}`,
      attributes: [],
      methods: [],
    };
    setNodeDataArray(prev => [...prev, newClass]);
    showMessage("New class added successfully!", "success");
  };

  const handleDeleteClass = () => {
    if (!selectedNode) {
      showMessage("Please select a class to delete.");
      return;
    }

    const hasAssociations = linkDataArray.some(
      link => link.from === selectedNode.key || link.to === selectedNode.key
    );

    if (hasAssociations) {
      const confirmDelete = window.confirm(
        "This class has associations. Deleting it will remove all its associations. Continue?"
      );
      if (!confirmDelete) return;
    }

    setNodeDataArray(prev => prev.filter(node => node.key !== selectedNode.key));
    setLinkDataArray(prev => 
      prev.filter(link => link.from !== selectedNode.key && link.to !== selectedNode.key)
    );
    setSelectedNode(null);
    showMessage("Class deleted successfully!", "success");
  };

  const handleUpdateClassName = (updatedNode) => {
    const isDuplicateName = nodeDataArray.some(
      node => node.key !== updatedNode.key && node.className === updatedNode.className
    );

    if (isDuplicateName) {
      showMessage("A class with this name already exists!");
      return false;
    }

    setNodeDataArray(prev =>
      prev.map(node => 
        node.key === updatedNode.key 
          ? { ...node, className: updatedNode.className }
          : node
      )
    );
    showMessage("Class name updated successfully!", "success");
    return true;
  };

  const handleAttributeOperation = (operation, data) => {
    if (!selectedNode) return;

    const currentNode = nodeDataArray.find(node => node.key === selectedNode.key);
    if (!currentNode) return;

    let updatedAttributes = [...currentNode.attributes];

    switch (operation) {
      case 'add':
        const isDuplicateAttr = updatedAttributes.some(
          attr => attr.name === data.name && attr.type === data.type
        );
        if (isDuplicateAttr) {
          showMessage("An attribute with this name and type already exists!");
          return false;
        }
        updatedAttributes.push(data);
        break;

      case 'update':
        const otherAttributes = updatedAttributes.filter((_, i) => i !== data.index);
        const isDuplicateUpdate = otherAttributes.some(
          attr => attr.name === data.attribute.name && attr.type === data.attribute.type
        );
        if (isDuplicateUpdate) {
          showMessage("An attribute with this name and type already exists!");
          return false;
        }
        updatedAttributes[data.index] = data.attribute;
        break;

      case 'delete':
        updatedAttributes = updatedAttributes.filter((_, index) => index !== data);
        break;

      default:
        return false;
    }

    setNodeDataArray(prev =>
      prev.map(node =>
        node.key === selectedNode.key
          ? { ...node, attributes: updatedAttributes }
          : node
      )
    );

    setSelectedNode(prev => ({ ...prev, attributes: updatedAttributes }));
    
    showMessage(
      operation === 'delete' 
        ? "Attribute deleted successfully!"
        : operation === 'update'
        ? "Attribute updated successfully!"
        : "Attribute added successfully!",
      "success"
    );
    return true;
  };

  const handleMethodOperation = (operation, data) => {
    if (!selectedNode) return;

    const currentNode = nodeDataArray.find(node => node.key === selectedNode.key);
    if (!currentNode) return;

    let updatedMethods = [...currentNode.methods];

    switch (operation) {
      case 'add':
        const isDuplicateMethod = updatedMethods.some(
          method => 
            method.name === data.name && 
            method.returnType === data.returnType &&
            JSON.stringify(method.args) === JSON.stringify(data.args)
        );
        if (isDuplicateMethod) {
          showMessage("A method with this signature already exists!");
          return false;
        }
        updatedMethods.push(data);
        break;

      case 'update':
        const otherMethods = updatedMethods.filter((_, i) => i !== data.index);
        const isDuplicateUpdate = otherMethods.some(
          method => 
            method.name === data.method.name && 
            method.returnType === data.method.returnType &&
            JSON.stringify(method.args) === JSON.stringify(data.method.args)
        );
        if (isDuplicateUpdate) {
          showMessage("A method with this signature already exists!");
          return false;
        }
        updatedMethods[data.index] = data.method;
        break;

      case 'delete':
        updatedMethods = updatedMethods.filter((_, index) => index !== data);
        break;

      default:
        return false;
    }

    setNodeDataArray(prev =>
      prev.map(node =>
        node.key === selectedNode.key
          ? { ...node, methods: updatedMethods }
          : node
      )
    );

    setSelectedNode(prev => ({ ...prev, methods: updatedMethods }));

    showMessage(
      operation === 'delete' 
        ? "Method deleted successfully!"
        : operation === 'update'
        ? "Method updated successfully!"
        : "Method added successfully!",
      "success"
    );
    return true;
  };

  const handleSaveAssociation = (linkData) => {
    if (linkData.from === linkData.to) {
      showMessage("An association cannot link a class to itself.");
      return;
    }

    const isDuplicate = linkDataArray.some(
      link =>
        (link.from === linkData.from && link.to === linkData.to) ||
        (link.from === linkData.to && link.to === linkData.from)
    );

    if (isDuplicate) {
      showMessage("This association already exists.");
      return;
    }

    setLinkDataArray(prev => [...prev, linkData]);
    setModalOpen(false);
    showMessage("Association created successfully!", "success");
  };

  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-blue-600 text-white p-4">
        <h1 className="text-lg font-bold">UML Class Diagram Editor</h1>
      </nav>

      {message && (
        <div className={`p-4 ${
          messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {message}
        </div>
      )}

      <div className="flex-grow flex">
        <div className="w-2/3 p-4">
          <div className="mb-4 flex space-x-4">
            <button
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              onClick={handleAddClass}
            >
              Add Class
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              onClick={handleDeleteClass}
            >
              Delete Selected Class
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
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

        <div className="w-1/3 p-4 border-l">
          {selectedNode ? (
            <ClassEditor
              selectedNode={selectedNode}
              onUpdateClassName={handleUpdateClassName}
              onAttributeOperation={handleAttributeOperation}
              onMethodOperation={handleMethodOperation}
            />
          ) : (
            <p className="text-gray-500">Select a class to edit its details.</p>
          )}
        </div>
      </div>

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