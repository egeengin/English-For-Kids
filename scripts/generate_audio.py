import os
import subprocess

os.makedirs('public/audio/en', exist_ok=True)
os.makedirs('public/audio/tr', exist_ok=True)

EN_WORDS = {
    "red": "Red",
    "blue": "Blue",
    "yellow": "Yellow",
    "green": "Green",
    "orange": "Orange",
    "circle": "Circle",
    "square": "Square",
    "triangle": "Triangle",
    "star": "Star",
    "dog": "Dog",
    "cat": "Cat",
    "lion": "Lion",
    "elephant": "Elephant",
    "monkey": "Monkey",
    "frog": "Frog",
    "bird": "Bird",
    "fish": "Fish",
    "car": "Car",
    "airplane": "Airplane",
    "train": "Train",
    "rocket": "Rocket",
    "boat": "Boat",
    "helicopter": "Helicopter",
    "bicycle": "Bicycle",
    "truck": "Truck",
    "try_again": "Try again!",
    "almost_there": "Almost there!",
    "you_can_do_it": "You can do it!",
    "awesome": "Awesome!",
    "great_job": "Great job!",
}

TR_WORDS = {
    "red": "Kırmızı",
    "blue": "Mavi",
    "yellow": "Sarı",
    "green": "Yeşil",
    "orange": "Turuncu",
    "circle": "Daire",
    "square": "Kare",
    "triangle": "Üçgen",
    "star": "Yıldız",
    "dog": "Köpek",
    "cat": "Kedi",
    "lion": "Aslan",
    "elephant": "Fil",
    "monkey": "Maymun",
    "frog": "Kurbağa",
    "bird": "Kuş",
    "fish": "Balık",
    "car": "Araba",
    "airplane": "Uçak",
    "train": "Tren",
    "rocket": "Roket",
    "boat": "Gemi",
    "helicopter": "Helikopter",
    "bicycle": "Bisiklet",
    "truck": "Kamyon",
}

print("Generating English audio with Samantha...")
for key, word in EN_WORDS.items():
    aiff_path = f"public/audio/en/{key}.aiff"
    m4a_path = f"public/audio/en/{key}.m4a"
    wav_path = f"public/audio/en/{key}.wav"
    subprocess.run(["say", "-v", "Samantha", word, "-o", aiff_path], check=True)
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", aiff_path, m4a_path], check=True)
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16", aiff_path, wav_path], check=True)
    if os.path.exists(aiff_path):
        os.remove(aiff_path)

print("Generating Turkish audio with Yelda...")
for key, word in TR_WORDS.items():
    aiff_path = f"public/audio/tr/{key}.aiff"
    m4a_path = f"public/audio/tr/{key}.m4a"
    wav_path = f"public/audio/tr/{key}.wav"
    subprocess.run(["say", "-v", "Yelda", word, "-o", aiff_path], check=True)
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", aiff_path, m4a_path], check=True)
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16", aiff_path, wav_path], check=True)
    if os.path.exists(aiff_path):
        os.remove(aiff_path)

print("Audio generation complete!")
