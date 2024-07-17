// Graph
// er 
// binary tree
// ring
// random
// ba

document.addEventListener('DOMContentLoaded', function () {

    // DONE: Function to generate a random Erdos-Renyi graph
    function erdos_renyi_graph(numNodes, probability) {
        let elements = [];
        // Create nodes
        for (let n = 0; n < numNodes; n++) {
            elements.push({ data: { id: 'n' + n } });
        }
        // Create edges based on Erdos-Renyi model
        for (let i = 0; i < numNodes; i++) {
            for (let j = i + 1; j < numNodes; j++) {
                if (Math.random() < probability) {
		    elements.push({ data: { id: 'n' + i + '-n' + j, source: 'n' + i, target: 'n' + j } });
                }
            }
        }
        return elements;
    }
 
    // DONE: Function to generate a binary tree graph
    function BTree_graph(numNodes) {
	let elements = [];
	// Function to add nodes and edges recursively
	function addNodeAndEdges(v, parent) {
            if (v > numNodes) {
		return;
            }
            elements.push({ data: { id: 'n' + v } });
            if (parent !== null) {
		elements.push({ data: { id: 'n' + parent + '-n' + v, source: 'n' + parent, target: 'n' + v } });
            }
            addNodeAndEdges(2 * v + 1, v); // Left child
            addNodeAndEdges(2 * v + 2, v); // Right child
	}
	// Start adding nodes and edges from root (node 0)
	addNodeAndEdges(0, null);	
	return elements;
    }

    // DONE: Function to generate a ring graph
    function ring_graph(numNodes) {
        let elements = [];
        for (let n = 0; n < numNodes; n++) {
            elements.push({ data: { id: 'n' + n } });
        }
        // Add edges to create the ring structure
        for (let i = 0; i < numNodes; i++) {
	    if ( i == (numNodes - 1) ){
		j =  0;
	    }else{
		j =  i + 1;
	    }
	    elements.push({ data: { id: 'n' + i + '-n' + j, source: 'n' + i, target: 'n' + j } });
        }
        return elements;
    }


    // DONE: Function to generate a random connected graph
    function randomconnected_graph(numNodes, numEdges) {
        let elements = [];
        for (let n = 0; n < numNodes; n++) {
            elements.push({ data: { id: 'n' + n } });
        }
        // Create edges to ensure connectivity
        for (let i = 1; i < numNodes; i++) {
            let u = 'n' + i;
            let v = 'n' + Math.floor(Math.random() * i); 
            // Randomly choose direction of edge
            if (Math.random() <= 0.5) {
                elements.push({ data: { id: u + '-' + v, source: u, target: v } });
            } else {
                elements.push({ data: { id: v + '-' + u, source: v, target: u } });
            }
        }
        // Add remaining edges randomly
        let addedEdges = new Set(); // To avoid duplicate edges
        while (elements.length - numNodes < numEdges) {
            let u = 'n' + Math.floor(Math.random() * numNodes);
            let v = 'n' + Math.floor(Math.random() * numNodes);
            if (u !== v && !addedEdges.has(u + '-' + v) && !addedEdges.has(v + '-' + u)) {
                // Randomly choose direction of edge
                if (Math.random() <= 0.5) {
                    elements.push({ data: { id: u + '-' + v, source: u, target: v } });
                } else {
                    elements.push({ data: { id: v + '-' + u, source: v, target: u } });
                }
                addedEdges.add(u + '-' + v);
            }
        }
        return elements;
    }

    // TODO: Function to generate a Barabasi graph
    function createBarabasiGraph(numNodes, m0, m) {
        let elements = [];

        // Create initial complete graph with m0 vertices
        let initialNodes = [];
        for (let i = 1; i <= m0; i++) {
            initialNodes.push({ id: 'n' + i });
            elements.push({ data: { id: 'n' + i } });
        }
        for (let i = 0; i < initialNodes.length; i++) {
            for (let j = i + 1; j < initialNodes.length; j++) {
                elements.push({ data: { id: initialNodes[i].id + '-' + initialNodes[j].id, source: initialNodes[i].id, target: initialNodes[j].id } });
            }
        }
        // Array to store degrees of nodes
        let degrees = new Array(m0).fill(0);
        // Function to add a new node with m edges using preferential attachment
        function addNodeWithEdges(u) {
            elements.push({ data: { id: 'n' + u } });
            // Select m nodes to connect to based on preferential attachment
            for (let i = 0; i < m; i++) {
                let probabilities = degrees.map(d => d / (2 * elements.length - 1));
                let sum = 0;
                let rand = Math.random();
                for (let j = 0; j < elements.length; j++) {
                    sum += probabilities[j];
                    if (sum > rand) {
                        elements.push({ data: { id: 'n' + u + '-n' + (j + 1), source: 'n' + u, target: 'n' + (j + 1) } });
                        degrees[j]++;
                        degrees[u - 1]++;
                        break;
                    }
                }
            }
        }
        // Start adding nodes from m0 + 1 to numNodes
        for (let u = m0 + 1; u <= numNodes; u++) {
            addNodeWithEdges(u);
        }
        return elements;
    }



    var cy = cytoscape({
        container: document.getElementById('cy'),
	// elements: erdos_renyi_graph(20,0.4),
	// elements: BTree_graph(10),
	// elements: ring_graph(50),
	elements: randomconnected_graph(20, 30),
	//elemnets:  createBarabasiGraph(20,2,2),
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#CCCCCC',
                    'label': '' // Empty 
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#39FF14',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle'
                }
            }
        ],
        layout: {
            name: 'cose'
        }
    });

    // Counter element for displaying steps
    var stepCounter = document.getElementById('step-counter');
    stepCounter.textContent = 'Steps: 0';


    // Set to keep track of visited nodes
    let visitedNodes = new Set();
    
    function randomWalk(startNode, steps, totalNodes) {
        let currentNode = startNode;
        let step = 1;

        function highlightNode(node) {
	    cy.$('#' + node).style('label', step);
    
	    // Change color of visited nodes
            if (visitedNodes.has(node)) {
		// Do nothing
            } else {
                cy.$('#' + node).style('background-color', '#ff6e27'); // Different color for new visits
                visitedNodes.add(node); 
            }
	    
        }

        function unhighlightNode(node) {
	    cy.$('#' + node).style('label', '')
        }

        function walk() {
	    if (visitedNodes.size === totalNodes) {
                return; // Stop the walk if all nodes have been visited
            }
	    
            if (step < steps) {

		// console.log(cy.$('#' + currentNode).connectedEdges());
                let connectedEdges = cy.$('#' + currentNode).connectedEdges();
                let randomEdge = connectedEdges[Math.floor(Math.random() * connectedEdges.length)];
                let source = randomEdge.source().id();
                let target = randomEdge.target().id();
                let nextNode = (source === currentNode) ? target : source;

                unhighlightNode(currentNode);
                highlightNode(nextNode);
		
		currentNode = nextNode;
                step++;
			
                // Update step counter
                stepCounter.textContent = 'Steps: ' + step;
                document.getElementById('step-counter').textContent = stepCounter.textContent;

                setTimeout(walk, 1000); // 1 second delay between steps
            }
        }

        highlightNode(currentNode);
        walk();
    }

    randomWalk('n0', 500, 20); // Start the random walk from node 'n0' with 10 steps
});


