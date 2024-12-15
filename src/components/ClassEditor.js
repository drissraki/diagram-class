import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const ClassEditor = ({ 
  selectedNode, 
  onUpdateClassName, 
  onAttributeOperation, 
  onMethodOperation 
}) => {
  const [className, setClassName] = useState("");
  const [tempAttribute, setTempAttribute] = useState({
    visibility: "",
    name: "",
    type: "",
  });
  const [tempMethod, setTempMethod] = useState({
    visibility: "",
    name: "",
    returnType: "",
    args: "",
  });
  const [editIndexAttribute, setEditIndexAttribute] = useState(null);
  const [editIndexMethod, setEditIndexMethod] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const visibilityOptions = ["+", "-", "#"];
  const typeOptions = ["int", "string", "boolean", "float", "double", "char", "void"];

  useEffect(() => {
    if (selectedNode) {
      setClassName(selectedNode.className);
      // Reset temporary states when selecting a new node
      setTempAttribute({ visibility: "", name: "", type: "" });
      setTempMethod({ visibility: "", name: "", returnType: "", args: "" });
      setEditIndexAttribute(null);
      setEditIndexMethod(null);
    }
  }, [selectedNode]);

  const showMessage = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleClassNameSubmit = () => {
    if (!className.trim()) {
      showMessage("Class name cannot be empty");
      return;
    }
    const success = onUpdateClassName({
      ...selectedNode,
      className: className
    });
    if (!success) {
      setClassName(selectedNode.className);
    }
  };

  const handleAddOrUpdateAttribute = () => {
    if (!tempAttribute.visibility || !tempAttribute.name || !tempAttribute.type) {
      showMessage("Please fill all attribute fields");
      return;
    }

    const success = editIndexAttribute !== null
      ? onAttributeOperation('update', {
          index: editIndexAttribute,
          attribute: tempAttribute
        })
      : onAttributeOperation('add', tempAttribute);

    if (success) {
      setTempAttribute({ visibility: "", name: "", type: "" });
      setEditIndexAttribute(null);
    }
  };

  const handleEditAttribute = (index) => {
    const attribute = selectedNode.attributes[index];
    setTempAttribute({ ...attribute });
    setEditIndexAttribute(index);
  };

  const handleRemoveAttribute = (index) => {
    onAttributeOperation('delete', index);
  };

  const handleAddOrUpdateMethod = () => {
    if (!tempMethod.visibility || !tempMethod.name || !tempMethod.returnType) {
      showMessage("Please fill all required method fields");
      return;
    }

    const parsedArgs = tempMethod.args
      ? tempMethod.args.split(",").map(arg => arg.trim()).filter(arg => arg.length > 0)
      : [];

    const methodData = { ...tempMethod, args: parsedArgs };

    const success = editIndexMethod !== null
      ? onMethodOperation('update', {
          index: editIndexMethod,
          method: methodData
        })
      : onMethodOperation('add', methodData);

    if (success) {
      setTempMethod({ visibility: "", name: "", returnType: "", args: "" });
      setEditIndexMethod(null);
    }
  };

  const handleEditMethod = (index) => {
    const method = selectedNode.methods[index];
    setTempMethod({
      ...method,
      args: method.args.join(", ")
    });
    setEditIndexMethod(index);
  };

  const handleRemoveMethod = (index) => {
    onMethodOperation('delete', index);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded ${
          messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Class Name</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="flex-grow border p-2 rounded-md"
          />
          <button
            onClick={handleClassNameSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Update
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Attributes</h3>
        <ul className="space-y-2">
          {selectedNode.attributes.map((attr, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm"
            >
              <span>{`${attr.visibility} ${attr.name}: ${attr.type}`}</span>
              <div className="space-x-2">
                <button
                  onClick={() => handleEditAttribute(index)}
                  className="text-blue-500 hover:text-blue-600 px-2 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveAttribute(index)}
                  className="text-red-500 hover:text-red-600 px-2 py-1"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-3 gap-4">
          <select
            value={tempAttribute.visibility}
            onChange={(e) => setTempAttribute({ ...tempAttribute, visibility: e.target.value })}
            className="border p-2 rounded-md"
          >
            <option value="">Visibility</option>
            {visibilityOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Name"
            value={tempAttribute.name}
            onChange={(e) => setTempAttribute({ ...tempAttribute, name: e.target.value })}
            className="border p-2 rounded-md"
          />
          <select
            value={tempAttribute.type}
            onChange={(e) => setTempAttribute({ ...tempAttribute, type: e.target.value })}
            className="border p-2 rounded-md"
          >
            <option value="">Type</option>
            {typeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAddOrUpdateAttribute}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
        >
          {editIndexAttribute !== null ? "Update Attribute" : "Add Attribute"}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Methods</h3>
        <ul className="space-y-2">
          {selectedNode.methods.map((method, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm"
            >
              <span>
                {`${method.visibility} ${method.name}(${method.args.join(", ")}): ${method.returnType}`}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => handleEditMethod(index)}
                  className="text-blue-500 hover:text-blue-600 px-2 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveMethod(index)}
                  className="text-red-500 hover:text-red-600 px-2 py-1"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-4">
          <select
            value={tempMethod.visibility}
            onChange={(e) => setTempMethod({ ...tempMethod, visibility: e.target.value })}
            className="border p-2 rounded-md"
          >
            <option value="">Visibility</option>
            {visibilityOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Method Name"
            value={tempMethod.name}
            onChange={(e) => setTempMethod({ ...tempMethod, name: e.target.value })}
            className="border p-2 rounded-md"
          />
          <select
            value={tempMethod.returnType}
            onChange={(e) => setTempMethod({ ...tempMethod, returnType: e.target.value })}
            className="border p-2 rounded-md"
          >
            <option value="">Return Type</option>
            {typeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Arguments (comma separated)"
            value={tempMethod.args}
            onChange={(e) => setTempMethod({ ...tempMethod, args: e.target.value })}
            className="border p-2 rounded-md"
          />
        </div>
        <button
          onClick={handleAddOrUpdateMethod}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
        >
          {editIndexMethod !== null ? "Update Method" : "Add Method"}
        </button>
      </div>
    </div>
  );
};

ClassEditor.propTypes = {
  selectedNode: PropTypes.object.isRequired,
  onUpdateClassName: PropTypes.func.isRequired,
  onAttributeOperation: PropTypes.func.isRequired,
  onMethodOperation: PropTypes.func.isRequired
};

export default ClassEditor;