import React, { useState, useEffect, useRef } from "react";
import Diagram from "../components/Diagram";
import ClassEditor from "../components/ClassEditor";
import AssociationModal from "../components/AssociationModal";
import JavaCodeModal from "../components/JavaCodeModal";
import PHPCodeModal from "../components/PHPCodeModal";
import PythonCodeModal from "../components/PythonCodeModal";

const ClassDiagramPage = () => {
  // Initialize state from localStorage or use default values
  const [nodeDataArray, setNodeDataArray] = useState(() => {
    const saved = localStorage.getItem('umlNodeData');
    return saved ? JSON.parse(saved) : [
      { key: 1, className: "Class1", attributes: [], methods: [] },
      { key: 2, className: "Class2", attributes: [], methods: [] },
    ];
  });

  const [linkDataArray, setLinkDataArray] = useState(() => {
    const saved = localStorage.getItem('umlLinkData');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedNode, setSelectedNode] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [generatedCode, setGeneratedCode] = useState('');
  const [isJavaModalOpen, setIsJavaModalOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const diagramRef = useRef(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('umlNodeData', JSON.stringify(nodeDataArray));
    localStorage.setItem('umlLinkData', JSON.stringify(linkDataArray));
  }, [nodeDataArray, linkDataArray]);

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

  const handleSaveAssociation = (firstLink, secondLink, junctionClass) => {
    if (junctionClass) {
      // Handle many-to-many relationship
      setNodeDataArray(prev => [...prev, junctionClass]);
      setLinkDataArray(prev => [...prev, firstLink, secondLink]);
      showMessage("Association many-to-many créée avec succès!", "success");
    } else {
      // Handle regular association
      if (firstLink.from === firstLink.to) {
        showMessage("Une association ne peut pas lier une classe à elle-même.");
        return;
      }

      const isDuplicate = linkDataArray.some(
        link =>
          (link.from === firstLink.from && link.to === firstLink.to) ||
          (link.from === firstLink.to && link.to === firstLink.from)
      );

      if (isDuplicate) {
        showMessage("Cette association existe déjà.");
        return;
      }

      setLinkDataArray(prev => [...prev, firstLink]);
      showMessage("Association créée avec succès!", "success");
    }
  };

  // Add clear diagram functionality
  const handleClearDiagram = () => {
    if (window.confirm("Are you sure you want to clear the entire diagram? This action cannot be undone.")) {
      setNodeDataArray([]);
      setLinkDataArray([]);
      setSelectedNode(null);
      localStorage.removeItem('umlNodeData');
      localStorage.removeItem('umlLinkData');
      showMessage("Diagram cleared successfully!", "success");
    }
  };

  const getDiagramInstance = () => {
    return diagramRef.current?.getDiagram();
  };

  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-lg font-bold">UML Class Diagram Editor</h1>
      </nav>

      {message && (
        <div className={`p-2 ${
          messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {message}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 flex flex-col p-4">
          <div className="flex space-x-4 mb-4">
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
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              onClick={handleClearDiagram}
            >
              Clear Diagram
            </button>
            <JavaCodeModal 
              getDiagramInstance={getDiagramInstance}
              setGeneratedCode={setGeneratedCode}
              setIsModalOpen={setIsJavaModalOpen}
            />
            <PHPCodeModal 
              getDiagramInstance={getDiagramInstance}
              setGeneratedCode={setGeneratedCode}
              setIsModalOpen={setIsJavaModalOpen}
            />
            <PythonCodeModal 
              getDiagramInstance={getDiagramInstance}
              setGeneratedCode={setGeneratedCode}
              setIsModalOpen={setIsJavaModalOpen}
            />
          </div>
          <div className="flex-1">
            <Diagram
              ref={diagramRef}
              nodeDataArray={nodeDataArray}
              linkDataArray={linkDataArray}
              onNodeSelect={setSelectedNode}
              selectedNode={selectedNode}
            />
          </div>
        </div>

        <div className="w-1/3 p-4 border-l overflow-y-auto">
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

      {isJavaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl mt-20 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Generated Java Code</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    showMessage("Code copied to clipboard!", "success");
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Copy Code
                </button>
                <button 
                  onClick={() => setIsJavaModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto">
              <pre className="bg-gray-100 p-4 rounded text-sm font-mono whitespace-pre-wrap">
                <code>{generatedCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDiagramPage;