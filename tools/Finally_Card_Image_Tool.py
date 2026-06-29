
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image
import numpy as np
from pathlib import Path

OUTPUT_KIOSK = (1402, 1122)
OUTPUT_MOBILE = (1080, 1920)

def process_image(input_path):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    rgb = data[:, :, :3]

    corners = [data[0,0,:3], data[0,-1,:3], data[-1,0,:3], data[-1,-1,:3]]
    avg = np.mean(corners, axis=0)
    dark = np.mean(avg) < 128

    threshold = 25
    if dark:
        mask = np.all(rgb < threshold, axis=2)
        subject = np.any(rgb > threshold, axis=2)
    else:
        mask = np.all(rgb > (255-threshold), axis=2)
        subject = np.any(rgb < (255-threshold), axis=2)

    data[mask, 3] = 0

    rows = np.any(subject, axis=1)
    cols = np.any(subject, axis=0)

    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]

    margin = 20
    rmin = max(0, rmin-margin)
    rmax = min(data.shape[0]-1, rmax+margin)
    cmin = max(0, cmin-margin)
    cmax = min(data.shape[1]-1, cmax+margin)

    cropped = Image.fromarray(data[rmin:rmax+1, cmin:cmax+1], "RGBA")
    return cropped

def fit_canvas(subject_img, canvas_size):
    canvas = Image.new("RGBA", canvas_size, (0,0,0,0))

    max_w = int(canvas_size[0] * 0.9)
    max_h = int(canvas_size[1] * 0.75)

    scale = min(max_w / subject_img.width, max_h / subject_img.height)
    new_size = (int(subject_img.width * scale), int(subject_img.height * scale))

    subject = subject_img.resize(new_size, Image.LANCZOS)

    x = (canvas_size[0] - subject.width) // 2
    y = (canvas_size[1] - subject.height) // 2

    canvas.paste(subject, (x, y), subject)
    return canvas

def run():
    filename = filedialog.askopenfilename(
        title="Selecteer bootfoto",
        filetypes=[("Images", "*.png *.jpg *.jpeg *.webp")]
    )

    if not filename:
        return

    outdir = Path(filename).parent / "output"
    outdir.mkdir(exist_ok=True)

    subject = process_image(filename)

    transparent = outdir / "boot_transparant.png"
    subject.save(transparent)

    kiosk = fit_canvas(subject, OUTPUT_KIOSK)
    kiosk.save(outdir / "kiosk.png")

    mobile = fit_canvas(subject, OUTPUT_MOBILE)
    mobile.save(outdir / "mobiel.png")

    messagebox.showinfo(
        "Finally Card Tool",
        f"Klaar!\n\nBestanden opgeslagen in:\n{outdir}"
    )

root = tk.Tk()
root.title("Finally Card Image Tool")
root.geometry("420x180")

label = tk.Label(
    root,
    text="Finally Card Image Tool\n\nSelecteer een bootfoto en genereer:\n- transparante PNG\n- kiosk versie\n- mobiele versie",
    justify="center"
)
label.pack(pady=20)

btn = tk.Button(root, text="Selecteer foto", command=run, height=2)
btn.pack()

root.mainloop()
input("Druk Enter om af te sluiten...")
