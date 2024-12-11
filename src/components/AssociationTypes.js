import React from "react";

const AssociationTypes = ({ onSelectAssociationType }) => {
  const associationTypes = [
    "Aggregation",
    "Composition",
    "Generalization",
    "Dependency",
  ];

  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold mb-2">Association Types</h3>
      <div className="flex space-x-2">
        {associationTypes.map((type) => (
          <button
            key={type}
            onClick={() => onSelectAssociationType(type)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
export default AssociationTypes;
