import numpy as np
import matplotlib.pyplot as plt
import cv2
from sklearn.cluster import KMeans
from collections import Counter

# Load the image
img = cv2.imread('1.jpg')
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# Flatten the image to a 2D array of pixels
pixels = img.reshape(-1, 3)

# Use K-Means to find the three most dominant colors
kmeans = KMeans(n_clusters=3)
kmeans.fit(pixels)
labels = kmeans.labels_

# Get the most common color in each cluster
cluster_colors = []
for cluster_label in range(3):
    cluster_mask = (labels == cluster_label)
    cluster_pixels = pixels[cluster_mask]
    cluster_color_counts = Counter(map(tuple, cluster_pixels))
    most_common_color = max(cluster_color_counts, key=cluster_color_counts.get)
    cluster_colors.append(np.array(most_common_color))

# Create a subplot with three color squares and text
plt.figure(figsize=(10, 4))
for i, color in enumerate(cluster_colors):
    # Create a small square image with the color
    color_square = np.zeros((20, 20, 3), dtype=np.uint8)
    color_square[:, :] = color

    # Add a subplot for each color
    plt.subplot(1, 3, i + 1)
    plt.imshow(color_square)
    plt.axis('off')  # Turn off axis labels and ticks
    plt.title(f"Color: RGB {color.astype(int)}")

# Show the complete plot with the most common color in each cluster
plt.tight_layout()
plt.show()

