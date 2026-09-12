import numpy as np
from PIL import Image, ImageFilter, ImageDraw

img_path = r'C:\Users\athul\.gemini\antigravity\brain\a4317150-93f4-4a33-afff-bf566b4d7a7e\.user_uploaded\media__1789219107608.jpg'
img = Image.open(img_path)
w, h = img.size
print(f"Original image size: {w}x{h}")

arr = np.array(img)

# Detect white paper region in center window
mask = (arr[int(h*0.3):int(h*0.5), int(w*0.25):int(w*0.75), :].mean(axis=2) > 215)
y_indices, x_indices = np.where(mask)

if len(y_indices) > 0:
    min_y = int(h*0.3) + y_indices.min()
    max_y = int(h*0.3) + y_indices.max()
    min_x = int(w*0.25) + x_indices.min()
    max_x = int(w*0.25) + x_indices.max()
    print(f"Detected 'OUT OF ORDER' sign box: Y=[{min_y}, {max_y}], X=[{min_x}, {max_x}]")
    
    pad = 14
    min_y = max(0, min_y - pad)
    max_y = min(h, max_y + pad)
    min_x = max(0, min_x - pad)
    max_x = min(w, max_x + pad)
    
    left_sample = arr[min_y:max_y, max(0, min_x-90):min_x]
    right_sample = arr[min_y:max_y, max_x:min(w, max_x+90)]
    
    box_w = max_x - min_x
    box_h = max_y - min_y
    
    blend = np.zeros((box_h, box_w, 3), dtype=np.float32)
    for col in range(box_w):
        alpha = col / float(box_w)
        left_col = left_sample[:, -1, :].astype(np.float32) if left_sample.shape[1] > 0 else arr[min_y:max_y, min_x-1, :].astype(np.float32)
        right_col = right_sample[:, 0, :].astype(np.float32) if right_sample.shape[1] > 0 else arr[min_y:max_y, max_x, :].astype(np.float32)
        blend[:, col, :] = (1 - alpha) * left_col + alpha * right_col
        
    arr[min_y:max_y, min_x:max_x] = np.clip(blend, 0, 255).astype(np.uint8)

clean_img = Image.fromarray(arr)

mask_img = Image.new('L', (w, h), 0)
draw = ImageDraw.Draw(mask_img)
if len(y_indices) > 0:
    draw.rectangle([min_x, min_y, max_x, max_y], fill=255)
    mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=10))
    
    patched_area = clean_img.filter(ImageFilter.GaussianBlur(radius=3))
    clean_img = Image.composite(patched_area, clean_img, mask_img)

dest1 = r'e:\mp5\mp5webnew-main\public\images\manufacturing\needle-sorting\main.jpeg'
dest2 = r'e:\mp5\mp5webnew-main\public\uploads\needle_sorting_real.jpg'

clean_img.save(dest1, quality=95)
clean_img.save(dest2, quality=95)
print("Successfully cleaned 'OUT OF ORDER' sign and saved needle sorting photo!")
