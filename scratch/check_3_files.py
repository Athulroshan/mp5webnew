import os
from PIL import Image

files = [
    r'C:\Users\athul\.gemini\antigravity\brain\a4317150-93f4-4a33-afff-bf566b4d7a7e\.user_uploaded\media__1789219400669.jpg',
    r'C:\Users\athul\.gemini\antigravity\brain\a4317150-93f4-4a33-afff-bf566b4d7a7e\.user_uploaded\media__1789219400740.jpg',
    r'C:\Users\athul\.gemini\antigravity\brain\a4317150-93f4-4a33-afff-bf566b4d7a7e\.user_uploaded\media__1789219400816.jpg'
]

for f in files:
    img = Image.open(f)
    print(f"{os.path.basename(f)}: size={img.size}")
