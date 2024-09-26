#!/bin/bash


# Clear Chromium browser cache
rm -rf ~/.cache/chromium/Default/Cache/*
rm -rf ~/.config/chromium/Default/Service\ Worker/CacheStorage/*
rm -rf ~/.config/chromium/Default/Code\ Cache/js/*


sleep 1
# Launch Chromium browser in kiosk mode
/usr/bin/chromium-browser --kiosk --disable-restore-session-state http://localhost:5000/saleem

