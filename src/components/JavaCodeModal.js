const JavaCodeModal = ({ getDiagramInstance, setGeneratedCode, setIsModalOpen }) => {
  const mapVisibility = (visibility) => {
    switch (visibility) {
      case '+': return 'public';
      case '-': return 'private';
      case '#': return 'protected';
      default: return 'private';
    }
  };

  const generateJavaCode = () => {
    const diagram = getDiagramInstance();
    if (!diagram) {
      console.error('Diagram instance not available');
      return;
    }
    try {
      let javaCode = '';
      let imports = '// Generated Java Classes\n\n';
      imports += 'import java.util.List;\n';
      imports += 'import java.util.ArrayList;\n';
      imports += 'import java.util.Objects;\n\n';

      // First pass: Collect all associations and inheritance relationships
      const classAssociations = new Map();
      const inheritanceMap = new Map();

      // Debug: Log all links to see their properties
      console.log('All Links:', diagram.model.linkDataArray);
     
      diagram.model.linkDataArray.forEach(link => {
        const sourceNode = diagram.model.findNodeDataForKey(link.from);
        const targetNode = diagram.model.findNodeDataForKey(link.to);
        
        // Debug: Log each link's properties
        console.log('Link:', {
          from: sourceNode?.className,
          to: targetNode?.className,
          type: link.relationshipType,
          category: link.category
        });

        if (sourceNode && targetNode) {
          // Check for inheritance using multiple possible properties
          const isInheritance = 
            link.relationshipType === 'inheritance' || 
            link.category === 'inheritance' ||
            link.relationship === 'inheritance' ||
            link.type === 'inheritance';

          if (isInheritance) {
            console.log('Found inheritance:', sourceNode.className, 'extends', targetNode.className);
            inheritanceMap.set(sourceNode.key, targetNode.className);
          } else {
            if (!classAssociations.has(link.from)) {
              classAssociations.set(link.from, []);
            }
            
            classAssociations.get(link.from).push({
              sourceClass: sourceNode.className,
              targetClass: targetNode.className,
              cardinality: link.toCardinality,
              type: link.relationshipType
            });
          }
        }
      });

      // Debug: Log inheritance relationships found
      console.log('Inheritance Map:', inheritanceMap);

      // Helper function to get parent class attributes
      const getParentClassAttributes = (parentClassName, diagram) => {
        const parentNode = diagram.model.nodeDataArray.find(node => node.className === parentClassName);
        return parentNode ? parentNode.attributes || [] : [];
      };

      // Generate code for each class
      diagram.model.nodeDataArray.forEach(node => {
        const associations = classAssociations.get(node.key) || [];
        const parentClass = inheritanceMap.get(node.key);
        let parentAttributes = [];
        
        if (parentClass) {
          parentAttributes = getParentClassAttributes(parentClass, diagram);
        }

        // Class declaration
        javaCode += `// ${node.className} class\n`;
        javaCode += `public class ${node.className}`;
        if (parentClass) {
          javaCode += ` extends ${parentClass}`;
        }
        javaCode += ' {\n\n';

        // Association fields
        if (associations.length > 0) {
          associations.forEach(assoc => {
            if (assoc.cardinality === '*' || assoc.cardinality === '0..*' || assoc.cardinality === '1..*') {
              javaCode += `    private final List<${assoc.targetClass}> ${assoc.targetClass.toLowerCase()}s;\n`;
            } else {
              javaCode += `    private final ${assoc.targetClass} ${assoc.targetClass.toLowerCase()};\n`;
            }
          });
          javaCode += '\n';
        }

        // Class attributes
        if (node.attributes && node.attributes.length > 0) {
          node.attributes.forEach(attr => {
            const visibility = mapVisibility(attr.visibility);
            javaCode += `    private ${attr.type} ${attr.name};\n`;
          });
          javaCode += '\n';
        }

        if (!parentClass) {
          // Base class: generate single constructor with all fields
          if (node.attributes?.length > 0 || associations.length > 0) {
            javaCode += `    // Constructor\n`;
            javaCode += `    public ${node.className}(`;
            
            const params = [];
            // Add attributes
            node.attributes?.forEach(attr => {
              params.push(`${attr.type} ${attr.name}`);
            });
            // Add associations
            associations.forEach(assoc => {
              if (assoc.cardinality === '*' || assoc.cardinality === '0..*' || assoc.cardinality === '1..*') {
                params.push(`List<${assoc.targetClass}> ${assoc.targetClass.toLowerCase()}s`);
              } else {
                params.push(`${assoc.targetClass} ${assoc.targetClass.toLowerCase()}`);
              }
            });
            
            javaCode += params.join(', ') + ') {\n';
            
            // Initialize fields
            node.attributes?.forEach(attr => {
              javaCode += `        this.${attr.name} = ${attr.name};\n`;
            });
            
            // Initialize associations
            associations.forEach(assoc => {
              if (assoc.cardinality === '*' || assoc.cardinality === '0..*' || assoc.cardinality === '1..*') {
                javaCode += `        this.${assoc.targetClass.toLowerCase()}s = new ArrayList<>(Objects.requireNonNull(${assoc.targetClass.toLowerCase()}s));\n`;
              } else {
                javaCode += `        this.${assoc.targetClass.toLowerCase()} = Objects.requireNonNull(${assoc.targetClass.toLowerCase()});\n`;
              }
            });
            javaCode += '    }\n\n';
          }
        } else {
          // Child class: generate constructor with parent and own fields
          javaCode += `    // Constructor\n`;
          javaCode += `    public ${node.className}(`;
          
          const params = [];
          // Add parent attributes first
          parentAttributes.forEach(attr => {
            params.push(`${attr.type} ${attr.name}`);
          });
          // Add child attributes
          node.attributes?.forEach(attr => {
            params.push(`${attr.type} ${attr.name}`);
          });
          // Add associations
          associations.forEach(assoc => {
            if (assoc.cardinality === '*' || assoc.cardinality === '0..*' || assoc.cardinality === '1..*') {
              params.push(`List<${assoc.targetClass}> ${assoc.targetClass.toLowerCase()}s`);
            } else {
              params.push(`${assoc.targetClass} ${assoc.targetClass.toLowerCase()}`);
            }
          });
          
          javaCode += params.join(', ') + ') {\n';
          
          // Call super with parent attributes
          const parentParams = parentAttributes.map(attr => attr.name);
          javaCode += `        super(${parentParams.join(', ')});\n`;
          
          // Initialize child attributes
          node.attributes?.forEach(attr => {
            javaCode += `        this.${attr.name} = ${attr.name};\n`;
          });
          
          // Initialize associations
          associations.forEach(assoc => {
            if (assoc.cardinality === '*' || assoc.cardinality === '0..*' || assoc.cardinality === '1..*') {
              javaCode += `        this.${assoc.targetClass.toLowerCase()}s = new ArrayList<>(Objects.requireNonNull(${assoc.targetClass.toLowerCase()}s));\n`;
            } else {
              javaCode += `        this.${assoc.targetClass.toLowerCase()} = Objects.requireNonNull(${assoc.targetClass.toLowerCase()});\n`;
            }
          });
          javaCode += '    }\n\n';
        }

        // Getters and Setters
        if (associations.length > 0) {
          javaCode += '    // Association getters and setters\n';
          associations.forEach(assoc => {
            if (assoc.cardinality === '*' || assoc.cardinality === '0..*' || assoc.cardinality === '1..*') {
              // List getter
              javaCode += `    public List<${assoc.targetClass}> get${assoc.targetClass}s() {\n`;
              javaCode += `        return new ArrayList<>(${assoc.targetClass.toLowerCase()}s);\n`;
              javaCode += '    }\n\n';
              
              // Add and remove methods
              javaCode += `    public void add${assoc.targetClass}(${assoc.targetClass} ${assoc.targetClass.toLowerCase()}) {\n`;
              javaCode += `        this.${assoc.targetClass.toLowerCase()}s.add(Objects.requireNonNull(${assoc.targetClass.toLowerCase()}));\n`;
              javaCode += '    }\n\n';
              
              javaCode += `    public void remove${assoc.targetClass}(${assoc.targetClass} ${assoc.targetClass.toLowerCase()}) {\n`;
              javaCode += `        this.${assoc.targetClass.toLowerCase()}s.remove(${assoc.targetClass.toLowerCase()});\n`;
              javaCode += '    }\n\n';
            } else {
              // Single object getter and setter
              javaCode += `    public ${assoc.targetClass} get${assoc.targetClass}() {\n`;
              javaCode += `        return ${assoc.targetClass.toLowerCase()};\n`;
              javaCode += '    }\n\n';
            }
          });
        }

        // Attribute getters and setters
        if (node.attributes && node.attributes.length > 0) {
          javaCode += '    // Attribute getters and setters\n';
          node.attributes.forEach(attr => {
            const capitalizedName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1);
            
            // Getter
            javaCode += `    public ${attr.type} get${capitalizedName}() {\n`;
            javaCode += `        return this.${attr.name};\n`;
            javaCode += '    }\n\n';
            
            // Setter
            javaCode += `    public void set${capitalizedName}(${attr.type} ${attr.name}) {\n`;
            javaCode += `        this.${attr.name} = ${attr.name};\n`;
            javaCode += '    }\n\n';
          });
        }

        javaCode += '}\n\n';
      });

      setGeneratedCode(imports + javaCode);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error generating Java code:', error);
    }
  };

  return (
    <button
      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
      onClick={generateJavaCode}
    >
      Generate Java Code
    </button>
  );
};

export default JavaCodeModal;