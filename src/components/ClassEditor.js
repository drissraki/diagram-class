import React, { useState, useEffect } from "react";

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
    args: "", // Initialize args as a string, later will be split into an array
  });

  const [editIndexAttribute, setEditIndexAttribute] = useState(null);
  const [editIndexMethod, setEditIndexMethod] = useState(null);

  const visibilityOptions = ["+", "-", "#"];
  const typeOptions = ["int", "string", "boolean", "float", "double", "char", "object"];
  const returnTypeOptions = ["void", "int", "string", "boolean", "float", "double", "char"];

  // Helper function to check for duplicates


  const checkMethodExists = (name) => {
    return selectedNode.methods.some((method) => method.name === name);
  };

  // Add or Update Attribute
  const handleAddOrUpdateAttribute = () => {
    const { visibility, name, type } = tempAttribute;
  
    if (!visibility || !name || !type) {
      alert("Please fill out all fields correctly.");
      return;
    }
  
    // Validation to ensure uniqueness of attribute name
    const nameExists = selectedNode.attributes.some((attr, index) => {
      return attr.name === name && index !== editIndexAttribute;
    });
  
    if (nameExists) {
      alert("An attribute with this name already exists. Please use a different name.");
      return;
    }
  
    if (editIndexAttribute === null) {
      // Add new attribute
      const updatedNode = {
        ...selectedNode,
        attributes: [...selectedNode.attributes, tempAttribute],
      };
      onUpdateClass(updatedNode);
    } else {
      // Update existing attribute
      const updatedAttributes = selectedNode.attributes.map((attr, i) =>
        i === editIndexAttribute ? tempAttribute : attr
      );
      const updatedNode = { ...selectedNode, attributes: updatedAttributes };
      onUpdateClass(updatedNode);
    }
  
    setTempAttribute({ visibility: "", name: "", type: "" }); // Reset input
    setEditIndexAttribute(null); // Reset the edit index
  };
  

  // Add or Update Method
  const handleAddOrUpdateMethod = () => {
    const { visibility, name, returnType, args } = tempMethod;
    if (!visibility || !name || !returnType) {
      alert("Please fill out all fields correctly.");
      return;
    }

    // Split args into an array, even if it's an empty string
    const parsedArgs = args ? args.split(",").map((arg) => arg.trim()) : [];

    if (editIndexMethod === null) {
      if (checkMethodExists(name)) {
        alert("This method already exists. Please update it instead.");
        return;
      }
      const updatedNode = {
        ...selectedNode,
        methods: [
          ...selectedNode.methods,
          { ...tempMethod, args: parsedArgs },
        ],
      };
      onUpdateClass(updatedNode);
    } else {
      const updatedMethods = selectedNode.methods.map((method, i) =>
        i === editIndexMethod ? { ...tempMethod, args: parsedArgs } : method
      );
      const updatedNode = { ...selectedNode, methods: updatedMethods };
      onUpdateClass(updatedNode); // Update the class with the modified method
    }

    setTempMethod({ visibility: "", name: "", returnType: "", args: "" }); // Reset input
    setEditIndexMethod(null); // Reset the edit index
  };

  // Handle Remove Attribute
  const handleRemoveAttribute = (index) => {
    const updatedAttributes = selectedNode.attributes.filter((_, i) => i !== index);
    const updatedNode = { ...selectedNode, attributes: updatedAttributes };
    onUpdateClass(updatedNode); // Update the class by removing the attribute
  };

  // Handle Remove Method
  const handleRemoveMethod = (index) => {
    const updatedMethods = selectedNode.methods.filter((_, i) => i !== index);
    const updatedNode = { ...selectedNode, methods: updatedMethods };
    onUpdateClass(updatedNode); // Update the class by removing the method
  };

  // Fill the input fields with the selected attribute for editing
  const handleEditAttribute = (index) => {
    const attribute = selectedNode.attributes[index];
    setTempAttribute({ ...attribute }); // Set current attribute in the temp form
    setEditIndexAttribute(index); // Set the edit index for attributes
  };

  // Fill the input fields with the selected method for editing
  const handleEditMethod = (index) => {
    const method = selectedNode.methods[index];
    setTempMethod({
      ...method,
      args: method.args ? method.args.join(", ") : "", // Ensure args is always an array before joining
    });
    setEditIndexMethod(index); // Set the edit index for methods
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-md shadow-md">
      <h2 className="text-2xl font-bold text-center">{selectedNode.className}</h2>

      {/* Attributes Section */}
      <div>
        <h3 className="font-semibold text-xl mb-2">Attributes</h3>
        <ul className="list-none p-0 space-y-2">
          {selectedNode.attributes.map((attr, index) => (
            <li key={index} className="flex justify-between items-center bg-white border p-2 rounded-md shadow-sm">
              <span>{`${attr.visibility} ${attr.name}: ${attr.type}`}</span>
              <div>
                <button
                  onClick={() => handleRemoveAttribute(index)}
                  className="text-red-500 px-3 py-1 mr-2 rounded hover:bg-red-100"
                >
                  Remove
                </button>
                <button
                  onClick={() => handleEditAttribute(index)}
                  className="text-yellow-500 px-3 py-1 rounded hover:bg-yellow-100"
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
            className="border p-2 rounded-md w-1/4"
            value={tempAttribute.visibility}
            onChange={(e) => setTempAttribute({ ...tempAttribute, visibility: e.target.value })}
          >
            <option value="">Visibility</option>
            {visibilityOptions.map((visibility, index) => (
              <option key={index} value={visibility}>{visibility}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Attribute Name"
            className="border p-2 rounded-md w-1/4"
            value={tempAttribute.name}
            onChange={(e) => setTempAttribute({ ...tempAttribute, name: e.target.value })}
          />
          <select
            className="border p-2 rounded-md w-1/4"
            value={tempAttribute.type}
            onChange={(e) => setTempAttribute({ ...tempAttribute, type: e.target.value })}
          >
            <option value="">Type</option>
            {typeOptions.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
          <button
            onClick={handleAddOrUpdateAttribute}
            className="bg-blue-500 text-white px-6 py-2 rounded-md"
          >
            {editIndexAttribute === null ? "Add Attribute" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Methods Section */}
      <div>
        <h3 className="font-semibold text-xl mb-2">Methods</h3>
        <ul className="list-none p-0 space-y-2">
          {selectedNode.methods.map((method, index) => (
            <li key={index} className="flex justify-between items-center bg-white border p-2 rounded-md shadow-sm">
              <span>{`${method.visibility} ${method.name}(${method.args ? method.args.join(", ") : ""}): ${method.returnType}`}</span>
              <div>
                <button
                  onClick={() => handleRemoveMethod(index)}
                  className="text-red-500 px-3 py-1 mr-2 rounded hover:bg-red-100"
                >
                  Remove
                </button>
                <button
                  onClick={() => handleEditMethod(index)}
                  className="text-yellow-500 px-3 py-1 rounded hover:bg-yellow-100"
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
            className="border p-2 rounded-md w-1/4"
            value={tempMethod.visibility}
            onChange={(e) => setTempMethod({ ...tempMethod, visibility: e.target.value })}
          >
            <option value="">Visibility</option>
            {visibilityOptions.map((visibility, index) => (
              <option key={index} value={visibility}>{visibility}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Method Name"
            className="border p-2 rounded-md w-1/4"
            value={tempMethod.name}
            onChange={(e) => setTempMethod({ ...tempMethod, name: e.target.value })}
          />
          <select
            className="border p-2 rounded-md w-1/4"
            value={tempMethod.returnType}
            onChange={(e) => setTempMethod({ ...tempMethod, returnType: e.target.value })}
          >
            <option value="">Return Type</option>
            {returnTypeOptions.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Arguments (comma separated)"
            className="border p-2 rounded-md w-1/4"
            value={tempMethod.args}
            onChange={(e) => setTempMethod({ ...tempMethod, args: e.target.value })}
          />
          <button
            onClick={handleAddOrUpdateMethod}
            className="bg-blue-500 text-white px-6 py-2 rounded-md"
          >
            {editIndexMethod === null ? "Add Method" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassEditor;
