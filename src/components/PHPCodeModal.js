import React from 'react';

const PHPCodeModal = ({ getDiagramInstance, setGeneratedCode, setIsModalOpen }) => {
  // Constants
  const VISIBILITY_MAP = {
    '+': 'public',
    '-': 'private',
    '#': 'protected'
  };

  const generateConstructor = (node, parentAttributes = [], isChild = false) => {
    let code = '    public function __construct(';
    const params = [];
    
    // Add parameters in order: parent attributes, current attributes
    if (isChild) {
      params.push(...parentAttributes.map(attr => `${attr.type} $${attr.name}`));
    }
    params.push(...(node.attributes?.map(attr => `${attr.type} $${attr.name}`) || []));
    
    code += params.join(', ') + ') {\n';

    // Parent constructor call for child classes
    if (isChild && parentAttributes.length) {
      code += `        parent::__construct(${parentAttributes.map(attr => `$${attr.name}`).join(', ')});\n`;
    }

    // Initialize attributes
    node.attributes?.forEach(attr => {
      code += `        $this->${attr.name} = $${attr.name};\n`;
    });

    return code + '    }\n\n';
  };

  const generateGettersSetters = (node) => {
    let code = '';

    // Attribute getters and setters
    if (node.attributes?.length) {
      code += '    // Getters and setters\n';
      node.attributes.forEach(attr => {
        const capitalizedName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1);
        
        // Getter
        code += `    public function get${capitalizedName}(): ${attr.type} {\n`;
        code += `        return $this->${attr.name};\n`;
        code += '    }\n\n';
        
        // Setter
        code += `    public function set${capitalizedName}(${attr.type} $${attr.name}): self {\n`;
        code += `        $this->${attr.name} = $${attr.name};\n`;
        code += '        return $this;\n';
        code += '    }\n\n';
      });
    }

    return code;
  };

  const generateClassCode = (node, parentClass, parentAttributes) => {
    let code = `// ${node.className} class\n`;
    code += `class ${node.className}${parentClass ? ` extends ${parentClass}` : ''} {\n\n`;

    // Properties
    if (node.attributes?.length) {
      node.attributes.forEach(attr => {
        code += `    ${VISIBILITY_MAP[attr.visibility] || 'private'} ${attr.type} $${attr.name};\n`;
      });
      code += '\n';
    }

    // Constructor
    code += generateConstructor(node, parentAttributes, !!parentClass);

    // Getters and Setters
    code += generateGettersSetters(node);

    // Methods
    if (node.methods?.length) {
      node.methods.forEach(method => {
        const visibility = VISIBILITY_MAP[method.visibility] || 'public';
        const args = method.args.map(arg => `$${arg}`).join(', ');
        code += `    ${visibility} function ${method.name}(${args})${method.returnType ? ': ' + method.returnType : ''} {\n`;
        code += '        // TODO: Implement method\n';
        code += '    }\n\n';
      });
    }

    code += "}\n\n";
    return code;
  };

  const generatePHPCode = () => {
    const diagram = getDiagramInstance();
    if (!diagram) {
      console.error('Diagram instance not available');
      return;
    }

    try {
      let phpCode = '<?php\n\n';
      phpCode += "namespace App;\n\n";

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

        phpCode += generateClassCode(node, parentClass, parentAttributes);
      });

      setGeneratedCode(phpCode);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error generating PHP code:', error);
    }
  };

  return (
    <button
      onClick={generatePHPCode}
      className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
    >
      Generate PHP
    </button>
  );
};

export default PHPCodeModal; 