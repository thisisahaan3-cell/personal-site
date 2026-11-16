#!/bin/bash
# usage: make-loop.sh in.mp4 out-basename start duration [crf]
# -> public/media/<out>.mp4 (H.264, 1280x720, 24fps, no audio, faststart) + <out>.jpg poster (first frame)
set -e
IN=$1; OUT=/home/user/personal-site/public/media/$2; SS=$3; T=$4; CRF=${5:-27}
VF="scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24,format=yuv420p"
/usr/bin/ffmpeg -v error -y -ss "$SS" -i "$IN" -t "$T" -an -vf "$VF" -c:v libx264 -preset slow -crf "$CRF" -maxrate 1300k -bufsize 2600k -movflags +faststart "$OUT.mp4"
/usr/bin/ffmpeg -v error -y -i "$OUT.mp4" -frames:v 1 -q:v 4 -update 1 "$OUT.jpg"
ls -l "$OUT.mp4" "$OUT.jpg" | awk '{print $5, $9}'
