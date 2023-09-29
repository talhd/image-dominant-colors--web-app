import cv2
import numpy as np
import matplotlib.pyplot as plt
from collections import Counter

# Load the image
img = cv2.imread('1.png')
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# Flatten the image to a 2D array of pixels
pixels = img.reshape(-1, 3)

# Count the occurrences of each color
color_counts = Counter(map(tuple, pixels))

# Print the three most popular colors with color squares
most_common_colors = color_counts.most_common(3)

# Create a subplot with three color squares and text
plt.figure(figsize=(10, 4))
for i, (color, count) in enumerate(most_common_colors):
    # Create a small square image with the color
    color_square = np.zeros((20, 20, 3), dtype=np.uint8)
    color_square[:, :] = color

    # Add a subplot for each color
    plt.subplot(1, 3, i + 1)
    plt.imshow(color_square)
    plt.axis('off')  # Turn off axis labels and ticks
    plt.title(f"Color: RGB {color}, Count: {count}")

# Show the complete plot with color squares and text
plt.tight_layout()
plt.show()

