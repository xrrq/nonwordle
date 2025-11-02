#!/usr/bin/env bash
cat -s sources/{oald,wordle}.txt | tr '[:lower:]' '[:upper:]' | awk '/^[A-Z]{5}$/' | sort -u > words_acceptable.txt
cat -s sources/*.txt | tr '[:lower:]' '[:upper:]' | awk '/^[A-Z]{5}$/' | sort -u > words_all.txt
