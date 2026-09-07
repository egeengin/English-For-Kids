import os
import subprocess

os.makedirs('public/audio/en', exist_ok=True)
os.makedirs('public/audio/tr', exist_ok=True)
os.makedirs('public/audio/de', exist_ok=True)

EN_WORDS = {
    # Original curriculum
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

    # Classroom scene objects
    "backpack": "Backpack",
    "pencil": "Pencil",
    "clock": "Clock",
    "apple": "Apple",
    "book": "Book",
    "globe": "Globe",
    "scissors": "Scissors",

    # Playground scene objects
    "slide": "Slide",
    "swing": "Swing",
    "soccer_ball": "Soccer ball",
    "balloon": "Balloon",
    "kite": "Kite",
    "tree": "Tree",
    "skateboard": "Skateboard",

    # City scene objects
    "school_bus": "School bus",
    "police_car": "Police car",
    "traffic_light": "Traffic light",
    "scooter": "Scooter",
    "stop_sign": "Stop sign",
    "bridge": "Bridge",
    "building": "Building",

    # Conversational story phrases
    "good_morning": "Good morning!",
    "good_night": "Good night!",
    "hello_leo": "Hello Leo!",
    "time_for_school": "Time for school!",
    "breakfast_time": "Breakfast time!",
    "milk_and_bread": "Milk and bread, please!",
    "no_thank_you": "No, thank you.",
    "yes_please": "Yes, please!",
    "are_you_ready": "Are you ready?",
    "lets_go": "Yes, let's go!",
    "how_are_you": "How are you today?",
    "i_am_happy": "I am happy!",
    "i_am_sleepy": "I am sleepy.",
    "what_is_your_name": "What is your name?",
    "my_name_is_leo": "My name is Leo!",
    "lets_play": "Yes, let's play!",
    "see_you_tomorrow": "See you tomorrow!",
    "goodbye": "Goodbye!",
    "welcome_to_school": "Welcome to school!",
    "teacher": "Teacher",
    "friend": "Friend",
    "school": "School",
    "deniz": "Deniz",
    "hello_deniz": "Hello Deniz!",
    "my_name_is_deniz": "My name is Deniz!",
    "good_morning_deniz": "Good morning, Deniz!",
    "goodbye_deniz": "Goodbye Deniz!",
}

TR_WORDS = {
    # Original curriculum
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
    "try_again": "Tekrar dene!",
    "almost_there": "Neredeyse başardın!",
    "you_can_do_it": "Yapabilirsin!",
    "awesome": "Harika!",
    "great_job": "Tebrikler!",

    # Classroom
    "backpack": "Sırt çantası",
    "pencil": "Kalem",
    "clock": "Saat",
    "apple": "Elma",
    "book": "Kitap",
    "globe": "Küre",
    "scissors": "Makas",

    # Playground
    "slide": "Kaydırak",
    "swing": "Salıncak",
    "soccer_ball": "Futbol topu",
    "balloon": "Balon",
    "kite": "Uçurtma",
    "tree": "Ağaç",
    "skateboard": "Kaykay",

    # City
    "school_bus": "Okul servisi",
    "police_car": "Polis arabası",
    "traffic_light": "Trafik ışığı",
    "scooter": "Skuter",
    "stop_sign": "Dur tabelası",
    "bridge": "Köprü",
    "building": "Bina",

    # Story phrases
    "good_morning": "Günaydın!",
    "good_night": "İyi geceler!",
    "hello_leo": "Merhaba Leo!",
    "time_for_school": "Okul vakti!",
    "breakfast_time": "Kahvaltı vakti!",
    "milk_and_bread": "Süt ve ekmek, lütfen!",
    "no_thank_you": "Hayır, teşekkürler.",
    "yes_please": "Evet, lütfen!",
    "are_you_ready": "Hazır mısın?",
    "lets_go": "Evet, gidelim!",
    "how_are_you": "Bugün nasılsın?",
    "i_am_happy": "Ben mutluyum!",
    "i_am_sleepy": "Uykum var.",
    "what_is_your_name": "Adın ne?",
    "my_name_is_leo": "Benim adım Leo!",
    "lets_play": "Evet, hadi oynayalım!",
    "see_you_tomorrow": "Yarın görüşürüz!",
    "goodbye": "Hoşça kal!",
    "welcome_to_school": "Okula hoş geldin!",
    "teacher": "Öğretmen",
    "friend": "Arkadaş",
    "school": "Okul",
    "deniz": "Deniz",
    "hello_deniz": "Merhaba Deniz!",
    "my_name_is_deniz": "Benim adım Deniz!",
    "good_morning_deniz": "Günaydın Deniz!",
    "goodbye_deniz": "Güle güle Deniz!",
}

DE_WORDS = {
    # Original curriculum
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
    "try_again": "Versuche es noch einmal!",
    "almost_there": "Fast geschafft!",
    "you_can_do_it": "Du schaffst das!",
    "awesome": "Super!",
    "great_job": "Toll gemacht!",

    # Classroom
    "backpack": "Rucksack",
    "pencil": "Bleistift",
    "clock": "Uhr",
    "apple": "Apfel",
    "book": "Buch",
    "globe": "Globus",
    "scissors": "Schere",

    # Playground
    "slide": "Rutsche",
    "swing": "Schaukel",
    "soccer_ball": "Fußball",
    "balloon": "Luftballon",
    "kite": "Drachen",
    "tree": "Baum",
    "skateboard": "Skateboard",

    # City
    "school_bus": "Schulbus",
    "police_car": "Polizeiauto",
    "traffic_light": "Ampel",
    "scooter": "Roller",
    "stop_sign": "Stoppschild",
    "bridge": "Brücke",
    "building": "Gebäude",

    # Story phrases
    "good_morning": "Guten Morgen!",
    "good_night": "Gute Nacht!",
    "hello_leo": "Hallo Leo!",
    "time_for_school": "Zeit für die Schule!",
    "breakfast_time": "Frühstückszeit!",
    "milk_and_bread": "Milch und Brot, bitte!",
    "no_thank_you": "Nein, danke.",
    "yes_please": "Ja, bitte!",
    "are_you_ready": "Bist du bereit?",
    "lets_go": "Ja, los geht's!",
    "how_are_you": "Wie geht es dir heute?",
    "i_am_happy": "Ich bin glücklich!",
    "i_am_sleepy": "Ich bin müde.",
    "what_is_your_name": "Wie heißt du?",
    "my_name_is_leo": "Ich heiße Leo!",
    "lets_play": "Ja, lass uns spielen!",
    "see_you_tomorrow": "Bis morgen!",
    "goodbye": "Tschüss!",
    "welcome_to_school": "Willkommen in der Schule!",
    "teacher": "Lehrerin",
    "friend": "Freund",
    "school": "Schule",
    "deniz": "Deniz",
    "hello_deniz": "Hallo Deniz!",
    "my_name_is_deniz": "Ich heiße Deniz!",
    "good_morning_deniz": "Guten Morgen, Deniz!",
    "goodbye_deniz": "Tschüss Deniz!",
}

print("Generating English audio with Samantha...")
for key, word in EN_WORDS.items():
    m4a_path = f"public/audio/en/{key}.m4a"
    wav_path = f"public/audio/en/{key}.wav"
    if not os.path.exists(m4a_path) or not os.path.exists(wav_path):
        aiff_path = f"public/audio/en/{key}.aiff"
        subprocess.run(["say", "-v", "Samantha", word, "-o", aiff_path], check=True)
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", aiff_path, m4a_path], check=True)
        subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16", aiff_path, wav_path], check=True)
        if os.path.exists(aiff_path):
            os.remove(aiff_path)

print("Generating Turkish audio with Yelda...")
for key, word in TR_WORDS.items():
    m4a_path = f"public/audio/tr/{key}.m4a"
    wav_path = f"public/audio/tr/{key}.wav"
    if not os.path.exists(m4a_path) or not os.path.exists(wav_path):
        aiff_path = f"public/audio/tr/{key}.aiff"
        subprocess.run(["say", "-v", "Yelda", word, "-o", aiff_path], check=True)
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", aiff_path, m4a_path], check=True)
        subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16", aiff_path, wav_path], check=True)
        if os.path.exists(aiff_path):
            os.remove(aiff_path)

print("Generating German audio with Anna...")
for key, word in DE_WORDS.items():
    m4a_path = f"public/audio/de/{key}.m4a"
    wav_path = f"public/audio/de/{key}.wav"
    if not os.path.exists(m4a_path) or not os.path.exists(wav_path):
        aiff_path = f"public/audio/de/{key}.aiff"
        subprocess.run(["say", "-v", "Anna", word, "-o", aiff_path], check=True)
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", aiff_path, m4a_path], check=True)
        subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16", aiff_path, wav_path], check=True)
        if os.path.exists(aiff_path):
            os.remove(aiff_path)

print("Audio generation complete for all languages!")
