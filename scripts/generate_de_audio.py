import os
import subprocess

os.makedirs('public/audio/de', exist_ok=True)

DE_WORDS = {
    "red": "Rot",
    "blue": "Blau",
    "yellow": "Gelb",
    "green": "Grün",
    "orange": "Orange",
    "circle": "Kreis",
    "square": "Quadrat",
    "triangle": "Dreieck",
    "star": "Stern",
    "dog": "Hund",
    "cat": "Katze",
    "lion": "Löwe",
    "elephant": "Elefant",
    "monkey": "Affe",
    "frog": "Frosch",
    "bird": "Vogel",
    "fish": "Fisch",
    "car": "Auto",
    "airplane": "Flugzeug",
    "train": "Zug",
    "rocket": "Rakete",
    "boat": "Boot",
    "helicopter": "Hubschrauber",
    "bicycle": "Fahrrad",
    "truck": "Lastwagen",
    "try_again": "Versuch es noch einmal!",
    "almost_there": "Fast geschafft!",
    "you_can_do_it": "Du schaffst das!",
    "awesome": "Super!",
    "great_job": "Toll gemacht!",
}

print("Generating German audio with Anna...")
for key, word in DE_WORDS.items():
    aiff_path = f"public/audio/de/{key}.aiff"
    m4a_path = f"public/audio/de/{key}.m4a"
    wav_path = f"public/audio/de/{key}.wav"
    subprocess.run(["say", "-v", "Anna", word, "-o", aiff_path], check=True)
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", aiff_path, m4a_path], check=True)
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16", aiff_path, wav_path], check=True)
    if os.path.exists(aiff_path):
        os.remove(aiff_path)

print("German audio generation complete!")
