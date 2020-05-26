import pandas as pd
import numpy as np

from sklearn.preprocessing import normalize
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics.pairwise import pairwise_distances
from sklearn.manifold import MDS


class lab2Functions(object):
    def __init__(self, sampleSize = 125, maxCluster = 10, maxComponent=10, numClusters=3):
        self.sampleSize = sampleSize
        self.maxClusters = maxCluster
        self.maxComponent = maxComponent
        self.numClusters = numClusters


    def readCSV(self):
        dataframe = pd.read_csv("Top_500_FIFA_18 copy.csv")
        dataframe.fillna(0, inplace=True)
        return dataframe


    def cleanData(self, data):
        modifiedData = data.drop(['short_name'], axis = 1)

        modifiedData.loc[modifiedData['work_rate'] == 'Low', 'work_rate'] = 0
        modifiedData.loc[modifiedData['work_rate'] == 'Medium', 'work_rate'] = 1
        modifiedData.loc[modifiedData['work_rate'] == 'High', 'work_rate'] = 2

        modifiedData['value_eur']  = modifiedData['value_eur'].div(1000000, axis = 0)
        modifiedData['wage_eur']  = modifiedData['wage_eur'].div(10000, axis = 0)

        modifiedData = pd.get_dummies(modifiedData, columns=['team_position'], prefix=["Position_Type"])
        modifiedData = pd.get_dummies(modifiedData, columns=['league'], prefix=["Leagu_Type"])
        modifiedData = pd.get_dummies(modifiedData, columns=['nationality'], prefix=["Nationality_Type"])
        modifiedData = pd.get_dummies(modifiedData, columns=['club'], prefix=["Club_Type"])

        return modifiedData


    def noSampling(self, data):
        return data, [0] * data.shape[0]


    def randomSampling(self, data):
        np.random.seed(5)
        return data.sample(n = self.sampleSize), [0] * self.sampleSize


    def kMeansElbow(self, data):
        normalizedData = normalize(data, norm = 'l2')

        elbowData = []
        for i in range(1, self.maxClusters):
            kmeans = KMeans(n_clusters = i)
            kmeans.fit(normalizedData)
            rowdata = {}
            rowdata['y'] = kmeans.inertia_
            rowdata['x'] = i
            elbowData.append(rowdata)

        return elbowData


    def adaptiveSampling(self, data):
        normalizedData = normalize(data, norm='l2')
        estimator = KMeans(n_clusters = self.numClusters)
        estimator.fit(normalizedData)

        indexes = []
        clusterLabels = []
        for i in range(self.numClusters):
            cluster = np.argwhere(estimator.labels_ == i)
            sampleClusterSize = round(cluster.size / data.shape[0] * self.sampleSize)
            np.random.shuffle(cluster)
            indexes = np.append(indexes, cluster[0 : sampleClusterSize])
            clusterLabels = clusterLabels + [i for x in range(sampleClusterSize)]

        return data.iloc[indexes], clusterLabels


    def scree(self, sampleData):
        normalizedData = normalize(sampleData, norm = 'l2')
        pca = PCA(n_components = self.maxComponent)
        pca.fit(sampleData)

        screedata = []
        cum = 0
        for ind, val in enumerate(pca.explained_variance_ratio_):
            rowdata = {}
            rowdata['x'] = ind + 1
            rowdata['y'] = val * 100
            cum += val * 100
            rowdata['yCum'] = cum
            screedata.append(rowdata)

        return screedata


    def PCA(self, data, sampleData, labels):
        pca = PCA()
        pca.fit(sampleData)
        transformedData = pca.transform(sampleData)

        pcaData = []
        for i, row in enumerate(transformedData):
            rowdata = {}
            rowdata['xvalue'] = row[0]
            rowdata['yvalue'] = row[1]
            rowdata['cluster'] = labels[i]
            pcaData.append(rowdata)

        return pcaData


    def MDS(self, data, sampleData, labels, type):
        if (type == 'EUCLID'): distances =  pairwise_distances(X = sampleData, metric = "euclidean")
        else: distances =  pairwise_distances(X = sampleData, metric = "correlation")

        mds = MDS(dissimilarity = 'precomputed')
        transformedData = mds.fit_transform(distances)
        mdsdata = []
        for i, row in enumerate(transformedData):
            rowdata = {}
            rowdata['xvalue'] = row[0]
            rowdata['yvalue'] = row[1]
            rowdata['cluster'] = labels[i]
            mdsdata.append(rowdata)

        return mdsdata


    def scatterPlotMatrix(self, data, sampleData, labels):
        pca = PCA()
        pca.fit(sampleData)
        loadings = np.sum(np.square(pca.components_), axis = 0)
        top3AttributesIndex = loadings.argsort()[-3:][::-1]
        top3AttributesNames = sampleData.columns[top3AttributesIndex]

        return np.array(sampleData[top3AttributesNames]).tolist(), \
        { 'names': np.array(top3AttributesNames).tolist(), 'labels': labels, 'tips': np.array(data.iloc[:, 0]).tolist() }


    def setData(self):
        data = self.readCSV()
        modifiedData = self.cleanData(data)
        resultData = {}

        # K means Elbow
        resultData['kMeansElbow'] = self.kMeansElbow(modifiedData)

        # No sampling
        sampleData, clusterLabels = self.noSampling(modifiedData)
        resultData['noSampling'] = {}
        resultData['noSampling']['PCA'] = self.PCA(data, sampleData, clusterLabels)
        resultData['noSampling']['MDS1'] = self.MDS(data, sampleData, clusterLabels, 'EUCLID')
        resultData['noSampling']['MDS2'] = self.MDS(data, sampleData, clusterLabels, 'CORRELATION')
        resultData['noSampling']['ScreePlot'] = self.scree(sampleData)
        resultData['noSampling']['ScatterPlot'], resultData['noSampling']['ScatterPlotAttr'] = \
        self.scatterPlotMatrix(data, sampleData, clusterLabels)

        # Random Sampling
        sampleData, clusterLabels = self.randomSampling(modifiedData)
        resultData['randomSampling'] = {}
        resultData['randomSampling']['PCA'] = self.PCA(data, sampleData, clusterLabels)
        resultData['randomSampling']['MDS1'] = self.MDS(data, sampleData, clusterLabels, 'EUCLID')
        resultData['randomSampling']['MDS2'] = self.MDS(data, sampleData, clusterLabels, 'CORRELATION')
        resultData['randomSampling']['ScreePlot'] = self.scree(sampleData)
        resultData['randomSampling']['ScatterPlot'], resultData['randomSampling']['ScatterPlotAttr'] = \
        self.scatterPlotMatrix(data, sampleData, clusterLabels)

        # Stratefied Sampling
        sampleData, clusterLabels = self.adaptiveSampling(modifiedData)
        resultData['adaptiveSampling'] = {}
        resultData['adaptiveSampling']['PCA'] = self.PCA(data, sampleData, clusterLabels)
        resultData['adaptiveSampling']['MDS1'] = self.MDS(data, sampleData, clusterLabels, 'EUCLID')
        resultData['adaptiveSampling']['MDS2'] = self.MDS(data, sampleData, clusterLabels, 'CORRELATION')
        resultData['adaptiveSampling']['ScreePlot'] = self.scree(sampleData)
        resultData['adaptiveSampling']['ScatterPlot'], resultData['adaptiveSampling']['ScatterPlotAttr'] = \
        self.scatterPlotMatrix(data, sampleData, clusterLabels)

        return resultData
