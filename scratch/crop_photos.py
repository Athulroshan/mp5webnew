import os
from PIL import Image

img_path = 'public/uploads/media__1789218050306.jpg'
img = Image.open(img_path)
w, h = img.size
print(f"Original size: {w}x{h}")

# Save cropped regions based on typical 5-image collage grid or horizontal/vertical splits
# Let's save standard splits to inspect
os.makedirs('public/uploads/cropped', exist_ok=True)

# Save thumbnail test crops if it's a grid
# Let's check pixel samples along vertical and horizontal lines
import numpy as np

arr = np.array(img)
print("Array shape:", arr.shape)

# Find horizontal division lines (where rows are dark or white boundaries)
# Let's check mean brightness across rows and columns
row_means = arr.mean(axis=(1, 2))
col_means = arr.mean(axis=(0, 2))

# Save slice previews
img.save('public/uploads/cropped/full.jpg')
