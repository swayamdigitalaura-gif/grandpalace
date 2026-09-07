from PIL import Image
img = Image.open('src/assets/hero-events-spread.jpg').convert('RGB')
w, h = img.size
if max(w, h) > 1920:
    if w > h:
        nw, nh = 1920, int(h * 1920 / w)
    else:
        nh, nw = 1920, int(w * 1920 / h)
    img = img.resize((nw, nh), Image.LANCZOS)
img.save('src/assets/hero-events-spread.jpg', 'JPEG', quality=72, optimize=True)
print(img.size)
