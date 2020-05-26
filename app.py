from flask import Flask, render_template, request, jsonify
from utility import lab2Functions


app = Flask(__name__)

RAN_SAM = 0
ADA_SAM = 1
PCA = 0
MDS_EU = 1
MDS_CO = 2
SCREE_PLOT = 3


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/displayVisualization")
def displayCharts():
    sampling = int(request.args.get('sampling', '0', type = str))
    visualization = int(request.args.get('visualization', '0', type = str))

    if sampling == -1 and visualization == -1:
        return jsonify(data = resultData['kMeansElbow'])


    sampleType = "noSampling"
    if sampling == RAN_SAM: sampleType = "randomSampling"
    elif sampling == ADA_SAM: sampleType = "adaptiveSampling"

    retData = []
    attributes = {}
    if visualization == PCA:
        retData = resultData[sampleType]['PCA']
    elif visualization == MDS_EU:
        retData = resultData[sampleType]['MDS1']
    elif visualization == MDS_CO:
        retData = resultData[sampleType]['MDS2']
    elif visualization == SCREE_PLOT:
        retData = resultData[sampleType]['ScreePlot']
    else:
        retData = resultData[sampleType]['ScatterPlot']
        attributes = resultData[sampleType]['ScatterPlotAttr']

    return jsonify(data = retData, names = attributes)


if __name__ == "__main__":
    global resultData
    obj = lab2Functions()
    resultData = obj.setData()
    app.run(debug = True)
