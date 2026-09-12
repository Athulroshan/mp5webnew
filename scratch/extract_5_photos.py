import os
from PIL import Image

img_path = 'public/uploads/media__1789218050306.jpg'
img = Image.open(img_path)
w, h = img.size

# Let's inspect if media__1789218050306.jpg is a single photo or collage
# We can save 5 distinct cropped photos for:
# 1. Yarn Stacking Area / Greige Storage: photo 1
# 2. Fabric Inspection Light Table: photo 2
# 3. Fabric Stacking Area: photo 3
# 4. Cut Pattern / Approved Patterns: photo 4
# 5. Fabric Stacking Rolls: photo 5

# Let's crop grid regions:
# Top Left: (0, 0, w//2, h//2)
# Top Right: (w//2, 0, w, h//2)
# Bottom Left: (0, h//2, w//2, h)
# Bottom Right: (w//2, h//2, w, h)

crop_top_left = img.crop((0, 0, 512, 384))
crop_top_right = img.crop((512, 0, 1024, 384))
crop_bot_left = img.crop((0, 384, 512, 768))
crop_bot_right = img.crop((512, 384, 1024, 768))

# Save crops to public/images/manufacturing directories
dest_map = {
    'yarn-stacking-area': crop_top_left,       # Greige Fabric Ready for Inspection
    'fabric-inspection': crop_top_right,        # Fabric Inspection Light Table
    'fabric-stacking': crop_bot_left,           # Fabric Stacking Area Column B
    'cut-pattern': crop_bot_right,              # Approved Patterns Rack
}

for name, cropped in dest_map.items():
    folder = f'public/images/manufacturing/{name}'
    os.makedirs(folder, exist_ok=True)
    cropped.save(f'{folder}/factory_photo.jpeg', quality=95)
    print(f"Saved {folder}/factory_photo.jpeg ({cropped.size[0]}x{cropped.size[1]})")

print("Successfully saved cropped factory photos!")
