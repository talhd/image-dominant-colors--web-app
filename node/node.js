const express = require('express');
const multer = require('multer');
const kmeans = require("./kmeans_algo");
const app = express();
const port = 3000;
const Jimp = require('jimp');
const path = require('path');
const sharp = require('sharp');
const parentDirectory = path.join(__dirname, '../html/');
async function imageToDataset(imagePath) {
  const image = await Jimp.read(imagePath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const pixelArray = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelColor = Jimp.intToRGBA(image.getPixelColor(x, y));
      const rgb = [pixelColor.r, pixelColor.g, pixelColor.b];
      pixelArray.push(rgb);
    }
  }
  return pixelArray;
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({
    storage: storage
});



app.use(express.static(parentDirectory));
app.get('/', (req, res) => {
    const homePageDirectory = path.join(parentDirectory, 'index.html');
    res.sendFile(homePageDirectory);
});

app.post('/upload', upload.single('img'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('400-No file uploaded.');
    }
    const imagePath = 'uploads/' + req.file.filename;
    imageToDataset(imagePath).then(dataset => {
        const k = 3;
        const results = kmeans(dataset, k);
        const resultsJSON = JSON.stringify(results);
        res.send(resultsJSON);
    }).catch(error => {
        console.error(error);
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
