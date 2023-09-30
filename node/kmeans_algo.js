const MAX_ITERATIONS = 100;
let convergence = false;
let clustersArray;
let clustersArray_copy;
function kmeans(dataset,k){
	/*
	In this case we should not work with rgb,both the mean and the distance calculation they just won't work well.
	with rgb 'near' colors can be much different that 'far' color,RGB is not "perceptually uniform".
	we will convert the pixels we have from RGB to CIELAB color space once before starting the work
	and at the end we will return to rgb
	*/
	let labDataset = filterAndConvertPixels(dataset);
	let firstsCentroids = GetFirstCentroids(labDataset,k);
	let iterationNumber = 0;
	convergence = false;
	clustersArray = initializeClusters(labDataset,firstsCentroids,k);
	while (!convergence && iterationNumber < MAX_ITERATIONS) {
		findNearestCentroid(labDataset,k);
		clustersMean(k);
		iterationNumber+=1;
	}
	return ReturnCloseColor(k);

}
function filterAndConvertPixels(dataset){
	/*
	The goals of the function:

	1.To filter "noise" or colors that the user hardly sees,here we will perform a relatively simple move 
	and filter out colors that appear less than 5 times,you can change the number and you can adapt to the resolution of the image.

	2.convert the color from rgb to lab with the function rgbTolab()
	*/
	let minPixelsForolor = 5;
const pixelCounts = new Map();
const labDataset = [];

dataset.forEach((pixel) => {
  const pixelKey = JSON.stringify(pixel);
  if (pixelCounts.has(pixelKey)) {
    pixelCounts.set(pixelKey, pixelCounts.get(pixelKey) + 1);
  } else {
    pixelCounts.set(pixelKey, 1);
  }
});
dataset.forEach((pixel) => {
  const pixelKey = JSON.stringify(pixel);
  if (pixelCounts.get(pixelKey) >= minPixelsForolor) {
    labDataset.push(rgbTolab(pixel));
  }
});
return labDataset;
}
function ReturnCloseColor(k) {
	let colorsToReturn = [];
	for (var i = 0; i < k; i++) {
		let CloseColor = [];
		let shortestDistance = Infinity;
		let centroid = clustersArray_copy[i][0];
		clustersArray_copy[i][1].forEach((e) => {
		let distance = deltaE00(e[0], e[1], e[2], centroid[0], centroid[1], centroid[2]);
		if (distance < shortestDistance) {
				shortestDistance = distance;
				CloseColor = e;
			}
		});
		if (CloseColor === undefined || CloseColor.length == 0) {
			colorsToReturn.push(labToRgb(centroid));
		} else {
			colorsToReturn.push(labToRgb(CloseColor));
		}
	}
	return colorsToReturn;
}
function clustersMean(k){
let  oldCentroids = [];
let newCentroids = [];
    for (var i = 0; i < k; i++) {
    	oldCentroids.push(clustersArray[i][0]);
	let clusterCentroid = clustersArray[i][0];
	let lSum = 0;
	let aSum = 0;
	let bSum = 0;
	let clusterLength = clustersArray[i][1].length+1;
	clustersArray[i][1].forEach((e)=>{
		lSum+=e[0];
		aSum+=e[1];
		bSum+=e[2];
	});
	
	lSum+=clusterCentroid[0];
	aSum+=clusterCentroid[1];
	bSum+=clusterCentroid[2];
	if (clusterLength!=0){
		clustersArray[i][0]=[lSum/clusterLength,aSum/clusterLength,bSum/clusterLength];
		
	}
	newCentroids.push(clustersArray[i][0]);
    }
if(areArraysEqual(oldCentroids,newCentroids)){
	convergence = true;
}
}
function areArraysEqual(arr1, arr2) {
  // Check if the arrays have the same number of rows and columns
  if (arr1.length !== arr2.length || arr1[0].length !== arr2[0].length) {
    return false;
  }

  // Iterate through the arrays and compare corresponding elements
  for (let i = 0; i < arr1.length; i++) {
    for (let j = 0; j < arr1[i].length; j++) {
      if (arr1[i][j] !== arr2[i][j]) {
        return false; // If any element is not equal, return false
      }
    }
  }

  return true; // All elements are equal, return true
}
function isArrayInArray(source, search) {
    var searchLen = search.length;
    for (var i = 0, len = source.length; i < len; i++) {
        // skip not same length
        if (source[i].length != searchLen) continue;
        // compare each element
        for (var j = 0; j < searchLen; j++) {
            // if a pair doesn't match skip forwards
            if (source[i][j] !== search[j]) {
                break;
            }
            return true;
        }
    }
    return false;
}
/*
find the nearest centroid for a point,and assign the point to that cluster.
There is no need to check the points that are the oldcentroids themselves.
*/

function initializeClusters(dataset,firstsCentroidsIndex,k){
/*
In this function we initialize the matrix with the following elements:
1. '[]' ----> add row
2. 'firstsCentroidsIndex[i]' ----> add the centroid of the cluster
3. '[]' ----> empty array for the cluster colors

*/
let array = [];
for (let i = 0; i < k; i++) {
    array.push([]);
    array[i].push(firstsCentroidsIndex[i]); 
    array[i].push([]);
}
return array;
}
function findNearestCentroid(dataset,k){

let CentroidsArray = [];
for (let i = 0; i < k; i++) {
	CentroidsArray.push(clustersArray[i][0]);
	clustersArray[i][1] = [];
}
dataset.forEach((e)=>{
let distance=[];
let isECentroid = isArrayInArray(CentroidsArray,e);
for (let i = 0; i < k; i++) {
	if (!isECentroid){
		let result = deltaE00(e[0],e[1],e[2],CentroidsArray[i][0],CentroidsArray[i][1],CentroidsArray[i][2]);
		distance.push(result);
	}else{
		distance.push(Infinity);
	}
}
if (!isECentroid){
	let minimum = Math.min(...distance);
	let minIndex = distance.indexOf(minimum);
	clustersArray[minIndex][1].push(e);
}

});
clustersArray_copy = cloneArray(clustersArray);
}

//distance function
function deltaE00(l1, a1, b1, l2, a2, b2) {
		Math.rad2deg = function(rad) {
			return 360 * rad / (2 * Math.PI);
		};
		Math.deg2rad = function(deg) {
			return (2 * Math.PI * deg) / 360;
		};
		const avgL = (l1 + l2) / 2;
		const c1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2));
		const c2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));
		const avgC = (c1 + c2) / 2;
		const g = (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7)))) / 2;

		const a1p = a1 * (1 + g);
		const a2p = a2 * (1 + g);

		const c1p = Math.sqrt(Math.pow(a1p, 2) + Math.pow(b1, 2));
		const c2p = Math.sqrt(Math.pow(a2p, 2) + Math.pow(b2, 2));

		const avgCp = (c1p + c2p) / 2;

		let h1p = Math.rad2deg(Math.atan2(b1, a1p));
		if (h1p < 0) {
			h1p = h1p + 360;
		}

		let h2p = Math.rad2deg(Math.atan2(b2, a2p));
		if (h2p < 0) {
			h2p = h2p + 360;
		}

		const avghp = Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2;

		const t = 1 - 0.17 * Math.cos(Math.deg2rad(avghp - 30)) + 0.24 * Math.cos(Math.deg2rad(2 * avghp)) + 0.32 * Math.cos(Math.deg2rad(3 * avghp + 6)) - 0.2 * Math.cos(Math.deg2rad(4 * avghp - 63));

		let deltahp = h2p - h1p;
		if (Math.abs(deltahp) > 180) {
			if (h2p <= h1p) {
				deltahp += 360;
			} else {
				deltahp -= 360;
			}
		}

		const deltalp = l2 - l1;
		const deltacp = c2p - c1p;

		deltahp = 2 * Math.sqrt(c1p * c2p) * Math.sin(Math.deg2rad(deltahp) / 2);

		const sl = 1 + ((0.015 * Math.pow(avgL - 50, 2)) / Math.sqrt(20 + Math.pow(avgL - 50, 2)));
		const sc = 1 + 0.045 * avgCp;
		const sh = 1 + 0.015 * avgCp * t;

		const deltaro = 30 * Math.exp(-(Math.pow((avghp - 275) / 25, 2)));
		const rc = 2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
		const rt = -rc * Math.sin(2 * Math.deg2rad(deltaro));

		const kl = 1;
		const kc = 1;
		const kh = 1;

		const deltaE = Math.sqrt(Math.pow(deltalp / (kl * sl), 2) + Math.pow(deltacp / (kc * sc), 2) + Math.pow(deltahp / (kh * sh), 2) + rt * (deltacp / (kc * sc)) * (deltahp / (kh * sh)));

		return deltaE;
} 
	
	
function GetFirstCentroids(points, k) {
	/*
	Because we use Lab Color Space, it is possible to sort the array linearly.
	The goal is to get a good distribution of the first points, we don't want to start with points close to each other(in terms of color)
	*/
let array = cloneArray(points);
function comparePoints(a, b) {
  if (a[0] !== b[0]) {
    return a[0] - b[0];
  }
  if (a[1] !== b[1]) {
    return a[1] - b[1];
  }
  return a[2] - b[2];
}
array.sort(comparePoints);
return [array[0],array[Math.round(array.length/2)],array[array.length-1]]
}	
function getfirstsCentroids(arraySize, k) {
  if (k > arraySize) {
    throw new Error("k cannot be greater than the size of the array.");
  }
  const randomIndexes = [];

  while (randomIndexes.length < k) {
    const randomIndex = Math.floor(Math.random() * arraySize);
    if (!randomIndexes.includes(randomIndex)) {
      randomIndexes.push(randomIndex);
    }
  }
  return randomIndexes;
}
function rgbTolab(rgb){
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      x, y, z;

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}
function arraysEqual(a1,a2) {
    return JSON.stringify(a1)==JSON.stringify(a2);
}
function labToRgb(lab){
  var y = (lab[0] + 16) / 116,
      x = lab[1] / 500 + y,
      z = y - lab[2] / 200,
      r, g, b;

  x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
  y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
  z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);

  r = x *  3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y *  1.8758 + z *  0.0415;
  b = x *  0.0557 + y * -0.2040 + z *  1.0570;

  r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
  g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
  b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;

  return [Math.round(Math.max(0, Math.min(1, r)) * 255), 
          Math.round(Math.max(0, Math.min(1, g)) * 255), 
          Math.round(Math.max(0, Math.min(1, b)) * 255)]
}
function cloneArray(originalArray){
	return originalArray.map(function(arr) {return arr.slice();});}
module.exports = kmeans;
