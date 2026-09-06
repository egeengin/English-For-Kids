#!/bin/bash
set -e

mkdir -p public/audio/en public/audio/tr

declare -A EN_WORDS=(
  ["red"]="Red"
  ["blue"]="Blue"
  ["yellow"]="Yellow"
  ["green"]="Green"
  ["orange"]="Orange"
  ["circle"]="Circle"
  ["square"]="Square"
  ["triangle"]="Triangle"
  ["star"]="Star"
  ["dog"]="Dog"
  ["cat"]="Cat"
  ["lion"]="Lion"
  ["elephant"]="Elephant"
  ["monkey"]="Monkey"
  ["frog"]="Frog"
  ["bird"]="Bird"
  ["fish"]="Fish"
  ["car"]="Car"
  ["airplane"]="Airplane"
  ["train"]="Train"
  ["rocket"]="Rocket"
  ["boat"]="Boat"
  ["helicopter"]="Helicopter"
  ["bicycle"]="Bicycle"
  ["truck"]="Truck"
  ["try_again"]="Try again!"
  ["almost_there"]="Almost there!"
  ["you_can_do_it"]="You can do it!"
  ["awesome"]="Awesome!"
  ["great_job"]="Great job!"
)

declare -A TR_WORDS=(
  ["red"]="Kırmızı"
  ["blue"]="Mavi"
  ["yellow"]="Sarı"
  ["green"]="Yeşil"
  ["orange"]="Turuncu"
  ["circle"]="Daire"
  ["square"]="Kare"
  ["triangle"]="Üçgen"
  ["star"]="Yıldız"
  ["dog"]="Köpek"
  ["cat"]="Kedi"
  ["lion"]="Aslan"
  ["elephant"]="Fil"
  ["monkey"]="Maymun"
  ["frog"]="Kurbağa"
  ["bird"]="Kuş"
  ["fish"]="Balık"
  ["car"]="Araba"
  ["airplane"]="Uçak"
  ["train"]="Tren"
  ["rocket"]="Roket"
  ["boat"]="Gemi"
  ["helicopter"]="Helikopter"
  ["bicycle"]="Bisiklet"
  ["truck"]="Kamyon"
)

echo "Generating English audio files..."
for key in "${!EN_WORDS[@]}"; do
  word="${EN_WORDS[$key]}"
  say -v Samantha "$word" -o "public/audio/en/${key}.aiff"
  afconvert -f m4af -d aac "public/audio/en/${key}.aiff" "public/audio/en/${key}.m4a"
  afconvert -f WAVE -d LEI16 "public/audio/en/${key}.aiff" "public/audio/en/${key}.wav"
  rm "public/audio/en/${key}.aiff"
done

echo "Generating Turkish audio files..."
for key in "${!TR_WORDS[@]}"; do
  word="${TR_WORDS[$key]}"
  say -v Yelda "$word" -o "public/audio/tr/${key}.aiff"
  afconvert -f m4af -d aac "public/audio/tr/${key}.aiff" "public/audio/tr/${key}.m4a"
  afconvert -f WAVE -d LEI16 "public/audio/tr/${key}.aiff" "public/audio/tr/${key}.wav"
  rm "public/audio/tr/${key}.aiff"
done

echo "Audio generation complete!"
ls -lh public/audio/en/ | head -n 10
