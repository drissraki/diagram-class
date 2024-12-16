import React, { useState } from "react";

const AssociationModal = ({ isOpen, onClose, nodeDataArray, onSave }) => {
  const [fromClass, setFromClass] = useState("");
  const [toClass, setToClass] = useState("");
  const [fromCardinality, setFromCardinality] = useState("");
  const [toCardinality, setToCardinality] = useState("");
  const [associationType, setAssociationType] = useState("");

  const cardinalityOptions = ["1..*", "0..1", "1..1", "0..*", "*"];
  
  const associationTypes = [
    { value: "Association", label: "Association simple" },
    { value: "Aggregation", label: "Agrégation" },
    { value: "Composition", label: "Composition" },
    { value: "Generalization", label: "Généralisation" }
  ];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fromClass && toClass && associationType) {
      // Check if it's a many-to-many relationship
      const isManyToMany = fromCardinality === '*' && toCardinality === '*';
      
      if (isManyToMany && associationType === "Association") {
        // Create the junction class
        const fromClassName = nodeDataArray.find(node => node.key === parseInt(fromClass))?.className;
        const toClassName = nodeDataArray.find(node => node.key === parseInt(toClass))?.className;
        const junctionClassName = `${fromClassName}${toClassName}`;
        
        // Create junction class node
        const junctionClass = {
          key: Date.now(),
          className: junctionClassName,
          attributes: [],
          methods: []
        };

        // Create two one-to-many associations
        const firstLink = {
          from: parseInt(fromClass),
          to: junctionClass.key,
          fromCardinality: '1',
          toCardinality: '*',
          type: "Association",
          toArrow: "Triangle",
          stroke: "black"
        };

        const secondLink = {
          from: junctionClass.key,
          to: parseInt(toClass),
          fromCardinality: '*',
          toCardinality: '1',
          type: "Association",
          toArrow: "Triangle",
          stroke: "black"
        };

        // Save all the new elements
        onSave(firstLink, secondLink, junctionClass);
      } else {
        // Regular association handling
        const linkData = {
          from: parseInt(fromClass),
          to: parseInt(toClass),
          fromCardinality: fromCardinality || '',
          toCardinality: toCardinality || '',
          relationshipType: associationType
        };

        // Add specific properties based on association type
        switch (associationType) {
          case "Aggregation":
            linkData.type = "Aggregation";
            linkData.fromArrow = "Diamond";
            linkData.fill = "white";
            linkData.stroke = "black";
            break;
          case "Composition":
            linkData.type = "Composition";
            linkData.fromArrow = "Diamond";
            linkData.fill = "black";
            linkData.stroke = "black";
            break;
          case "Generalization":
            linkData.type = "Generalization";
            linkData.toArrow = "Triangle";
            linkData.stroke = "black";
            linkData.relationshipType = "inheritance";
            break;
          default: // Association
            linkData.type = "Association";
            linkData.toArrow = "Triangle";
            linkData.stroke = "black";
            break;
        }

        onSave(linkData);
      }

      // Reset form fields
      setFromClass("");
      setToClass("");
      setFromCardinality("");
      setToCardinality("");
      setAssociationType("");
    } else {
      alert("Veuillez sélectionner les classes et le type d'association.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Créer une Association</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type d'association */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Type d'association
            </label>
            <select
              value={associationType}
              onChange={(e) => setAssociationType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un type</option>
              {associationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Classes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Classe source
              </label>
              <select
                value={fromClass}
                onChange={(e) => setFromClass(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une classe</option>
                {nodeDataArray.map((classItem) => (
                  <option key={classItem.key} value={classItem.key}>
                    {classItem.className}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Classe cible
              </label>
              <select
                value={toClass}
                onChange={(e) => setToClass(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une classe</option>
                {nodeDataArray.map((classItem) => (
                  <option key={classItem.key} value={classItem.key}>
                    {classItem.className}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cardinalités */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cardinalité source
              </label>
              <select
                value={fromCardinality}
                onChange={(e) => setFromCardinality(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une cardinalité</option>
                {cardinalityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cardinalité cible
              </label>
              <select
                value={toCardinality}
                onChange={(e) => setToCardinality(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une cardinalité</option>
                {cardinalityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Créer l'association
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssociationModal;