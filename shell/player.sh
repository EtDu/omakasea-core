#!/usr/bin/bash
ffmpeg -re -i $1 -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -ar 44100 -f flv $2