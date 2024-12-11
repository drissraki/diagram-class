import React, { useState } from "react";

const ClassEditor = ({ selectedNode, onUpdateClass }) => {
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
  const [className, setClassName] = useState(selectedNode?.className || "");
  const [editIndexAttribute, setEditIndexAttribute] = useState(null);
  const [editIndexMethod, setEditIndexMethod] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const visibilityOptions = ["+", "-", "#"];
  const typeOptions = ["int", "string", "boolean", "float", "double", "char", "object"];
  const returnTypeOptions = ["void", "int", "string", "boolean", "float", "double", "char"];

  const handleClassNameChange = (e) => {
    if (!selectedNode) return; // Check if selectedNode is valid
    setClassName(e.target.value);
    onUpdateClass({ ...selectedNode, className: e.target.value });
  };

  const isValidAttributeName = (name, type) => {
    if (!selectedNode) return false;
    return (
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) &&
      !selectedNode.attributes.some((attr) => attr.name === name && attr.type === type)
    );
  };

  const handleAddOrUpdateAttribute = () => {
    if (!selectedNode) return; // Ensure selectedNode is available before proceeding
    const { visibility, name, type } = tempAttribute;
    if (!visibility || !name || !type) {
      setMessage("Please fill out all fields correctly.");
      setMessageType("error");
      return;
    }

    if (!isValidAttributeName(name, type)) {
      setMessage("An attribute with the same name and type already exists.");
      setMessageType("error");
      return;
    }

    if (editIndexAttribute === null) {
      const updatedNode = {
        ...selectedNode,
        attributes: [...selectedNode.attributes, tempAttribute],
      };
      onUpdateClass(updatedNode);
      setMessage("Attribute added successfully!");
      setMessageType("success");
    } else {
      const updatedAttributes = selectedNode.attributes.map((attr, i) =>
        i === editIndexAttribute ? tempAttribute : attr
      );
      const updatedNode = { ...selectedNode, attributes: updatedAttributes };
      onUpdateClass(updatedNode);
      setMessage("Attribute updated successfully!");
      setMessageType("success");
    }

    setTempAttribute({ visibility: "", name: "", type: "" });
    setEditIndexAttribute(null);
  };

  const handleAddOrUpdateMethod = () => {
    if (!selectedNode) return; // Ensure selectedNode is available before proceeding
    const { visibility, name, returnType, args } = tempMethod;
    if (!visibility || !name || !returnType) {
      setMessage("Please fill out all fields correctly.");
      setMessageType("error");
      return;
    }

    const parsedArgs = args ? args.split(",").map((arg) => arg.trim()) : [];

    if (editIndexMethod === null) {
      const updatedNode = {
        ...selectedNode,
        methods: [...selectedNode.methods, { ...tempMethod, args: parsedArgs }],
      };
      onUpdateClass(updatedNode);
      setMessage("Method added successfully!");
      setMessageType("success");
    } else {
      const updatedMethods = selectedNode.methods.map((method, i) =>
        i === editIndexMethod ? { ...tempMethod, args: parsedArgs } : method
      );
      const updatedNode = { ...selectedNode, methods: updatedMethods };
      onUpdateClass(updatedNode);
      setMessage("Method updated successfully!");
      setMessageType("success");
    }

    setTempMethod({ visibility: "", name: "", returnType: "", args: "" });
    setEditIndexMethod(null);
  };

  const handleRemoveAttribute = (index) => {
    if (!selectedNode) return; // Ensure selectedNode is available
    const updatedAttributes = selectedNode.attributes.filter((_, i) => i !== index);
    const updatedNode = { ...selectedNode, attributes: updatedAttributes };
    onUpdateClass(updatedNode);
    setMessage("Attribute removed successfully!");
    setMessageType("success");
  };

  const handleRemoveMethod = (index) => {
    if (!selectedNode) return; // Ensure selectedNode is available
    const updatedMethods = selectedNode.methods.filter((_, i) => i !== index);
    const updatedNode = { ...selectedNode, methods: updatedMethods };
    onUpdateClass(updatedNode);
    setMessage("Method removed successfully!");
    setMessageType("success");
  };

  const handleEditAttribute = (index) => {
    if (!selectedNode) return; // Ensure selectedNode is available
    const attribute = selectedNode.attributes[index];
    setTempAttribute({ ...attribute });
    setEditIndexAttribute(index);
  };

  const handleEditMethod = (index) => {
    if (!selectedNode) return; // Ensure selectedNode is available
    const method = selectedNode.methods[index];
    setTempMethod({
      ...method,
      args: method.args ? method.args.join(", ") : "",
    });
    setEditIndexMethod(index);
  };

  if (!selectedNode) {
    return (
      <div className="p-6 bg-gray-50 rounded-md shadow-md max-w-4xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-gray-700">No class selected</h2>
        <p className="text-gray-600">Please select a class from the diagram to edit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-md shadow-md max-w-4xl mx-auto">
      {/* Feedback Message */}
      {message && (
        <div
          className={`p-4 rounded-md ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message}
        </div>
      )}

      {/* Class Name */}
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-gray-700">Class Name:</h2>
        <input
          type="text"
          className="border p-3 rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={className}
          onChange={handleClassNameChange}
        />
      </div>

      {/* Attributes Section */}
      <div>
        <h3 className="font-semibold text-xl mb-2 text-gray-700">Attributes</h3>
        <ul className="list-none p-0 space-y-2">
          {selectedNode.attributes.map((attr, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-white border p-2 rounded-md shadow-sm hover:bg-gray-50"
            >
              <span className="text-gray-800">{`${attr.visibility} ${attr.name}: ${attr.type}`}</span>
              <div>
                <button
                  onClick={() => handleRemoveAttribute(index)}
                  className="text-red-500 px-3 py-1 mr-2 rounded-md hover:bg-red-100"
                >
                  Remove
                </button>
                <button
                  onClick={() => handleEditAttribute(index)}
                  className="text-yellow-500 px-3 py-1 rounded-md hover:bg-yellow-100"
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Add or Update Attribute Form */}
        <div className="mt-4 flex items-center space-x-4">
          <select
            className="border p-3 rounded-md w-1/4 shadow-sm"
            value={tempAttribute.visibility}
            onChange={(e) => setTempAttribute({ ...tempAttribute, visibility: e.target.value })}
          >
            <option value="">Visibility</option>
            {visibilityOptions.map((visibility, index) => (
              <option key={index} value={visibility}>
                {visibility}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Attribute Name"
            className="border p-3 rounded-md w-1/4 shadow-sm"
            value={tempAttribute.name}
            onChange={(e) => setTempAttribute({ ...tempAttribute, name: e.target.value })}
          />
          <select
            className="border p-3 rounded-md w-1/4 shadow-sm"
            value={tempAttribute.type}
            onChange={(e) => setTempAttribute({ ...tempAttribute, type: e.target.value })}
          >
            <option value="">Type</option>
            {typeOptions.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddOrUpdateAttribute}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
          >
            {editIndexAttribute === null ? "Add Attribute" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Methods Section */}
      <div>
        <h3 className="font-semibold text-xl mb-2 text-gray-700">Methods</h3>
        <ul className="list-none p-0 space-y-2">
          {selectedNode.methods.map((method, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-white border p-2 rounded-md shadow-sm hover:bg-gray-50"
            >
              <span className="text-gray-800">{`${method.visibility} ${method.name}(${method.args ? method.args.join(", ") : ""}): ${method.returnType}`}</span>
              <div>
                <button
                  onClick={() => handleRemoveMethod(index)}
                  className="text-red-500 px-3 py-1 mr-2 rounded-md hover:bg-red-100"
                >
                  Remove
                </button>
                <button
                  onClick={() => handleEditMethod(index)}
                  className="text-yellow-500 px-3 py-1 rounded-md hover:bg-yellow-100"
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Add or Update Method Form */}
        <div className="mt-4 flex items-center space-x-4">
          <select
            className="border p-3 rounded-md w-1/4 shadow-sm"
            value={tempMethod.visibility}
            onChange={(e) => setTempMethod({ ...tempMethod, visibility: e.target.value })}
          >
            <option value="">Visibility</option>
            {visibilityOptions.map((visibility, index) => (
              <option key={index} value={visibility}>
                {visibility}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Method Name"
            className="border p-3 rounded-md w-1/4 shadow-sm"
            value={tempMethod.name}
            onChange={(e) => setTempMethod({ ...tempMethod, name: e.target.value })}
          />
          <select
            className="border p-3 rounded-md w-1/4 shadow-sm"
            value={tempMethod.returnType}
            onChange={(e) => setTempMethod({ ...tempMethod, returnType: e.target.value })}
          >
            <option value="">Return Type</option>
            {returnTypeOptions.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input type="text"
            placeholder="Arguments (comma separated)"
            className="border p-3 rounded-md w-1/4 shadow-sm"
            value={tempMethod.args}
            onChange={(e) => setTempMethod({ ...tempMethod, args: e.target.value })}
          />
          <button
            onClick={handleAddOrUpdateMethod}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
          >
            {editIndexMethod === null ? "Add Method" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassEditor;
