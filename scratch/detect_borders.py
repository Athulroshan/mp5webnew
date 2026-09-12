from PIL import Image
import numpy as np

img = Image.open('public/uploads/media__1789218050306.jpg')
arr = np.array(img)
h, w, c = arr.shape

# Let's inspect horizontal and vertical gradients to find boundary lines
diff_y = np.abs(np.diff(arr.astype(float), axis=0)).mean(axis=(1, 2))
diff_x = np.abs(np.diff(arr.astype(float), axis=1)).mean(axis=(0, 2))

print("Top 10 Y boundaries (horizontal lines):")
y_indices = np.argsort(diff_y)[::-1][:15]
for idx in sorted(y_indices):
    print(f"y={idx}: diff={diff_y[idx]:.2f}")

print("\nTop 10 X boundaries (vertical lines):")
x_indices = np.argsort(diff_x)[::-1][:15]
for idx in sorted(x_indices):
    print(f"x={idx}: diff={diff_x[idx]:.2f}")
