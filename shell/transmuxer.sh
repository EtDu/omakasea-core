#!/usr/bin/bash

ffmpeg -i $1 -c:v copy -c:a copy -hls_list_size 1 $2
