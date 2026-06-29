import tkinter as tk
from tkinter import filedialog, messagebox
from pathlib import Path

from PIL import Image
from rembg import remove


KIOSK_SIZE = (1402, 1122)
MOBILE_SIZE = (1080, 1920)


def crop_transparent(img):
    bbox = img.getbbox()
    if bbox:
        return img.crop(bbox)
    return img


def fit_canvas(subject_img, canvas_size):

    canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))

    max_w = int(canvas_size[0] * 0.90)
    max_h = int(canvas_size[1] * 0.75)

    scale = min(
        max_w / subject_img.width,
        max_h / subject_img.height
    )

    new_w = int(subject_img.width * scale)
    new_h = int(subject_img.height * scale)

    subject = subject_img.resize((new_w, new_h), Image.LANCZOS)

    x = (canvas_size[0] - new_w) // 2
    y = (canvas_size[1] - new_h) // 2

    canvas.paste(subject, (x, y), subject)

    return canvas


def process_image(filename):

    input_path = Path(filename)

    output_dir = input_path.parent / "output"
    output_dir.mkdir(exist_ok=True)

    print(f"Verwerken: {input_path.name}")

    with open(filename, "rb") as f:
        input_data = f.read()

    print("AI achtergrond verwijderen...")

    output_data = remove(input_data)

    temp_file = output_dir / "temp.png"

    with open(temp_file, "wb") as f:
        f.write(output_data)

    boat = Image.open(temp_file).convert("RGBA")

    boat = crop_transparent(boat)

    transparent_file = output_dir / "boot_transparant.png"
    boat.save(transparent_file)

    kiosk = fit_canvas(boat, KIOSK_SIZE)
    kiosk.save(output_dir / "kiosk.png")

    mobile = fit_canvas(boat, MOBILE_SIZE)
    mobile.save(output_dir / "mobiel.png")

    print("Klaar!")

    messagebox.showinfo(
        "Finally Card",
        f"Gereed!\n\nBestanden opgeslagen in:\n{output_dir}"
    )


def select_file():

    filename = filedialog.askopenfilename(
        title="Selecteer bootfoto",
        filetypes=[
            ("Afbeeldingen", "*.png *.jpg *.jpeg *.webp")
        ]
    )

    if filename:
        process_image(filename)


root = tk.Tk()

root.title("Finally Card Image Tool v2")
root.geometry("500x220")

label = tk.Label(
    root,
    text="""
Finally Card Image Tool v2

✓ AI achtergrond verwijderen
✓ Transparante PNG maken
✓ Kiosk versie 1402x1122
✓ Mobiele versie 1080x1920
""",
    justify="center"
)

label.pack(pady=20)

button = tk.Button(
    root,
    text="Selecteer bootfoto",
    command=select_file,
    width=25,
    height=2
)

button.pack()

root.mainloop()

