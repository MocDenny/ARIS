#!/bin/bash

export DISPLAY=:0
export XAUTHORITY=/root/.Xauthority

sleep 15

for i in $(seq 1 60); do
    if ss -ltn | grep -q ":3000"; then
        break
    fi
    sleep 1
done

pkill -f "chromium.*localhost:3000" 2>/dev/null || true

sleep 2

/usr/bin/chromium --app=http://localhost:3000 --start-fullscreen --kiosk &