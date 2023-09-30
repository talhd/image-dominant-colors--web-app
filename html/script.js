const uploadBox = document.getElementById("upload_box");
const box = document.getElementById("box");
const fileInput = document.getElementById("fileInput");
const svg = document.getElementById("box_svg");
const text = document.getElementById("text_in_box");
const remove_btn = document.getElementById("remove_btn");
const results_rgb_hex = document.getElementsByClassName('result_rgb_hex');
const results_color_box = document.getElementsByClassName('result_color_box');
const results_box = document.getElementById('result_box');
const spinner = document.getElementById("loading");
let controller;
let signal;
box.addEventListener("click", function(ev) {
    fileInput.click(ev);
});
fileInput.addEventListener("change", function(ev) {
	ev.preventDefault();
	uploadImageToServer(fileInput.files[0]);
});
box.addEventListener('dragover', function(ev) {
  	ev.preventDefault();
});
box.addEventListener('drop', function(ev) {
	ev.preventDefault();
	uploadImageToServer(ev.dataTransfer.files[0]);
});

remove_btn.addEventListener("click", function() {
    removeOldImg();
    hideElement(results_box);
    hideElement(spinner);
    showElement(svg);
    showElement(text);
    uploadBox.style.height = "330px"
    box.style.width = "400px";
    controller.abort();
});

function displayImages(img) {
    if (img) {
        hideElement(svg);
        hideElement(text);
        removeOldImg();
        var elem = document.createElement("img");
        elem.setAttribute("src", URL.createObjectURL(img));
        elem.setAttribute("id", "img_box");
        box.appendChild(elem);
        box.style.width = "fit-content";
    }
}

function removeOldImg() {
    let old_img = document.getElementById("img_box");
    if (old_img) {
        box.removeChild(old_img);
    }
}

function hideElement(element) {
  if (element.style.display !== "none") {
    element.style.display = "none";
  }
}

function showElement(element) {
  if (element.style.display !== "block") {
    element.style.display = "block";
  }
}
function rgbToHex(rgbArray) {
  if (rgbArray.length !== 3) {
    return "Invalid input, RGB array must have exactly 3 values.";
  }
  for (let i = 0; i < 3; i++) {
    if (rgbArray[i] < 0 || rgbArray[i] > 255) {
      return "Invalid RGB value. Each value must be between 0 and 255.";
    }
  }

  const hex = rgbArray.map(value => {
    const hexValue = value.toString(16).toUpperCase();
    return hexValue.length === 1 ? "0" + hexValue : hexValue;
  });

  return "#" + hex.join("");
}

function uploadImageToServer(img) {
	displayImages(img);

	const formData = new FormData();
	formData.append('img', img);
	hideElement(results_box);
	uploadBox.style.height = "420px";
	if (img) {
		showElement(spinner);
	}
	controller = new AbortController();
	signal = controller.signal;
	const fetchPromise = fetch('/upload', {
			method: 'POST',
			body: formData,
			signal,
		})
		.then(response => response.json())
		.then(data => {
			data.forEach((array, i) => {
				const hex = rgbToHex(array);
				results_color_box[i].style.backgroundColor = hex;
				results_rgb_hex[i].innerHTML = `rgb(${array.join(', ')})<br>hex ${hex}`;
			});
			hideElement(spinner);
			showElement(results_box);

		})
		.catch(error => {
			console.error('Error:', error);
		});
}
