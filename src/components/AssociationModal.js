import React, { useState } from 'react';

const AssociationModal = ({ isOpen, onClose, nodeDataArray, onSave }) => {
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [fromCardinality, setFromCardinality] = useState('');
  const [toCardinality, setToCardinality] = useState('');
  const [associationType, setAssociationType] = useState('Association');

  const associationTypes = ['Association', 'Inheritance', 'Aggregation', 'Composition', 'Reflexive'];
  const cardinalityOptions = ['1', '0..1', '1..*', '*'];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fromClass && toClass && fromCardinality && toCardinality && associationType) {
      if (fromClass === toClass) {
        alert('The From Class and To Class must be different.');
        return;
      }
      onSave(fromClass, toClass, fromCardinality, toCardinality, associationType);
      setFromClass('');
      setToClass('');
      setFromCardinality('');
      setToCardinality('');
      setAssociationType('Association');
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Create Association</h2>
        <form onSubmit={handleSubmit}>
          {/* From Class */}
          <div className="mb-4">
            <label className="block text-gray-700">From Class:</label>
            <select
              value={fromClass}
              onChange={(e) => setFromClass(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="">Select a class</option>
              {nodeDataArray.map((classItem) => (
                <option key={classItem.key} value={classItem.key}>
                  {classItem.className}
                </option>
              ))}
            </select>
          </div>

          {/* To Class */}
          <div className="mb-4">
            <label className="block text-gray-700">To Class:</label>
            <select
              value={toClass}
              onChange={(e) => setToClass(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="">Select a class</option>
              {nodeDataArray.map((classItem) => (
                <option key={classItem.key} value={classItem.key}>
                  {classItem.className}
                </option>
              ))}
            </select>
          </div>

          {/* From Cardinality */}
          <div className="mb-4">
            <label className="block text-gray-700">Cardinality for From Class:</label>
            <select
              value={fromCardinality}
              onChange={(e) => setFromCardinality(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="">Select cardinality</option>
              {cardinalityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* To Cardinality */}
          <div className="mb-4">
            <label className="block text-gray-700">Cardinality for To Class:</label>
            <select
              value={toCardinality}
              onChange={(e) => setToCardinality(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="">Select cardinality</option>
              {cardinalityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Association Type */}
          <div className="mb-4">
            <label className="block text-gray-700">Type of Association:</label>
            <select
              value={associationType}
              onChange={(e) => setAssociationType(e.target.value)}
              className="border rounded p-2 w-full"
            >
              {associationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
            >
              Save Association
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssociationModal;
