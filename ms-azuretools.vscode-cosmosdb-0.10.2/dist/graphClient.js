"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const animationStepMs = 50;
const defaultQuery = "g.V()";
const linkDistance = 400;
const linkStrength = 0.01; // Reduce rigidity of the links (if < 1, the full linkDistance is relaxed)
const charge = -3000;
const arrowDistanceFromVertex = 10;
const vertexRadius = 8; // from css
const paddingBetweenVertexAndEdge = 3;
const AutoColor = "auto";
let htmlElements;
window.onerror = (message) => {
    logToUI("ERROR: " + message);
};
function getErrorMessage(error) {
    return error.message || error.toString();
}
function logToUI(s) {
    console.log(s);
    // let v = htmlElements.debugLog.value;
    // v += "\r\n" + s;
    // htmlElements.debugLog.value = v;
}
class SocketWrapper {
    constructor(_socket) {
        this._socket = _socket;
    }
    onServerMessage(message, fn) {
        //use webview's onDidGetMessage
        return this._socket.on(message, (...args) => {
            try {
                fn(...args);
            }
            catch (err) {
                this.emitToHost('log', getErrorMessage(err));
                logToUI(err);
            }
        });
    }
    emitToHost(message, ...args) {
        logToUI("Message to host: " + message + " " + args.join(", "));
        return this._socket.emit(message, ...args);
    }
}
class GraphClient {
    constructor(port) {
        this._currentQueryId = 0;
        htmlElements = {
            debugLog: this.selectById("debugLog"),
            jsonSection: this.selectById("jsonSection"),
            graphSection: this.selectById("graphSection"),
            jsonResults: this.selectById("jsonResults"),
            queryError: this.selectById("queryError"),
            queryInput: this.selectById("queryInput"),
            stats: this.selectById("stats"),
            title: this.selectById("title"),
            graphRadio: this.selectById("graphRadio"),
            jsonRadio: this.selectById("jsonRadio"),
            resultsBackground: this.selectById("resultsBackground")
        };
        this._graphView = new GraphView();
        htmlElements.queryInput.value = defaultQuery;
        this.setStateInitial();
        this.log(`Listening on port ${port}`);
        // tslint:disable-next-line:no-http-string
        this._socket = new SocketWrapper(io.connect(`http://localhost:${port}`));
        // setInterval(() => {
        //   this.log(`Client heartbeat on port ${port}: ${Date()}`);
        // }, 10000);
        this._socket.onServerMessage('connect', () => {
            this.log(`Client connected on port ${port}`);
            this._socket.emitToHost('getTitle');
        });
        this._socket.onServerMessage('disconnect', () => {
            this.log("disconnect");
        });
        this._socket.onServerMessage("setPageState", (pageState, viewSettings) => {
            htmlElements.queryInput.value = pageState.query;
            if (pageState.isQueryRunning) {
                this._currentQueryId = pageState.runningQueryId;
                this.setStateQuerying();
                return;
            }
            if (!pageState.errorMessage) {
                this.showResults(pageState.results, viewSettings);
            }
            else {
                this.setStateError(pageState.errorMessage);
            }
            if (pageState.view === 'json') {
                this.selectJsonView();
            }
            else {
                this.selectGraphView();
            }
        });
        this._socket.onServerMessage("setTitle", (title) => {
            this.log(`Received title: ${title}`);
            d3.select(htmlElements.title).text(title);
        });
        this._socket.onServerMessage("showResults", (queryId, results, viewSettings) => {
            this.log(`Received results for query ${queryId}`);
            if (queryId !== this._currentQueryId) {
                this.log("  Ignoring results, out of date");
            }
            else {
                this.showResults(results, viewSettings);
            }
        });
        this._socket.onServerMessage("showQueryError", (queryId, error) => {
            this.log(`Received error for query ${queryId} - ${error}`);
            if (queryId !== this._currentQueryId) {
                this.log("  Ignoring error, out of date");
            }
            else {
                this.setStateError(error);
            }
        });
    }
    selectById(id) {
        let elem = d3.select(`#${id}`)[0][0];
        console.assert(!!elem, `Could not find element with ID ${id}`);
        return elem;
    }
    getPageState() {
        this._socket.emitToHost('getPageState');
    }
    copyParentStyleSheets() {
        // Copy style sheets from parent to pick up theme colors
        const head = document.getElementsByTagName("head")[0];
        const styleSheets = parent.document.getElementsByTagName("style");
        // The styleSheets object doesn't have a method returning an iterator
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < styleSheets.length; ++i) {
            head.insertBefore(styleSheets[i].cloneNode(true), head.firstChild);
        }
    }
    query(gremlin) {
        this._currentQueryId += 1;
        this._socket.emitToHost("query", this._currentQueryId, gremlin);
        this.setStateQuerying();
    }
    selectGraphView() {
        this._isGraphView = true;
        this.setView();
    }
    selectJsonView() {
        this._isGraphView = false;
        this.setView();
    }
    setQuery(query) {
        this._socket.emitToHost('setQuery', query);
    }
    // Tells the host which view is selected (Json/Graph/etc)
    setView() {
        htmlElements.graphRadio.checked = this._isGraphView;
        htmlElements.jsonRadio.checked = !this._isGraphView;
        d3.select(htmlElements.graphSection).classed("active", !!this._isGraphView);
        d3.select(htmlElements.jsonSection).classed("active", !this._isGraphView);
        this._socket.emitToHost('setView', this._isGraphView ? 'graph' : 'json');
    }
    log(s) {
        if (this._socket) {
            this._socket.emitToHost('log', s);
        }
        logToUI(s);
    }
    setStateInitial() {
        this._setState("initial");
    }
    setStateQuerying() {
        this._setState("querying");
        this._graphView.clear();
    }
    setStateError(error) {
        htmlElements.queryError.value = getErrorMessage(error);
        this._setState("error");
        this._graphView.clear();
    }
    _setState(state) {
        let fullState;
        switch (state) {
            case "graph-results":
                fullState = 'state-results state-graph-results';
                break;
            case "json-results":
                fullState = 'state-results state-json-results state-non-graph-results';
                break;
            case "empty-results":
                fullState = 'state-results state-json-results state-empty-results';
                break;
            default:
                fullState = `state-${state}`;
                break;
        }
        // Sets the state name into a CSS class onto the "#states" element. This is then used by CSS to
        //   control visibility of HTML elements.
        d3.select("#states").attr("class", fullState);
    }
    showResults(results, viewSettings) {
        // queryResults may contain any type of data, not just vertices or edges
        // Always show the full original results JSON
        htmlElements.jsonResults.value = JSON.stringify(results.fullResults, null, 2);
        if (Array.isArray(results.fullResults) && !results.fullResults.length) {
            this._setState("empty-results");
        }
        else if (!results.limitedVertices.length) {
            // No vertices to show, just show query JSON
            this._setState("json-results");
        }
        else {
            this._setState("graph-results");
            this._graphView.display(results.countUniqueVertices, results.limitedVertices, results.countUniqueEdges, results.limitedEdges, viewSettings);
        }
    }
}
exports.GraphClient = GraphClient;
class GraphView {
    constructor() {
        this._defaultColorsPerLabel = new Map();
        this._colorGenerator = d3.scale.category20();
    }
    display(countUniqueVertices, vertices, countUniqueEdges, edges, viewSettings) {
        this.clear();
        this.generateDefaultColors(vertices);
        // Set up nodes and links for the force simulation
        let nodes = vertices
            .map(v => ({ vertex: v }));
        // Create map of nodes by ID
        let nodesById = new Map();
        nodes.forEach(n => nodesById.set(n.vertex.id, n));
        // Create edges and set their source/target
        let links = [];
        edges.forEach(e => {
            let source = nodesById.get(e.outV);
            let target = nodesById.get(e.inV);
            if (source && target) {
                links.push({ edge: e, source, target });
            }
            else {
                console.error("Vertex not found");
            }
        });
        nodesById = null;
        let statsText = (nodes.length === countUniqueVertices && links.length === countUniqueEdges) ?
            `Displaying all ${nodes.length} vertices and ${links.length} edges` :
            `Displaying ${nodes.length} of ${countUniqueVertices} vertices and ${links.length} of ${countUniqueEdges} edges`;
        d3.select(htmlElements.stats).text(statsText);
        // Set up force simulation
        if (this._force) {
            this._force.stop();
        }
        this._force = d3.layout.force()
            .size([htmlElements.resultsBackground.clientWidth, htmlElements.resultsBackground.clientHeight])
            .nodes(nodes)
            .links(links);
        let force = this._force;
        force.gravity(1); // Makes the nodes gravitate toward the center
        force.friction(.5);
        force.linkDistance(linkDistance); // edge length
        force.linkStrength(linkStrength);
        force.charge(charge);
        let svg = d3.select(htmlElements.graphSection).select("svg");
        // Add a re-usable arrow
        svg.select('defs')
            .selectAll('marker')
            .data(['end'])
            .enter()
            .append('marker')
            .attr('id', 'triangle')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', arrowDistanceFromVertex) // Shift arrow so that we can see it.
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .attr('markerUnits', 'userSpaceOnUse') // No auto-scaling with stroke width
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5');
        // Allow user to drag/zoom the entire SVG
        svg = svg
            // tslint:disable-next-line:no-function-expression // Grandfathered in
            .call(d3.behavior.zoom().on("zoom", function () {
            svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
        }))
            .append("g");
        // Links before nodes so that links don't get drawn on top of node labels, obscuring them
        let edge = svg.selectAll(".edge")
            .data(links)
            .enter()
            .append("path")
            .attr('class', 'edge')
            .attr('fill', 'none')
            .attr('marker-end', 'url(#triangle)');
        // Allow user to drag nodes. Set "dragging" class while dragging.
        let vertexDrag = force.drag().on("dragstart", function () {
            d3.select(this).classed("dragging", true);
            // Make sure a drag gesture doesn't also start a zoom action
            d3.event.sourceEvent.stopPropagation();
        })
            .on("dragend", function () { d3.select(this).classed("dragging", false); });
        // Labels
        let label = svg.selectAll(".label")
            .data(nodes)
            .enter().append("text")
            .attr("class", "label")
            .attr("x", "10px")
            .attr("y", "2px")
            .attr('font-size', 13)
            .text((d) => this.getVertexDisplayText(d.vertex, viewSettings));
        // Nodes last so that they're always and top to be able to be dragged
        let vertex = svg.selectAll(".vertex")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "vertex")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .style("fill", (d) => this.getVertexColor(d.vertex, viewSettings))
            .call(vertexDrag);
        // On each tick of the simulation, update the positions of each vertex and edge
        force.on("tick", () => {
            vertex
                .transition().ease("linear").duration(animationStepMs)
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y);
            edge
                .transition().ease("linear").duration(animationStepMs)
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);
            edge.attr("d", (d) => { return this.positionLink(d); });
            label
                .transition().ease("linear").duration(animationStepMs)
                .attr("class", "label")
                .attr("dx", (d) => d.x)
                .attr("dy", (d) => d.y);
        });
        force.start();
    }
    clear() {
        d3.select(htmlElements.graphSection).select("svg").selectAll(".vertex, .edge, .label").remove();
    }
    generateDefaultColors(vertices) {
        // Keep previous entries, changing colors between queries would be confusing
        for (let vertex of vertices) {
            let label = vertex.label;
            if (!this._defaultColorsPerLabel.get(label)) {
                let colorIndex = this._defaultColorsPerLabel.size;
                let newColor = this._colorGenerator(colorIndex);
                this._defaultColorsPerLabel.set(label, newColor);
            }
        }
    }
    static calculateClosestPIOver2(angle) {
        const CURVATURE_FACTOR = 40;
        const result = (Math.atan(CURVATURE_FACTOR * (angle - (Math.PI / 4))) / 2) + (Math.PI / 4);
        return result;
    }
    static calculateControlPoint(start, end) {
        const alpha = Math.atan2(end.y - start.y, end.x - start.x);
        const n = Math.floor(alpha / (Math.PI / 2));
        const reducedAlpha = alpha - (n * Math.PI / 2);
        const reducedBeta = GraphView.calculateClosestPIOver2(reducedAlpha);
        const beta = reducedBeta + (n * Math.PI / 2);
        const length = Math.sqrt((end.y - start.y) * (end.y - start.y) + (end.x - start.x) * (end.x - start.x)) / 2;
        const result = {
            x: start.x + Math.cos(beta) * length,
            y: start.y + Math.sin(beta) * length
        };
        return result;
    }
    positionLink(l) {
        const d1 = GraphView.calculateControlPoint(l.source, l.target);
        let radius = vertexRadius + paddingBetweenVertexAndEdge;
        // Start
        let dx = d1.x - l.source.x;
        let dy = d1.y - l.source.y;
        let angle = Math.atan2(dy, dx);
        let tx = l.source.x + (Math.cos(angle) * radius);
        let ty = l.source.y + (Math.sin(angle) * radius);
        // End
        dx = l.target.x - d1.x;
        dy = l.target.y - d1.y;
        angle = Math.atan2(dy, dx);
        let ux = l.target.x - (Math.cos(angle) * radius);
        let uy = l.target.y - (Math.sin(angle) * radius);
        return "M" + tx + "," + ty
            + "S" + d1.x + "," + d1.y
            + " " + ux + "," + uy;
    }
    findVertexPropertySetting(v, viewSettings, settingProperty) {
        let label = v.label;
        for (let graphSettingsGroup of viewSettings) {
            let vertextSettingsGroups = graphSettingsGroup.vertexSettings || [];
            // Check groups which specify a label filter first
            for (let group of vertextSettingsGroups) {
                if (group.appliesToLabel && group.appliesToLabel === label) {
                    // This settings group is applicable to this vertex
                    let value = group[settingProperty];
                    if (value !== undefined && value !== null) {
                        return value;
                    }
                }
            }
            // Check for a default group with no appliesToLabel
            let defaultGroup = vertextSettingsGroups.find(group => !group.appliesToLabel);
            if (defaultGroup) {
                let value = defaultGroup[settingProperty];
                if (value !== undefined && value !== null) {
                    return value;
                }
            }
        }
    }
    getVertexColor(v, viewSettings) {
        let color = this.findVertexPropertySetting(v, viewSettings, "color");
        if (color && color !== AutoColor) {
            return color;
        }
        // Default is to use "auto" behavior and choose color based on label
        return this._defaultColorsPerLabel.get(v.label);
    }
    getVertexDisplayText(v, viewSettings) {
        let text;
        let propertyCandidates = this.findVertexPropertySetting(v, viewSettings, "displayProperty") || [];
        // Find the first specified property that exists and has a non-empty value
        for (let candidate of propertyCandidates) {
            if (candidate === "id") {
                text = v.id;
            }
            else if (candidate === "label" && v.label) {
                text = v.label;
            }
            else {
                if (v.properties && candidate in v.properties) {
                    let property = v.properties[candidate][0];
                    if (property && property.value) {
                        text = property.value;
                        break;
                    }
                }
            }
        }
        // Otherwise use "id"
        text = text || v.id;
        let showLabel = this.findVertexPropertySetting(v, viewSettings, "showLabel");
        showLabel = showLabel === undefined ? true : showLabel; // Default to true if not specified
        if (showLabel && v.label) {
            text += ` (${v.label})`;
        }
        return text;
    }
}
//# sourceMappingURL=graphClient.js.map