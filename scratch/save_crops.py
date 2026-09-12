import os
from PIL import Image

img = Image.open('public/uploads/media__1789218050306.jpg')
w, h = img.size

os.makedirs('public/uploads/cropped', exist_ok=True)

# Let's save 6 grid crops: 2 columns, 3 rows
for r in range(3):
    for c in range(2):
        left = c * (w // 2)
        top = r * (h // 3)
        right = (c + 1) * (w // 2)
        bottom = (r + 1) * (h // 3)
        crop = img.crop((left, top, right, bottom))
        crop.save(f'public/uploads/cropped/grid_{r}_{c}.jpg')

# Also test 5-photo layouts:
# e.g., 2 top, 3 bottom or 3 top, 2 bottom
print("Saved grid crops to public/uploads/cropped/")
