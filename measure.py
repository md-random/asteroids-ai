from PIL import Image

img = Image.open('/Users/random/.gemini/antigravity-ide/brain/4b30e8a9-7771-480a-977a-6dc92a10b6e9/.user_uploaded/media_1789938411254.png').convert('RGB')
pixels = img.load()

# find the bounding box of #333 border (which is (51,51,51))
min_x, min_y = img.size[0], img.size[1]
max_x, max_y = 0, 0

for x in range(img.size[0]):
    for y in range(img.size[1]):
        r,g,b = pixels[x,y]
        if r > 20 or g > 20 or b > 20: # anything not black
            min_x = min(min_x, x)
            max_x = max(max_x, x)
            min_y = min(min_y, y)
            max_y = max(max_y, y)

print(f"Content box: {min_x}, {min_y} to {max_x}, {max_y}")
print(f"Content size: {max_x - min_x} x {max_y - min_y}")
