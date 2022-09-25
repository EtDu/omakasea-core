#!/usr/bin/bash

ffmpeg -i $1 -c:v copy -c:a copy -crf 20 -preset slow -hls_list_size 1 $2
