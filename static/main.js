var margin = { top: 30, right: 5, bottom: 30, left: 95 }

var SCRIPT_ROOT = window.location.href
generateElbow()

function generateElbow() {
    document.getElementById('hack').style['display'] = 'none'
    document.getElementById('kMeansElbow').style['background-color'] = 'black'
    document.getElementById('kMeansElbow').style['color'] = 'burlywood'
    document.getElementsByName('visualization').forEach((item) => { item.checked = false })
    document.getElementsByName('sampling').forEach((item) => { item.checked = false })

    $.getJSON(SCRIPT_ROOT + '/displayVisualization',
    { sampling: "-1", visualization: "-1" },
    (d) => { createElbowGraph(d.data) })
}

function generateViz() {
    document.getElementById('hack').style['display'] = 'none'
    document.getElementById('kMeansElbow').style['background-color'] = ''
    document.getElementById('kMeansElbow').style['color'] = ''

    var selViz = $('input[name="visualization"]:checked').val()
    var selSam = $('input[name="sampling"]:checked').val()
    if (selViz == null || selSam == null) {
        alert("Please select both Sampling Type and Visualization Type to display!")
        return
    }

    $.getJSON(SCRIPT_ROOT + '/displayVisualization',
    { sampling: selSam, visualization: selViz },
    (d) => {
        if (selViz == 3) createScreePlot(d.data)
        else if (selViz == 4) createScatterPlot (d.data, d.names)
        else createGraph(d.data)
    })
}

function createElbowGraph(data) {
    d3.select(".viz").html('')
    var width = 700, height = 300

    // setup graph
    var graph = d3.select('.viz')
    .append('svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom + 20)
    .style('margin-left', '5%')
    .style('margin-top', '5%')
    .style('padding', '5px 270px')

    var main = graph.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('width', width)
    .attr('height', height)

    // draw the x axis
    var x = d3.scale.linear()
    .domain([0, d3.max(data, (d) => { return d.x })])
    .range([ 0, width ])

    var xAxis = d3.svg.axis().scale(x)

    main.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'main axis date')
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -2)
    .style("text-anchor", "end")
    .text("Number of Clusters")
    .attr("dy", "3.00em")
    .attr("dx", "-20.00em")

    // draw the y axis
    var y = d3.scale.linear()
    .domain([d3.min(data, (d) => { return d.y }), d3.max(data, (d) => { return d.y}) + 5])
    .range([height, 0])

    var yAxis = d3.svg.axis().scale(y).orient('left')

    main.append('g')
    .attr('transform', 'translate(0,0)')
    .attr('class', 'main axis date')
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "-3.00em")
    .attr("dx", "-3.00em")
    .style("text-anchor", "end")
    .text("Sum of Squared Distance (SSD)")

    // draw legend
    var g = main.append("g")

    g.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("K Means Elbow: 3")
    .style("font-size", "20px")

    // Draw main graph
    var valueline = d3.svg.line()
    .x((d) => { return x(d.x) })
    .y((d) => { return y(d.y) })

    g.append("path")
    .attr("class", "line")
    .attr("d", valueline(data))

    g.selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => { return x(d.x) } )
    .attr("cy", (d) => { return y(d.y) } )
    .attr("r", 3)
}

function createScreePlot(data) {
    d3.select(".viz").html('')
    var width = 600, height = 300

    // setup graph
    var graph = d3.select('.viz')
    .append('svg')
    .attr('width', width + margin.right + margin.left + 20)
    .attr('height', height + margin.top + margin.bottom + 140)
    .style('margin-left', '5%')
    .style('margin-top', '5%')
    .style('padding', '5px 270px')

    var main = graph.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('width', width)
    .attr('height', height + 120)

    // draw the x axis
    var x = d3.scale.linear()
    .domain([0, d3.max(data, (d) => { return d.x }) ])
    .rangeRound([ 0, width ], 0.2)

    var xAxis = d3.svg.axis().scale(x)

    main.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'main axis date')
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -1)
    .style("text-anchor", "end")
    .text("Number of Components")
    .attr("dy", "3.00em")
    .attr("dx", "-15.00em")

    // draw the y axis
    var y = d3.scale.linear()
    .domain([0, 100])
    .range([height, 0])

    var yAxis = d3.svg.axis().scale(y).orient('left')

    main.append('g')
    .attr('transform', 'translate(0,0)')
    .attr('class', 'main axis date')
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "-4.00em")
    .attr("dx", "-7.00em")
    .style("text-anchor", "end")
    .text("Eigen Value (%)")

    title = 'Random Sampling'
    var sel = $('input[name="sampling"]:checked').val()
    if (sel == 1) title = 'Stratified Sampling'
    else if (sel == 2) title = 'No Sampling'

    // draw legend
    var g = main.append("g")
    
    g.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2) - 4 )
    .attr("text-anchor", "middle")
    .style("font-size", "18 px")
    .text("Scree Plot: " + title)

    // draw main graph
    var valueline = d3.svg.line()
    .x((d) => { return x(d.x) })
    .y((d) => { return y(d.yCum) })

    g.append("path")
    .attr("class", "line")
    .attr("d", valueline(data))
    .style('stroke-width', '1')

    g.selectAll('dot')
    .data(data)
    .enter()
    .append('text')
    .attr("x", (d) => { return x(d.x) - 12})
    .attr("y", (d) => { return y(d.yCum) - 2 })
    .text((d) => { return parseFloat(d.yCum).toFixed(1) })
    .style("font-size", "small")

    g.selectAll('dot')
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => { return x(d.x) } )
    .attr("cy", (d) => { return y(d.yCum) } )
    .attr("r", 2)

    var valueline2 = d3.svg.line()
    .x(x(data[1].x))
    .y((_, i) => { return i * 40 })

    g.append("path")
    .attr("class", "line")
    .attr("d", valueline2(data))
    .style('stroke', 'black')
    .style('stroke-width', '0.5')

    g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .style("fill", "steelblue")
    .attr("x", (d) => { return x(d.x) - 27 })
    .attr("y", (d) => { return y(d.y) })
    .attr("width", "55")
    .attr("height", (d) => { return height - y(d.y) })
}

function createGraph(data) {
    d3.select(".viz").html('')
    var width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom

    // setup graph
    var svg = d3.select(".viz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 20)
    .style('margin-left', '13%')
    .style('padding', '1px 70px')
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var color = d3.scale.category10()

    data.forEach((d) => {
        d.xvalue = +d.xvalue
        d.yvalue = +d.yvalue
    })

    // x-axis
    var xValue = (d) => { return d.xvalue },
    xScale = d3.scale.linear().range([0, width]),
    xMap = (d) => { return xScale(xValue(d)) },
    xAxis = d3.svg.axis().scale(xScale).orient("bottom")

    xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1])

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .attr("dy", "3.00em")
    .attr("dx", "-30.00em")
    .text("PC 1")

    // y-axis
    var yValue = (d) => { return d.yvalue },
    yScale = d3.scale.linear().range([height, 0]),
    yMap = (d) => { return yScale(yValue(d)) },
    yAxis = d3.svg.axis().scale(yScale).orient("left")

    yScale.domain([d3.min(data, yValue) - 1, d3.max(data, yValue) + 1])

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "-3.0em")
    .attr("dx", "-12.00em")
    .style("text-anchor", "end")
    .text("PC 2")

    var sel = $('input[name="visualization"]:checked').val()
    var graphtitle = 'PCA Plot'
    if (sel == 1) graphtitle = 'MDS-Euclidean Plot'
    else if (sel == 2) graphtitle = 'MDS-Correlation Plot'
    else if (sel == 4) graphtitle = 'Scatter Plot Matrix'

    // draw legend
    svg.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text(graphtitle)

    // main graph
    svg.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 3.5)
    .attr("cx", xMap)
    .attr("cy", yMap)
    .style("fill", (d) => { return color(d.cluster) })

    // draw legend
    var legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (_, i) => { return "translate(0," + i * 20 + ")" })

    legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", color)

    legend.append("text")
    .attr("x", width - 24)
    .attr("y", 5)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text((d) => { return "Cluster " + d + " -" })
}

function createScatterPlot(scatterPlotMatrixData, attributes) {
    document.getElementById('hack').style['display'] = 'inherit'

    var size = 160, padding = 40
    var cellDomain = {}, dataItemType = [0, 1, 2], n = dataItemType.length

    d3.select(".viz").html('')

    // setup graph
    var svg = d3.select(".viz").append("svg")
    .attr("width", size * n + padding + 100)
    .attr("height", size * n + padding + 40)
    .style("margin-left", '30%')
    .style('padding', '1px 70px')
    .append("g")
    .attr("transform", "translate(" + padding + "," + padding / 2 + ")")

    var color = d3.scale.category10()

    var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)

    dataItemType.forEach((item) => {
        cellDomain[item] = d3.extent(scatterPlotMatrixData, (d) => { return d[item] })
    })

    var grid = []
    for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) grid.push({ x: dataItemType[i], i: i, y: dataItemType[j], j: j })

    // x axis
    var x = d3.scale.linear().range([padding / 2, size - padding / 2])
    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5)
    xAxis.tickSize(size * n)

    svg.selectAll(".x.axis")
    .data(dataItemType)
    .enter().append("g")
    .attr("class", "x axis")
    .attr("transform", (_, i) => { return "translate(" + (n - i - 1) * size + ",0)" })
    .each(function (d, i) {
        x.domain(cellDomain[d])
        d3.select(this)
        .call(xAxis)
        .append("text")
        .attr("x", 75)
        .attr("y", size * n + padding - 10)
        .style("text-anchor", "middle")
        .style("font-size", "small")
        .text(attributes.names[i])
    })

    // y axis
    var y = d3.scale.linear().range([size - padding / 2, padding / 2])
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5)
    yAxis.tickSize(-size * n)

    svg.selectAll(".y.axis")
    .data(dataItemType)
    .enter().append("g")
    .attr("class", "y axis")
    .attr("transform", (_, i) => { return "translate(2," + i * size + ")" })
    .each(function (d, i) {
        y.domain(cellDomain[d])
        d3.select(this)
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -85)
        .attr("y", -30)
        .style("text-anchor", "middle")
        .style("font-size", "small")
        .text(attributes.names[i])
    })

    // main graph
    svg.selectAll(".cell")
    .data(grid)
    .enter()
    .append("g")
    .attr("class", "cell")
    .attr("transform", (d) => { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")" })
    .each(plotData)

    function plotData (p) {
        var cell = d3.select(this)

        x.domain(cellDomain[p.x])
        y.domain(cellDomain[p.y])

        cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding)
        .style("fill", "beige")

        cell.selectAll("circle")
        .data(scatterPlotMatrixData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", (d) => { return x(d[p.x]) })
        .attr("cy", (d) => { return y(d[p.y]) })
        .attr("r", 3)

        cell.selectAll("circle")
        .data(attributes.tips)
        .on("mouseover", (_, i) => {
            tooltip.transition().duration(200)
            .style("opacity", .9)
    
            tooltip.html(attributes.tips[i])
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500)
            .style("opacity", 0)
        })

        cell.selectAll("circle")
        .data(attributes.labels)
        .style("fill", (d) => { return color(d) })
    }
}