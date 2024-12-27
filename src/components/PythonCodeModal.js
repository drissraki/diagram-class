import React from 'react';

const PythonCodeModal = ({ getDiagramInstance, setGeneratedCode, setIsModalOpen }) => {
  // Constants
  const VISIBILITY_MAP = {
    '+': '',     // public in Python (no prefix)
    '-': '__',   // private in Python (double underscore)
    '#': '_'     // protected in Python (single underscore)
  };

  const generateConstructor = (node, parentAttributes = [], isChild = false) => {
    let code = '    def __init__(self';
    const params = [];
    
    // Add parameters in order: parent attributes, current attributes
    if (isChild) {
      params.push(...parentAttributes.map(attr => attr.name));
    }
    if (node.attributes?.length) {
      params.push(...node.attributes.map(attr => attr.name));
    }
    
    code += params.length ? ', ' + params.join(', ') : '';
    code += '):\n';

    // Call parent constructor if this is a child class
    if (isChild && parentAttributes.length) {
      code += '        super().__init__(' + 
        parentAttributes.map(attr => attr.name).join(', ') + 
        ')\n';
    }

    // Initialize attributes
    node.attributes?.forEach(attr => {
      const prefix = VISIBILITY_MAP[attr.visibility] || '';
      code += `        self.${prefix}${attr.name} = ${attr.name}\n`;
    });

    if (!node.attributes?.length && !isChild) {
      code += '        pass\n';
    }

    return code + '\n';
  };

  const generateMethods = (node) => {
    let code = '';
    
    if (node.methods?.length) {
      node.methods.forEach(method => {
        const prefix = VISIBILITY_MAP[method.visibility] || '';
        const args = method.args.length ? ', ' + method.args.join(', ') : '';
        code += `    def ${prefix}${method.name}(self${args}):\n`;
        code += '        # TODO: Implement method\n';
        code += '        pass\n\n';
      });
    }
    
    return code;
  };

  const generateClassCode = (node, parentClass, parentAttributes) => {
    // Class declaration with inheritance
    let code = `class ${node.className}`;
    if (parentClass) {
      code += `(${parentClass})`;
    }
    code += ':\n';
    
    // Add docstring
    code += '    """' + node.className + ' class."""\n\n';
    
    // Constructor
    code += generateConstructor(node, parentAttributes, !!parentClass);
    
    // Methods
    code += generateMethods(node);
    
    return code + '\n';
  };

  const generatePythonCode = () => {
    const diagram = getDiagramInstance();
    if (!diagram) {
      console.error('Diagram instance not available');
      return;
    }

    try {
      let pythonCode = '# Generated Python Classes\n\n';

      // First pass: Collect inheritance relationships
      const inheritanceMap = new Map();
      const dependencyGraph = new Map();
      const nodes = diagram.model.nodeDataArray;
      
      nodes.forEach(node => {
        dependencyGraph.set(node.key, []);
      });

      diagram.model.linkDataArray.forEach(link => {
        const sourceNode = diagram.model.findNodeDataForKey(link.from);
        const targetNode = diagram.model.findNodeDataForKey(link.to);

        if (sourceNode && targetNode) {
          const isInheritance = 
            link.relationshipType === 'inheritance' || 
            link.category === 'inheritance' ||
            link.relationship === 'inheritance' ||
            link.type === 'inheritance';

          if (isInheritance) {
            inheritanceMap.set(sourceNode.key, targetNode.className);
            dependencyGraph.get(sourceNode.key).push(targetNode.key);
          }
        }
      });

      // Topological sort
      const visited = new Set();
      const sorted = [];
      
      function visit(nodeKey) {
        if (visited.has(nodeKey)) return;
        visited.add(nodeKey);
        
        const dependencies = dependencyGraph.get(nodeKey) || [];
        dependencies.forEach(depKey => visit(depKey));
        
        sorted.push(nodeKey);
      }

      nodes.forEach(node => visit(node.key));

      // Helper function to get parent class attributes
      const getParentClassAttributes = (parentClassName, diagram) => {
        const parentNode = diagram.model.nodeDataArray.find(node => node.className === parentClassName);
        return parentNode ? parentNode.attributes || [] : [];
      };

      // Generate code in correct order (parents before children)
      sorted.forEach(nodeKey => {
        const node = nodes.find(n => n.key === nodeKey);
        if (!node) return;

        const parentClass = inheritanceMap.get(node.key);
        let parentAttributes = [];
        
        if (parentClass) {
          parentAttributes = getParentClassAttributes(parentClass, diagram);
        }

        pythonCode += generateClassCode(node, parentClass, parentAttributes);
      });

      setGeneratedCode(pythonCode);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error generating Python code:', error);
    }
  };

  return (
    <button
      onClick={generatePythonCode}
      className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded"
    >
      Generate Python
    </button>
  );
};

export default PythonCodeModal; 